import { integer, text } from "drizzle-orm/pg-core";
import { Struct } from "drizzle-struct/back-end";
import { attemptAsync } from "ts-utils/check";

export namespace Picklist {
    export const Lists = new Struct({
        name: 'picklists',
        structure: {
            eventKey: text('event_key').notNull(),
            name: text('name').notNull(),
            description: text('description').notNull(),
            order: integer('order').notNull(),
        },
    });

    export const Teams = new Struct({
        name: 'picklist_teams',
        structure: {
            picklist: text('picklist').notNull(),
            team: integer('team').notNull(),
            order: integer('order').notNull(),
            reason: text('reason').notNull(),
        },
    });

    export const Comments = new Struct({
        name: 'picklist_comments',
        structure: {
            picklist: text('picklist').notNull(),
            team: integer('team').notNull(),
            comment: integer('suggestion').notNull(),
        },
    });

    export const getLists = (eventKey: string) => {
        return attemptAsync(async () => {
            const lists = (await Lists.fromProperty('eventKey', eventKey, { type: 'stream', }).await()).unwrap();
            return Promise.all(lists.map(async l => {
                const teams = (await Teams.fromProperty('picklist', l.id, { type: 'stream', }).await()).unwrap();
                const comments = (await Comments.fromProperty('picklist', l.id, { type: 'stream', }).await()).unwrap();
                return {
                    list: l,
                    teams: teams.map(t => ({
                        team: t,
                        comments: comments.filter(c => c.data.team === t.data.team),
                    })),
                };
            }));
        });
    }
}

export const _list = Picklist.Lists.table;
export const _teams = Picklist.Teams.table;
export const _comments = Picklist.Comments.table;