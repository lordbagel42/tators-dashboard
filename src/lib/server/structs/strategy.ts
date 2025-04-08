import { integer, text } from 'drizzle-orm/pg-core';
import { Struct } from 'drizzle-struct/back-end';
import { createEntitlement } from '../utils/entitlements';

export namespace Strategy {
	export const Whiteboards = new Struct({
		name: 'whiteboards',
		structure: {
			strategyId: text('strategy_id').notNull(),
			board: text('board').notNull(),
			name: text('name').notNull()
		},
		generators: {
			universe: () => '2122'
		}
	});

	export const Strategy = new Struct({
		name: 'strategy',
		structure: {
			eventKey: text('event_key').notNull(),
			matchNumber: integer('match_number').notNull(),
			compLevel: text('comp_level').notNull(),
			name: text('name').notNull(),
			createdBy: text('created_by').notNull(),
			red1: integer('red1').notNull(),
			red2: integer('red2').notNull(),
			red3: integer('red3').notNull(),
			blue1: integer('blue').notNull(),
			blue2: integer('blue2').notNull(),
			blue3: integer('blue3').notNull(),
		},
		generators: {
			universe: () => '2122'
		}
	});

	export const Alliances = new Struct({
		name: 'alliances',
		structure: {
			name: text('name').notNull(),
			eventKey: text('event_key').notNull(),
			team1: integer('team1').notNull(),
			team2: integer('team2').notNull(),
			team3: integer('team3').notNull(),
			team4: integer('team4').notNull()
		},
		generators: {
			universe: () => '2122'
		}
	});

	createEntitlement({
		name: 'view-strategy',
		structs: [Whiteboards, Strategy, Alliances],
		permissions: ['whiteboards:read:*', 'strategy:read:*', 'alliances:read:*'],
		group: 'Strategy'
	});
}

export const _strategyWhiteboardsTable = Strategy.Whiteboards.table;
export const _strategyTable = Strategy.Strategy.table;
export const _strategyAlliancesTable = Strategy.Alliances.table;
