import { attemptAsync, resolveAll } from 'ts-utils/check';
import { Event, Team } from './tba';
import { z } from 'zod';
import { Scouting } from '../structs/scouting';
import { $Math } from 'ts-utils/math';
import { Trace, TraceSchema, type TraceArray } from 'tatorscout/trace';
import terminal from './terminal';
import { DB } from '../db';
import { and, eq } from 'drizzle-orm';
import { fail, type RequestEvent } from '@sveltejs/kit';
import { ServerCode } from 'ts-utils/status';

export const auth = (event: RequestEvent) => {
	const key = event.request.headers.get('X-Auth-Key');
	if (key !== process.env.WEBHOOK_AUTH_KEY) {
		console.error('Unauthorized webhook ping event', key, process.env.WEBHOOK_AUTH_KEY);
		throw fail(ServerCode.unauthorized, {
			message: 'Unauthorized'
		});
	}
};

type ColType = number | string | undefined | void;
export const summarize = async (eventKey: string) => {
	return attemptAsync(async () => {
		const event = (await Event.getEvent(eventKey)).unwrap();

		if (event.tba.year !== 2025) throw new Error('Only 2025 events are currently supported');

		const cache = new Map<number, { trace: TraceArray; match: Scouting.MatchScoutingData }[]>();

		const getAllTraces = async (team: Team) => {
			const cached = cache.get(team.tba.team_number);
			if (cached) return cached;
			const matchScouting = (
				await Scouting.getTeamScouting(team.tba.team_number, event.tba.key)
			).unwrap();
			const data = matchScouting.map((s) => ({
				trace: TraceSchema.parse(JSON.parse(s.data.trace)) as TraceArray,
				match: s
			}));
			cache.set(team.tba.team_number, data);
			return data;
		};

		const getScores = async (team: Team) => {
			try {
				const traces = await getAllTraces(team);
				if (!traces) throw new Error('No traces found');
				return traces.map((t) =>
					Trace.score.parse2025(t.trace, (t.match.data.alliance || 'red') as 'red' | 'blue')
				);
			} catch (error) {
				terminal.error(`Error pulling scores for team ${team.tba.team_number}`, error);
				throw error;
			}
		};

		const getPitScouting = async (requestedQuestion: string, team: Team) => {
			try {
				const res = await DB.select()
					.from(Scouting.PIT.Questions.table)
					.innerJoin(
						Scouting.PIT.Groups.table,
						eq(Scouting.PIT.Groups.table.id, Scouting.PIT.Questions.table.groupId)
					)
					.innerJoin(
						Scouting.PIT.Sections.table,
						eq(Scouting.PIT.Sections.table.id, Scouting.PIT.Groups.table.sectionId)
					)
					.innerJoin(
						Scouting.PIT.Answers.table,
						eq(Scouting.PIT.Answers.table.questionId, Scouting.PIT.Questions.table.id)
					)
					.where(
						and(
							eq(Scouting.PIT.Answers.table.team, team.tba.team_number),
							eq(Scouting.PIT.Sections.table.eventKey, event.tba.key)
						)
					);

				const questions = res.map((r) => Scouting.PIT.Questions.Generator(r.pit_questions));

				const question = questions.find((q) => q.data.key === requestedQuestion);
				if (!question) return undefined;

				const [answer] = await DB.select()
					.from(Scouting.PIT.Answers.table)
					.where(
						and(
							eq(Scouting.PIT.Answers.table.team, team.tba.team_number),
							eq(Scouting.PIT.Answers.table.questionId, question.id)
						)
					);

				if (answer) return z.array(z.string()).parse(JSON.parse(Scouting.PIT.Answers.Generator(answer).data.answer))[0];
				return undefined;
			} catch (error) {
				terminal.error(`Error pulling pitscouting for team: ${team}`, error);
				throw error;
			}
		};

		const yearBreakdown = Trace.score.yearBreakdown[2025];

		const t = new Table(eventKey);
		t.column('Team Number', (t) => t.tba.team_number);
		t.column('Team Name', (t) => t.tba.nickname || 'unkown');
		t.column('Rank', (t) => t.getStatus().then((s) => s.unwrap()?.qual?.ranking.rank));
		t.column('Average velocity', async (t) => {
			const matchScouting = (await Scouting.getTeamScouting(t.tba.team_number, eventKey)).unwrap();
			return $Math.average(
				matchScouting.map((s) =>
					Trace.velocity.average(TraceSchema.parse(JSON.parse(s.data.trace)) as TraceArray)
				)
			);
		});
		t.column('Checks', async (t) => {
			const matchScouting = (await Scouting.getTeamScouting(t.tba.team_number, eventKey)).unwrap();
			return matchScouting
				.map((s) => z.array(z.string()).parse(JSON.parse(s.data.checks)))
				.flat()
				.join('\n ');
		});
		t.column('Weight', async (t) => {
			return getPitScouting('robot_weight', t);
		});
		t.column('Height', async (t) => {
			return getPitScouting('robot_height', t);
		});
		t.column('Width', async (t) => {
			return getPitScouting('robot_width', t);
		});
		t.column('Length', async (t) => {
			return getPitScouting('robot_length', t);
		});
		t.column('Drivetrain', async (t) => {
			return getPitScouting('robot_drivetrain', t);
		});
		t.column('Driver Practice', async (t) => {
			return getPitScouting('robot_drive_practice', t);
		});
		t.column('Average Score Contribution', async (t) => {
			const scores = await getScores(t);
			return $Math.average(scores.map((s) => s.total));
		});
		t.column('Max Score Contribution', async (t) => {
			const scores = await getScores(t);
			return Math.max(...scores.map((s) => s.total));
		});
		t.column('Average Auto Score', async (t) => {
			const scores = await getScores(t);
			return $Math.average(scores.map((s) => s.auto.total));
		});
		t.column('Max Auto Score', async (t) => {
			const scores = await getScores(t);
			return Math.max(...scores.map((s) => s.auto.total));
		});
		t.column('Average Teleop Score', async (t) => {
			const scores = await getScores(t);
			return $Math.average(
				scores.map((s) => s.teleop.total - (s.teleop.dpc + s.teleop.shc + s.teleop.park))
			);
		});
		t.column('Average Endgame Score', async (t) => {
			const scores = await getScores(t);
			return $Math.average(scores.map((s) => s.teleop.dpc + s.teleop.shc + s.teleop.park));
		});
		t.column('Max Endgame Score', async (t) => {
			const scores = await getScores(t);
			return Math.max(...scores.map((s) => s.teleop.dpc + s.teleop.shc + s.teleop.park));
		});
		t.column('Average Coral L1 Points Per Match', async (t) => {
			const scores = await getScores(t);
			return $Math.average(scores.map((s) => s.auto.cl1 + s.teleop.cl1));
		});
		t.column('Average Coral L2 Points Per Match', async (t) => {
			const scores = await getScores(t);
			return $Math.average(scores.map((s) => s.auto.cl2 + s.teleop.cl2));
		});
		t.column('Average Coral L3 Points Per Match', async (t) => {
			const scores = await getScores(t);
			return $Math.average(scores.map((s) => s.auto.cl3 + s.teleop.cl3));
		});
		t.column('Average Coral L4 Points Per Match', async (t) => {
			const scores = await getScores(t);
			return $Math.average(scores.map((s) => s.auto.cl4 + s.teleop.cl4));
		});
		t.column('Average Processor Points Per Match', async (t) => {
			const scores = await getScores(t);
			return $Math.average(scores.map((s) => s.auto.prc + s.teleop.prc));
		});
		t.column('Average Barge Points Per Match', async (t) => {
			const scores = await getScores(t);
			return $Math.average(scores.map((s) => s.auto.brg + s.teleop.brg));
		});
		t.column('Average Coral L1 Placed Per Match', async (t) => {
			const scores = await getScores(t);
			return $Math.average(
				scores.map(
					(s) => s.auto.cl1 / yearBreakdown.auto.cl1 + s.teleop.cl1 / yearBreakdown.auto.cl1
				)
			);
		});
		t.column('Average Coral L2 Placed Per Match', async (t) => {
			const scores = await getScores(t);
			return $Math.average(
				scores.map(
					(s) => s.auto.cl2 / yearBreakdown.auto.cl2 + s.teleop.cl2 / yearBreakdown.auto.cl2
				)
			);
		});
		t.column('Average Coral L3 Placed Per Match', async (t) => {
			const scores = await getScores(t);
			return $Math.average(
				scores.map(
					(s) => s.auto.cl3 / yearBreakdown.auto.cl3 + s.teleop.cl3 / yearBreakdown.auto.cl3
				)
			);
		});
		t.column('Average Coral L4 Placed Per Match', async (t) => {
			const scores = await getScores(t);
			return $Math.average(
				scores.map(
					(s) => s.auto.cl4 / yearBreakdown.auto.cl4 + s.teleop.cl4 / yearBreakdown.auto.cl4
				)
			);
		});
		t.column('Average Processor Placed Per Match', async (t) => {
			const scores = await getScores(t);
			return $Math.average(
				scores.map(
					(s) => s.auto.prc / yearBreakdown.auto.prc + s.teleop.prc / yearBreakdown.auto.prc
				)
			);
		});
		t.column('Average Barge Placed Per Match', async (t) => {
			const scores = await getScores(t);
			return $Math.average(
				scores.map(
					(s) => s.auto.brg / yearBreakdown.auto.brg + s.teleop.brg / yearBreakdown.auto.brg
				)
			);
		});
		t.column('Max Overall Coral Points', async (t) => {
			const scores = await getScores(t);
			return Math.max(
				...scores.map(
					(s) =>
						s.auto.cl1 +
						s.auto.cl2 +
						s.auto.cl3 +
						s.auto.cl4 +
						s.teleop.cl1 +
						s.teleop.cl2 +
						s.teleop.cl3 +
						s.teleop.cl4
				)
			);
		});
		t.column('Max Overall Processor Points', async (t) => {
			const scores = await getScores(t);
			return Math.max(...scores.map((s) => s.auto.prc + s.teleop.prc));
		});
		t.column('Max Overall Barge Points', async (t) => {
			const scores = await getScores(t);
			return Math.max(...scores.map((s) => s.auto.brg + s.teleop.brg));
		});
		t.column('Average Mobility Points Per Match', async (t) => {
			const scores = await getScores(t);
			return $Math.average(scores.map((s) => s.auto.mobility));
		});
		t.column('Average Overall Coral Points', async (t) => {
			const scores = await getScores(t);
			return $Math.average(
				scores.map(
					(s) =>
						s.auto.cl1 +
						s.auto.cl2 +
						s.auto.cl3 +
						s.auto.cl4 +
						s.teleop.cl1 +
						s.teleop.cl2 +
						s.teleop.cl3 +
						s.teleop.cl4
				)
			);
		});
		t.column('Average Overall Processor Points', async (t) => {
			const scores = await getScores(t);
			return $Math.average(scores.map((s) => s.auto.prc + s.teleop.prc));
		});
		t.column('Average Overall Barge Points', async (t) => {
			const scores = await getScores(t);
			return $Math.average(scores.map((s) => s.auto.brg + s.teleop.brg));
		});
		t.column('Average Shallow Climb Points', async (t) => {
			const scores = await getScores(t);
			return $Math.average(scores.map((s) => s.teleop.shc));
		});
		t.column('Average Deep Climb Points', async (t) => {
			const scores = await getScores(t);
			return $Math.average(scores.map((s) => s.teleop.dpc));
		});
		return t;
	});
};

class Table {
	public readonly columns: Column<ColType>[] = [];

	constructor(public readonly name: string) {}

	public column<T extends ColType>(name: string, fn: (team: Team) => T | Promise<T>): Column<T> {
		if (this.columns.find((c) => c.name === name))
			throw new Error(`Column ${name} already exists in table ${this.name}`);
		const c = new Column<T>(this, name, this.columns.length, fn);
		this.columns.push(c);
		return c;
	}

	serialize() {
		// TODO: Use multi-threading instead of Promise.all
		return attemptAsync(async () => {
			const event = (await Event.getEvent(this.name)).unwrap();
			const teams = (await event.getTeams()).unwrap();
			return [
				this.columns.map((c) => c.name),
				...(await Promise.all(
					teams.map(async (t) => {
						return Promise.all(
							this.columns.map(async (c) => {
								try {
									const res = await c.fn(t);
									if (typeof res === 'number') return res.toFixed(2);
									return res;
								} catch (error) {
									terminal.error(
										'Error serializing column',
										JSON.stringify({ column: c.name, error })
									);
									return 'Error';
								}
							})
						);
					})
				))
			];
		});
	}
}

class Column<T extends ColType> {
	constructor(
		public readonly table: Table,
		public readonly name: string,
		public readonly index: number,
		public readonly fn: (team: Team) => T | Promise<T>
	) {}
}
