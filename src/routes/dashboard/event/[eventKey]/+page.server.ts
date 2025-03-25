import { Scouting } from '$lib/server/structs/scouting';
import * as TBA from '$lib/server/utils/tba';
import { redirect, fail } from '@sveltejs/kit';
import { Trace, TraceSchema, type TraceArray } from 'tatorscout/trace';
import { ServerCode } from 'ts-utils/status';

export const load = async (event) => {
	if (!event.locals.account) throw redirect(ServerCode.temporaryRedirect, '/account/sign-in');
	const e = await TBA.Event.getEvent(event.params.eventKey);
	if (e.isErr()) {
		throw redirect(ServerCode.temporaryRedirect, `/404?url${event.url.href}`);
	}

	const [teams, matches] = await Promise.all([e.value.getTeams(), e.value.getMatches()]);

	if (teams.isErr()) throw fail(ServerCode.internalServerError);
	if (matches.isErr()) throw fail(ServerCode.internalServerError);

	const scouting = (
		await Scouting.MatchScouting.fromProperty('eventKey', event.params.eventKey, {
			type: 'stream'
		}).await()
	).unwrap();

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

	// remove endgame info from scouting
	const filteredSummaries = summaries.map((summary) => {
		const excludedLabels = ['shallow climb', 'deep climb', 'park'];
		return {
			...summary,
			data: Object.fromEntries(
				Object.entries(summary.data).map(([teamNumber, data]) => [
					teamNumber,
					data.filter((_, index) => !excludedLabels.includes(summary.labels[index].toLowerCase()))
				])
			),
			labels: summary.labels.filter((label) => !excludedLabels.includes(label.toLowerCase()))
		};
	});

	type EndGameRobotKey = `endGameRobot${1 | 2 | 3}`;

	const generateEndgameSummary = () => {
		const reference = matches.value.find((m) => m.tba.score_breakdown)?.tba.score_breakdown;
		const allowedStatuses = ['Parked', 'Deep Climb', 'Shallow Climb'];
		if (!reference) return null;

		const summary = {
			title: 'Endgame',
			labels: [] as string[],
			data: {} as Record<string, number[]>
		};

		// Ensure all allowed statuses are included in labels
		for (const status of allowedStatuses) {
			if (!summary.labels.includes(status)) {
				summary.labels.push(status);
			}
		}

		for (const match of matches.value) {
			const scoreBreakdown = match.tba.score_breakdown;
			if (!scoreBreakdown) continue;

			for (const alliance of ['red', 'blue'] as const) {
				const teamKeys = match.tba.alliances[alliance].team_keys.map((key) => key.slice(3));

				for (let i = 0; i < 3; i++) {
					const team = teamKeys[i];
					const status = (scoreBreakdown?.[alliance] as Record<EndGameRobotKey, string | undefined>)?.[`endGameRobot${i + 1}` as EndGameRobotKey];
					const mapped =
						status === 'DeepCage'
							? 'Deep Climb'
							: status === 'ShallowCage'
								? 'Shallow Climb'
								: status;

					if (!mapped || !allowedStatuses.includes(mapped)) continue;

					if (!summary.data[team]) {
						summary.data[team] = Array(summary.labels.length).fill(0);
					}

					const index = summary.labels.indexOf(mapped);
					summary.data[team][index]++;
				}
			}
		}

		// Ensure all teams have data for all labels
		for (const teamKey in summary.data) {
			if (Object.prototype.hasOwnProperty.call(summary.data, teamKey)) {
				summary.data[teamKey] = summary.labels.map((_, index) => summary.data[teamKey][index] || 0);
			}
		}

		// Ensure all teams are represented, even if they have no data
		for (const team of teams.value.map((t) => t.tba.team_number.toString())) {
			if (!summary.data[team]) {
				summary.data[team] = Array(summary.labels.length).fill(0);
			}
		}

		return summary;
	};

	const endgameSummary = generateEndgameSummary();

	// put the endgame before the total/average/seconds not moving and after teleop.
	if (endgameSummary) {
		const teleopIndex = filteredSummaries.findIndex((summary) => summary.title.toLowerCase() === 'teleop points');
		if (teleopIndex !== -1) {
			filteredSummaries.splice(teleopIndex + 1, 0, endgameSummary);
		} else {
			filteredSummaries.push(endgameSummary);
		}
	}

	return {
		event: e.value.tba,
		teams: teams.value.map((t) => t.tba),
		matches: matches.value.map((m) => m.tba),
		summaries: filteredSummaries
	};
};
