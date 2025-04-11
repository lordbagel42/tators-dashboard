import { Scouting } from '$lib/model/scouting.js';
import { TBAEvent, TBAMatch, TBATeam } from '$lib/utils/tba.js';
import { DataArr } from 'drizzle-struct/front-end';

export const load = (event) => {
	const events = event.data.events.map((e) => {
		const event = new TBAEvent(e.event);
		const matches = e.matches.map((m) => new TBAMatch(m, event));
		return {
			event,
			matches
		};
	});
	return {
		year: Number(event.params.year),
		teamNumber: Number(event.params.teamNumber),
		scouting: new DataArr(
			Scouting.MatchScouting,
			event.data.scouting.map((s) => Scouting.MatchScouting.Generator(s))
		),
		events,
		team: new TBATeam(event.data.team, events[0].event)
	};
};
