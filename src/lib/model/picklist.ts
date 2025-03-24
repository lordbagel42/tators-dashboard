import { browser } from "$app/environment";
import { sse } from "$lib/utils/sse";
import { desc } from "drizzle-orm";
import { Struct } from "drizzle-struct/front-end";

export namespace Picklist {
    export const Lists = new Struct({
        name: 'picklists',
        structure: {
            eventKey: 'string',
            name: 'string',
            description: 'string',
            order: 'number',
        },
        socket: sse,
        browser: browser,
    });

    export const Teams = new Struct({
        name: 'picklist_teams',
        structure: {
            picklist: 'string',
            team: 'number',
            order: 'number',
            reason: 'string',
        },
        socket: sse,
        browser: browser,
    });

    export const Comments = new Struct({
        name: 'picklist_comments',
        structure: {
            picklist: 'string',
            team: 'number',
            comment: 'number',
        },
        socket: sse,
        browser: browser,
    });

    export const newList = (eventKey: string, name: string, teams: number[]) => {};
}