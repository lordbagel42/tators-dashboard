import { attemptAsync } from "ts-utils/check";
import { Event, Team } from "./tba";
import { z } from "zod";
import { Scouting } from "../structs/scouting";
import { $Math } from "ts-utils/math";
import { Trace, TraceSchema, type TraceArray } from "tatorscout/trace";
import terminal from "./terminal";
import { DB } from "../db";
import { TBA } from "../structs/TBA";
import {
    TBAMatch,
    teamsFromMatch
} from '../shared/submodules/tatorscout-calculations/tba';

type ColType = number | string | undefined | void;

const getMatchScouting = async (teamNumber: number, eventKey: string) => {
    return attemptAsync(async () => {
        const res = await DB.all('match-scouting/from-team', {
            eventKey,
            team: teamNumber
        });

        if (res.isErr()) throw res.error;

        return res.value
            .map(m => {
                return {
                    ...m,
                    trace: JSON.parse(m.trace) as TraceArray
                };
            })
            .reverse()
            .filter((s, i, a) => {
                return (
                    a.findIndex(
                        s2 =>
                            s2.matchNumber === s.matchNumber &&
                            s.compLevel === s2.compLevel
                    ) === i
                );
            });
    });
};

export const summarize = async (teamNumber: number, eventKey: string) => {
    return attemptAsync(async () => {
        const t = new Table(eventKey);
        const pitScouting = await DB.all(
            'scouting-questions/answer-from-team',
                {
                    teamNumber,
                    eventKey
                }
            );
        const res = await getMatchScouting(
            teamNumber,
            eventKey
        );
        if (res.isErr()) throw res.error;
        const matches = res.value;

        const tbaMatches = await TBA.get<TBAMatch[]>(
            '/event/' + eventKey + '/matches'
        );

        if (tbaMatches.isErr()) throw tbaMatches.error;
        if (!tbaMatches.value)
            throw new Error('No matches found');

        const scoresRes = matches.map(m => {
            return attempt(() => {
                const match = tbaMatches.value?.find(
                    match =>
                        match.match_number === m.matchNumber &&
                        match.comp_level === m.compLevel
                );

                if (!match) throw new Error('Match not found');

                const [r1, r2, r3, b1, b2, b3] =
                    teamsFromMatch(match);

                let alliance: 'red' | 'blue';
                if ([r1, r2, r3].includes(teamNumber))
                    alliance = 'red';
                else if ([b1, b2, b3].includes(teamNumber))
                    alliance = 'blue';
                else throw new Error('Team not found in match');

                const trace = m.trace;

                return Trace.score.parse2024(trace, alliance);
            });
        });

        const scores = scoresRes
            .map(s => (s.isOk() ? s.value : null))
            .filter(Boolean);
        
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
        
        t.column('Weight', async t => {
            pitScouting.value.find(p =>
                /weight/i.test(p.question)
            )?.answer || '[]';
        });
        t.column('Height', async t => {
            pitScouting.value.find(p =>
                /height/i.test(p.question)
            )?.answer || '[]';
        });
        t.column('Width', async t => {
            pitScouting.value.find(p =>
                /width/i.test(p.question)
            )?.answer || '[]';
        });
        t.column('Length', async t => {
            pitScouting.value.find(p =>
                /length/i.test(p.question)
            )?.answer || '[]';
        });
        
        t.column('Average Score Contribution', async t => {
            scores.reduce((a, b) => a + b.total, 0) /
                scores.length,
        });
        t.column('Max Score Contribution', async t => {
            Math.max(...scores.map(s => s.total)),
        });
        t.column('Average Auto Score', async t => {
            scores.reduce((a, b) => a + b.auto.total, 0) /
                scores.length,
        });
        t.column('Max Auto Score', async t => {
            Math.max(...scores.map(s => s.auto.total)),
        });
        t.column('Average Teleop Score', async t => {
            scores.reduce((a, b) => a + b.teleop.total, 0) /
                scores.length,
        });
        t.column('Max Teleop Score', async t => {
            Math.max(...scores.map(s => s.teleop.total)),
        });
        t.column('Average Endgame Score', async t => {
            scores.reduce(
                (a, b) => a + b.endgame.total,
                0
            ) / scores.length,
        });
        t.column('Max Endgame Score', async t => {
            Math.max(...scores.map(s => s.endgame.total)),
        });
        t.column('Average Coral L1 Points Per Match', t => {
            scores.reduce((a, b) => a + b.teleop.cl1, 0) /
                scores.length,
        });
        t.column('Average Coral L2 Points Per Match', t => {
            scores.reduce((a, b) => a + b.teleop.cl2, 0) /
                scores.length,
        });
        t.column('Average Coral L3 Points Per Match', t => {
            scores.reduce((a, b) => a + b.teleop.cl3, 0) /
                scores.length,
        });
        t.column('Average Coral L4 Points Per Match', t => {
            scores.reduce((a, b) => a + b.teleop.cl4, 0) /
                scores.length,
        });
        t.column('Average Processor Points Per Match', t => {
            scores.reduce((a, b) => a + b.teleop.prc, 0) /
                scores.length,
        });
        t.column('Average Barge Points Per Match', t => {
            scores.reduce((a, b) => a + b.teleop.brg, 0) /
                scores.length
        });
        t.column('Average Coral L1 Placed Per Match', t => {
            scores.reduce((a, b) => a + b.cl1, 0) /
                scores.length,
        });
        t.column('Average Coral L2 Placed Per Match', t => {
            scores.reduce((a, b) => a + b.cl2, 0) /
                scores.length,
        });
        t.column('Average Coral L3 Placed Per Match', t => {
            scores.reduce((a, b) => a + b.cl3, 0) /
                scores.length,
        });
        t.column('Average Coral L4 Placed Per Match', t => {
            scores.reduce((a, b) => a + b.cl4, 0) /
                scores.length,
        });
        t.column('Average Processor Placed Per Match', t => {
            scores.reduce((a, b) => a + b.prc, 0) /
                scores.length,
        });
        t.column('Average Barge Placed Per Match', t => {
            scores.reduce((a, b) => a + b.brg, 0) /
                scores.length,
        });
        t.column('Max Overall Coral Points', t => {
            Math.max(...scores.map(s => s.cl4 + s.cl3 + s.cl2 + s.cl1)),
        });
        t.column('Max Overall Processor Points', t => {
            Math.max(...scores.map(s => s.cl4 + s.cl3 + s.cl2 + s.cl1)),
        });
        t.column('Max Overall Barge Points', t => {
            Math.max(...scores.map(s => s.brg)),
        });
        t.column('Average Mobility Points Per Match', t => {
            scores.reduce((a, b) => a + b.mobility, 0) /
                scores.length
        });
        t.column('Average Overall Coral Poitns', t => {
            scores.reduce(
                (a, b) => a + b.cl4 + b.cl3 + b.cl2 + b.cl1,
                0
            ) / scores.length,
        });
        t.column('Average Overall Processor Points', t => {
            scores.reduce((a, b) => a + b.prc, 0) /
                scores.length,
        });
        t.column('Average Overall Barge Points', t => {
            scores.reduce((a, b) => a + b.brg, 0) /
                scores.length,
        });
        t.column('Average Shallow Climb Points', t => {
            scores.reduce((a, b) => a + b.shc, 0) /
                scores.length,
        });
        t.column('Average Deep Climb Points', t => {
            scores.reduce((a, b) => a + b.dpc, 0) /
                scores.length,
        });
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