import { Scouting } from '$lib/server/structs/scouting.js';
import { Event, Team } from '$lib/server/utils/tba.js';
import { fail } from '@sveltejs/kit';
import type { TBATeam } from 'tatorscout/tba';

export const load = async (event) => {
	const { year, teamNumber } = event.params;
	const scouting = (await Scouting.getTeamPrescouting(Number(teamNumber), Number(year))).unwrap();
	let team: TBATeam | undefined = undefined;

	const events = await Promise.all(
		scouting.map(async (s) => {
			const event = await Event.getEvent(s.data.eventKey).unwrap();
			const matches = await event.getMatches().unwrap();
			const teams = await event.getTeams().unwrap();
			return {
				event: event.tba,
				matches: matches.map((m) => m.tba),
				teams: teams.map((t) => t.tba)
			};
		})
	);

	for (const event of events) {
		const teamData = event.teams.find((t) => t.team_number === Number(teamNumber));
		if (teamData) {
			team = teamData;
			break;
		}
	}

	if (!team) {
		throw fail(404, {
			message: 'Team not found',
			year: Number(year),
			teamNumber: Number(teamNumber),
			scouting: scouting.map((s) => s.safe()),
			events
		});
	}

	return {
		scouting: scouting.map((s) => s.safe()),
		events,
		team
	};
};
