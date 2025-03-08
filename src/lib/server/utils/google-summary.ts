import { attemptAsync } from "ts-utils/check";
import { Event, Team } from "./tba";
import { z } from "zod";
import { Scouting } from "../structs/scouting";
import { $Math } from "ts-utils/math";
import { Trace, TraceSchema, type TraceArray } from "tatorscout/trace";
import terminal from "./terminal";

type ColType = number | string | undefined | void;

export const summarize = async (eventKey: string) => {
    return attemptAsync(async () => {
        const t = new Table(eventKey);
        t.column('Team Number', t => t.tba.team_number);
        t.column('Team Name', t => t.tba.nickname || 'unkown');
        t.column('Rank', t => t.getStatus().then(s => s.unwrap()?.qual?.ranking.rank));
        // t.column('Rank Points', t => t.getStatus().then(s => s.unwrap()?.qual?.ranking.rank));
        t.column('Average velocity', async t => {
            const matchScouting = (await Scouting.getTeamScouting(t.tba.team_number, eventKey)).unwrap();
            return $Math.average(
                matchScouting.map(s => 
                    Trace.velocity.average(
                        TraceSchema.parse(JSON.parse(s.data.trace)) as TraceArray
                    )
                )
            );
        });
        t.column('Checks', async t => {
            const matchScouting = (await Scouting.getTeamScouting(t.tba.team_number, eventKey)).unwrap();
            return matchScouting.map(s => z.array(z.string()).parse(JSON.parse(s.data.checks))).flat().join('\n ');
        });
        t.column('Weight', async t => {});
        t.column('Height', async t => {});
        t.column('Width', async t => {});
        t.column('Length', async t => {});
        t.column('Average Score Contribution', async t => {});
        t.column('Max Score Contribution', async t => {});
        t.column('Average Auto Score', async t => {});
        t.column('Max Auto Score', async t => {});
        t.column('Average Teleop Score', async t => {});
        t.column('Average Endgame Score', async t => {});
        t.column('Max Endgame Score', async t => {});
        t.column('Average Coral L1 Points Per Match', t => {});
        t.column('Average Coral L2 Points Per Match', t => {});
        t.column('Average Coral L3 Points Per Match', t => {});
        t.column('Average Coral L4 Points Per Match', t => {});
        t.column('Average Processor Points Per Match', t => {});
        t.column('Average Barge Points Per Match', t => {});
        t.column('Average Coral L1 Placed Per Match', t => {});
        t.column('Average Coral L2 Placed Per Match', t => {});
        t.column('Average Coral L3 Placed Per Match', t => {});
        t.column('Average Coral L4 Placed Per Match', t => {});
        t.column('Average Processor Placed Per Match', t => {});
        t.column('Average Barge Placed Per Match', t => {});
        t.column('Max Overall Coral Points', t => {});
        t.column('Max Overall Processor Points', t => {});
        t.column('Max Overall Barge Points', t => {});
        t.column('Average Mobility Points Per Match', t => {});
        t.column('Average Overall Coral Poitns', t => {});
        t.column('Average Overall Processor Points', t => {});
        t.column('Average Overall Barge Points', t => {});
        t.column('Average Shallow Climb Points', t => {});
        t.column('Average Deep Climb Points', t => {});
        return t;
    });
};


class Table {
    public readonly columns: Column<ColType>[] = [];

    constructor(public readonly name: string) {}

    public column<T extends ColType>(name: string,  fn: (team: Team) => T | Promise<T>): Column<T> {
        if (this.columns.find(c => c.name === name)) throw new Error(`Column ${name} already exists in table ${this.name}`);
        const c = new Column<T>(this, name, this.columns.length, fn);
        this.columns.push(c);
        return c;
    }

    serialize() {
        // TODO: Use multi-threading instead of Promise.all
        return attemptAsync(async () => {
            const event = (await Event.getEvent(this.name)).unwrap();
            const teams = (await event.getTeams()).unwrap();
            return await Promise.all(teams.map(async t => {
                return Promise.all(this.columns.map(async c => {
                    try {
                        return await c.fn(t);
                    } catch (error) {
                        terminal.error('Error serializing column', { column: c.name, error });
                        return 'Error';
                    }
                }));
            }));
        });
    }
}

class Column<T extends ColType> {
    constructor(public readonly table: Table, public readonly name: string, public readonly index: number, public readonly fn: (team: Team) => T | Promise<T>) {}
}