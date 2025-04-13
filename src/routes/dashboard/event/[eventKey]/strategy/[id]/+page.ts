import { Strategy } from '$lib/model/strategy';
import { TBAEvent, TBAMatch, TBATeam } from '$lib/utils/tba.js';

export const load = (event) => {
	const e = new TBAEvent(event.data.event);
	const teams = event.data.teams.map((t) => new TBATeam(t, e));
	const matches = event.data.matches.map((m) => new TBAMatch(m, e));

	return {
		event: e,
		teams: teams,
		matches: matches,
		strategy: Strategy.Strategy.Generator(event.data.strategy),
		partners: event.data.partners.map((p) => Strategy.Partners.Generator(p)),
		opponents: event.data.opponents.map((o) => Strategy.Opponents.Generator(o))
	};
};
