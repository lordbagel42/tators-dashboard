import { Strategy } from '$lib/server/structs/strategy.js';
import { Event } from '$lib/server/utils/tba.js';
import { fail, redirect } from '@sveltejs/kit';
import { ServerCode } from 'ts-utils/status';

export const load = async (event) => {
    const strategy = await Strategy.Strategy.fromId(event.params.id).unwrap();
    if (!strategy) {
        throw redirect(ServerCode.permanentRedirect, `/dashboard/event/${event.params.eventKey}/strategy`);
    }

    const info = await Strategy.getStrategy(strategy).unwrap();
    
    const e = await Event.getEvent(event.params.eventKey).unwrap();
    const teams = await e.getTeams().unwrap();
    const matches = await e.getMatches().unwrap();
    
    return {
        strategy: info.strategy.safe(),
        partners: info.partners.map(p => p.safe()),
        opponents: info.opponents.map(o => o.safe()),
        event: e.tba,
        teams: teams.map(t => t.tba),
        matches: matches.map(m => m.tba),
    }
};