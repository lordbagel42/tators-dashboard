import { Scouting } from '$lib/server/structs/scouting.js';
import { z } from 'zod';
import terminal from '$lib/server/utils/terminal';
import { TraceSchema } from 'tatorscout/trace';
import { ServerCode } from 'ts-utils/status';
import { Account } from '$lib/server/structs/account';
import { resolveAll } from 'ts-utils/check';

export const POST = async (event) => {
	terminal.log('Event server request', event.request.url);
	const header = event.request.headers.get('X-API-KEY');

	const res = (message: string, status: ServerCode) =>
		new Response(JSON.stringify({ message }), { status });

	if (String(header) !== String(process.env.EVENT_SERVER_API_KEY)) {
		return res('Invalid API key', 401);
	}

	const parsed = z
		.object({
			checks: z.array(z.string()),
			comments: z.record(z.string(), z.string()),
			matchNumber: z.number().int(),
			teamNumber: z.number().int(),
			compLevel: z.enum(['pr', 'qm', 'qf', 'sf', 'f']),
			eventKey: z.string(),
			scout: z.string(),
			group: z.number().int(),
			trace: TraceSchema,
			prescouting: z.boolean(),
			remote: z.boolean()
		})
		.safeParse(await event.request.json());

	if (!parsed.success) {
		terminal.warn('Invalid request body', parsed.error.message);
		return res('Invalid request body: ' + parsed.error.message, 400);
	}

	const {
		checks,
		comments,
		matchNumber,
		teamNumber,
		compLevel,
		eventKey,
		scout,
		group,
		trace,
		prescouting,
		remote
	} = parsed.data;

	let accountId = '';

	const account = await Account.Account.fromProperty('username', scout, {
		type: 'single'
	});
	if (account.isOk() && account.value) {
		accountId = account.value.id;
	}

	const exists = await Scouting.getMatchScouting({
		eventKey,
		match: matchNumber,
		team: teamNumber,
		compLevel
	});

	let matchScoutingId: string;

	if (exists.isErr()) {
		terminal.error('Error getting match scouting', exists.error);
		return res('Internal server error', 500);
	}
	if (exists.value) {
		matchScoutingId = exists.value.id;
		const update = await exists.value.update({
			scoutId: scout,
			scoutGroup: group,
			prescouting,
			remote,
			trace: JSON.stringify(trace),
			checks: JSON.stringify(checks)
		});
		if (update.isErr()) {
			terminal.error('Error updating match scouting', update.error);
			return res('Internal server error', 500);
		}
	} else {
		const create = await Scouting.MatchScouting.new({
			eventKey,
			matchNumber,
			compLevel,
			team: teamNumber,
			scoutId: accountId,
			prescouting,
			remote,
			scoutGroup: group,
			trace: JSON.stringify(trace),
			checks: JSON.stringify(checks),
			scoutUsername: scout
		});
		if (create.isErr()) {
			terminal.error('Error creating match scouting', create.error);
			return res('Internal server error', 500);
		}
		matchScoutingId = create.value.id;
	}

	const commentRes = resolveAll(
		await Promise.all(
			Object.entries(comments).map(([key, value]) =>
				Scouting.TeamComments.new({
					accountId,
					team: teamNumber,
					comment: value,
					type: key,
					eventKey,
					matchScoutingId,
					scoutUsername: scout
				})
			)
		)
	);

	if (commentRes.isErr()) {
		terminal.error('Error creating comments', commentRes.error);
		return res('Internal server error', 500);
	}

	return res('Success', 200);
};
