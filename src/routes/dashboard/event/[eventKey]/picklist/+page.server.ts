import { Picklist } from '$lib/server/structs/picklist.js';
import { Event } from '$lib/server/utils/tba.js';

export const load = async (event) => {
    const lists = await Picklist.getLists(event.params.eventKey);
    const e = (await Event.getEvent(event.params.eventKey)).unwrap();
    const teams = (await e.getTeams()).unwrap();

    return {
        lists:  lists.unwrap().map(l => ({
            list: l.list.safe(),
            teams: l.teams.map(t => ({
                team: t.team.safe(),
                comments: t.comments.map(c => c.safe()),
            })),    
        })),
        eventKey: event.params.eventKey,
        event: e.tba,
        teams: teams.map(t => t.tba),
    }
};