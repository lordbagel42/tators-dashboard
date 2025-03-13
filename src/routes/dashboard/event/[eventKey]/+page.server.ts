import { Scouting } from '$lib/server/structs/scouting';
import * as TBA from '$lib/server/utils/tba';
import { redirect, fail } from '@sveltejs/kit';
import { Trace, TraceSchema, type TraceArray } from 'tatorscout/trace';
import { ServerCode } from 'ts-utils/status';
import terminal from '$lib/server/utils/terminal';

export const load = async (event) => {
	if (!event.locals.account) throw redirect(ServerCode.temporaryRedirect, '/account/sign-in');
	const e = await TBA.Event.getEvent(event.params.eventKey);
	if (e.isErr()) {
		terminal.error(e.error);
		throw fail(ServerCode.internalServerError);
	}

	const [teams, matches] = await Promise.all([e.value.getTeams(), e.value.getMatches()]);

	if (teams.isErr()) {
		terminal.error(teams.error);
		throw fail(ServerCode.internalServerError);
	}
	if (matches.isErr()) {
		terminal.error(matches.error);
		throw fail(ServerCode.internalServerError);
	}

	const scoutingRes = (
		await Scouting.MatchScouting.fromProperty('eventKey', event.params.eventKey, {
			type: 'stream'
		}).await()
	);

	if (scoutingRes.isErr()) {
		terminal.error(scoutingRes.error);
		throw fail(ServerCode.internalServerError);
	}

	const scouting = scoutingRes.value;

	const teamTraces: {
		number: number;
		traces: {
			trace: TraceArray;
			alliance: 'red' | 'blue';
		}[];
	}[] = teams.value.map((t) => ({
		number: t.tba.team_number,
		traces: scouting
			.filter((s) => s.data.team === t.tba.team_number)
			.map((s) => ({
				trace: TraceSchema.parse(JSON.parse(s.data.trace)) as TraceArray,
				alliance: s.data.alliance === 'red' ? 'red' : 'blue'
			}))
	}));

	const data: {
		number: number;
		data: {
			title: string;
			labels: string[];
			data: number[];
		}[];
	}[] = teamTraces.map((t) => {
		try {
			return {
				number: t.number,
				data:
					Trace.yearInfo[e.value.tba.year as keyof typeof Trace.yearInfo]?.summarize(t.traces) || []
			};
		} catch (error) {
			console.error(error);
			return {
				number: t.number,
				data: []
			};
		}
	});
	const summaries: {
		labels: string[];
		title: string;
		data: {
			[key: number]: number[];
		};
	}[] = [];

	const [team] = data;

	if (team) {
		summaries.push(
			...team.data.map((d) => ({
				title: d.title,
				labels: d.labels,
				data: {}
			}))
		);
	}

	for (const team of data) {
		for (const d of team.data) {
			const found = summaries.find((r) => r.title === d.title);
			if (!found) continue;
			found.data[team.number] = d.data;
		}
	}

	return {
		event: e.value.tba,
		teams: teams.value.map((t) => t.tba),
		matches: matches.value.map((m) => m.tba),
		summaries
	};
};
