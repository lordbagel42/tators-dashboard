import { Client } from 'pg';
import { config } from 'dotenv';
import { getOldTables, testAll } from './old-tables';
import { Account } from '../../src/lib/server/structs/account';
import backup from '../backup';
import restore from '../restore';
import cliProgress from 'cli-progress';
import terminal from '../../src/lib/server/utils/terminal';
import { prompt } from '../../src/lib/server/cli/utils';
import { Logs } from '../../src/lib/server/structs/log';
import { attemptAsync, resolveAll } from 'ts-utils/check';
import { Scouting } from '../../src/lib/server/structs/scouting';
import { z } from 'zod';
import { Struct } from 'drizzle-struct/back-end';
import { DB } from '../../src/lib/server/db';
import path from 'path';
import { openStructs, structActions } from '../../src/lib/server/cli/struct';
import { postBuild } from '../../src/lib/server/index';

const initDB = async () => {
	config();

	const { DB_OLD_HOST, DB_OLD_PORT, DB_OLD_USER, DB_OLD_PASS, DB_OLD_NAME } = process.env;
	const DB = new Client({
		user: DB_OLD_USER,
		database: DB_OLD_NAME,
		password: DB_OLD_PASS,
		port: Number(DB_OLD_PORT),
		host: DB_OLD_HOST,
		keepAlive: true
	});

	await DB.connect();
	return DB;
};

const reset = () => {
	return restore();
};

export default async () => {
	const oldDB = await initDB();
	const old = getOldTables(oldDB);

	// Struct.setupLogger(path.resolve(process.cwd(), 'logs', 'migration'));

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const testRes = (await testAll(old as any)).unwrap();
	if (!testRes.every(Boolean)) {
		console.error('Tests failed');
		process.exit(1);
	}

	await openStructs();

	await backup();

	resolveAll(await Promise.all(Array.from(Struct.structs).map(([, s]) => s.clear()))).unwrap();

	await postBuild();

	const streams: Promise<unknown>[] = [];

	const accountBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
	const { stream: accountStream, total: accountTotal } = (await old.Accounts.all()).unwrap();
	accountBar.start(accountTotal, 0);
	streams.push(accountStream.await());
	accountStream.pipe(async (a, i) => {
		accountBar.update(i);
		const exists = (await Account.Account.fromId(a.id)).unwrap();
		if (exists) return;
		const res = (
			await Account.Account.new({
				username: a.username,
				email: a.email,
				key: a.key,
				salt: a.salt,
				picture: a.picture || '/',
				verified: false,
				firstName: a.first_name,
				lastName: a.last_name,
				verification: ''
			}, {
				'source': 'migration',
			})
		).unwrap();

		if (a.verified) (await Account.verify(res)).unwrap();

		Logs.log({
			struct: Account.Account.data.name,
			dataId: res.id,
			accountId: 'CLI',
			message: 'Migrated account',
			type: 'create'
		});
	});

	await accountStream.await();

	accountBar.stop();

	const findAccount = async (user: string) => {
		return attemptAsync(async () => {
			const username =
				(
					(await Account.Account.fromId(user)).unwrap() ||
					(
						await Account.Account.fromProperty('username', user, {
							type: 'single'
						})
					).unwrap()
				)?.data.username ||
				(
					(await old.Accounts.fromId(user)).unwrap() ||
					(await old.Accounts.fromProperty('username', user)).unwrap()
				)?.username;
			const id = (
				await Account.Account.fromProperty('username', user, {
					type: 'single'
				})
			).unwrap()?.data.id;

			return { username, id };
		});
	};



	// const tc = await old.TeamComments.all();
	// if (tc.isErr()) return console.error('Team comment error: ', tc.error);

	// const { stream: tcStream, total: tcTotal } = tc.value;
	// const tcBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
	// tcBar.start(tcTotal, 0);

	// streams.push(tcStream.await());
	// tcStream.pipe(async (tc,i) => {
	// 	// console.log(tc);
	// 	const a = (await findAccount(tc.account_id || 'unknown')).unwrap();
	// 	console.log('a', a);
	// 	tcBar.update(i);
	// 	const res = (
	// 		await Scouting.TeamComments.new({
	// 			team: tc.team,
	// 			comment: tc.comment,
	// 			accountId: a.id || '',
	// 			matchScoutingId: tc.match_scouting_id,
	// 			type: tc.type,
	// 			eventKey: tc.event_key,
	// 			scoutUsername: a.username || 'unknown'
	// 		})
	// 	).unwrap();

	// 	Logs.log({
	// 		struct: Scouting.TeamComments.data.name,
	// 		dataId: res.id,
	// 		accountId: 'CLI',
	// 		message: 'Migrated Team Comment',
	// 		type: 'create'
	// 	});
	// });


	const msMap = new Map<string, string>();

	const msBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
	const res = await oldDB.query(`
			SELECT 
				accounts.username,
				match_scouting.*,
				matches.event_key,
				matches.match_number,
				matches.comp_level
			FROM match_scouting
			INNER JOIN matches ON match_scouting.match_id = matches.id
			INNER JOIN accounts ON match_scouting.scout_id = accounts.id OR match_scouting.scout_name = accounts.username;
		`);

	msBar.start(res.rows.length, 0);

	await Promise.all(res.rows.map(async (ms, i) => {
		msBar.update(i + 1);
		const parsed = z.object({
			team: z.number().int(),
			scout_group: z.number().int(),
			time: z.string(),
			trace: z.string(),
			checks: z.string(),
			scout_name: z.string(),
			username: z.string().optional(),
			pre_scouting: z.number().int(),
			event_key: z.string(),
			match_number: z.number().int(),
			comp_level: z.string(),
		}).safeParse(ms);

		if (!parsed.success) return console.error(parsed.error);

		const trace = z.array(z.tuple([
			z.number().nullable(),
			z.number().nullable(),
			z.number().nullable(),
			z.union([z.number(), z.string()]).nullable(),
		])).parse(JSON.parse(parsed.data.trace))
		.map(t => ([
			t[0] === null ? 0 : t[0],
			t[1] === null ? 0 : t[1],
			t[2] === null ? 0 : t[2],
			t[3] === null ? 0 : t[3].toString()
		]));

		const a =
			(await findAccount(ms.username || '')).unwrap();

		const dataRes = (
			await Scouting.MatchScouting.new({
				compLevel: ms.comp_level,
				eventKey: ms.event_key,
				matchNumber: ms.match_number,
				team: ms.team,
				scoutId: a.id || '',
				scoutGroup: ms.scout_group,
				prescouting: !!ms.pre_scouting,
				remote: false,
				trace: JSON.stringify(trace),
				checks: ms.checks,
				scoutUsername: a.username || '',
				alliance: '' // TODO: Calculate alliance
			})
		);

		if (dataRes.isErr()) return;

		msMap.set(ms.id, dataRes.value.data.id);

		Logs.log({
			struct: Scouting.MatchScouting.data.name,
			dataId: dataRes.value.id,
			accountId: 'CLI',
			message: 'Migrated Match Scouting',
			type: 'create'
		});
	}));

	msBar.stop();

	// listen for enter to exit
	await prompt({
		message: 'Press any key to exit'
	});
};
