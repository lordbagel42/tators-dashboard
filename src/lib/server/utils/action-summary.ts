// take in an array of actions
// return a table showing the totals of all actions summed
// columns are the matches
// rows are the teams
// each cell is filled with the amount of all actions summed

import { Trace, TraceSchema, type TraceArray, type Action2025 } from 'tatorscout/trace';
import { Event, Team, Match } from './tba';
import { Scouting } from '../structs/scouting';
import { teamsFromMatch } from 'tatorscout/tba';
import { attemptAsync } from 'ts-utils/check';
import { Table } from './google-summary';
import { match } from 'assert';
import type MatchActions from '$lib/components/robot-display/MatchActions.svelte';

export const actionSummary = (eventKey: string, action: Action2025) => {
	return attemptAsync(async () => {
		const event = (await Event.getEvent(eventKey)).unwrap();
		const matches = (await event.getMatches()).unwrap();

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

        const getActionCount = async (team: Team, match: Match, action: Action2025) => {
            const traces = await getAllTraces(team);
            if (!traces) throw new Error('No traces found');
            const matchTrace = traces.filter((trace) => trace.match.data.matchNumber === match.tba.match_number);
            const count = matchTrace.reduce((acc, traceData) => {
                const trace = traceData.trace;
                trace.forEach((curr) => {
                    if (curr[3] === action) {
                        acc += 1;
                    }
                });
                return acc;
            }, 0);

            return count;
        };

		const t = new Table(eventKey);
		const teams = (await event.getTeams()).unwrap();

        teams.forEach((team) => {
            t.column('Team Number', (t) => t.tba.team_number);
            matches.forEach((match) => {
                const allianceTeams = [
                    ...match.tba.alliances.red.team_keys,
                    ...match.tba.alliances.blue.team_keys
                ];

                if (allianceTeams.includes(`frc${team.tba.team_number}`)) {
                    t.column(match.tba.match_number.toString(), async (t) => {
                        return await getActionCount(t, match, action);
                    })
                } else {
                    t.column(match.tba.match_number.toString(), async () => {
                        return '';
                    });
                }
            });
        })

		return t;
	});
};
