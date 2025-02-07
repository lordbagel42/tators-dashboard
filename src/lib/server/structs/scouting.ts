import { boolean } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { text } from 'drizzle-orm/pg-core';
import { Struct, StructStream } from 'drizzle-struct/back-end';
import { createEntitlement } from '../utils/entitlements';
import { z } from 'zod';
import { attemptAsync } from 'ts-utils';
import { DB } from '../db';
import { eq } from 'drizzle-orm';
import { Session } from './session';

export namespace Scouting {
	export const MatchScouting = new Struct({
		name: 'match_scouting',
		structure: {
			matchId: text('match_id').notNull(),
			team: integer('team').notNull(),
			scoutId: text('scout_id').notNull(),
			scoutGroup: text('scout_group').notNull(),
			prescouting: boolean('prescouting').notNull(),
			remote: boolean('remote').notNull(),
			trace: text('trace').notNull(),
			checks: text('checks').notNull()
		},
		versionHistory: {
			type: 'versions',
			amount: 3
		},
		generators: {
			universe: () => '2122'
		}
	});

	export const TeamComments = new Struct({
		name: 'team_comments',
		structure: {
			matchScoutingId: text('match_Scouting_id').notNull(),
			accountId: text('account_id').notNull(),
			team: integer('team').notNull(),
			comment: text('comment').notNull(),
			type: text('type').notNull(),
			eventKey: text('event_key').notNull()
		},
		versionHistory: {
			type: 'versions',
			amount: 3
		},
		generators: {
			universe: () => '2122'
		}
	});

	createEntitlement({
		name: 'view-scouting',
		structs: [MatchScouting, TeamComments],
		permissions: ['match_scouting:read:*', 'team_comments:read:*'],
		group: 'Scouting'
	});

	export namespace PIT {
		export const Sections = new Struct({
			name: 'pit_sections',
			structure: {
				name: text('name').notNull(),
				accountId: text('account_id').notNull(),
				order: integer('order').notNull(),
				eventKey: text('event_key').notNull()
			},
			versionHistory: {
				type: 'versions',
				amount: 3
			},
			generators: {
				universe: () => '2122'
			}
		});

		export type SectionData = typeof Sections.sample;

		export const Groups = new Struct({
			name: 'pit_groups',
			structure: {
				sectionId: text('section_id').notNull(),
				name: text('name').notNull(),
				accountId: text('account_id').notNull(),
				order: integer('order').notNull()
			},
			versionHistory: {
				type: 'versions',
				amount: 3
			},
			generators: {
				universe: () => '2122'
			}
		});

		export type GroupData = typeof Groups.sample;

		export const Questions = new Struct({
			name: 'pit_questions',
			structure: {
				question: text('question').notNull(),
				groupId: text('group_id').notNull(),
				key: text('key').notNull(),
				description: text('description').notNull(),
				type: text('type').notNull(), // boolean/number/text/textarea/etc.
				accountId: text('account_id').notNull(),
				options: text('options').notNull(), // JSON string[] for checkboxes/radios
				order: integer('order').notNull()
			},
			versionHistory: {
				type: 'versions',
				amount: 3
			},
			generators: {
				universe: () => '2122'
			},
			validators: {
				options: (data) => {
					if (typeof data !== 'string') return false;
					return z.array(z.string()).safeParse(JSON.parse(data)).success;
				},
				type: (data) => 
					z.enum(['boolean', 'number', 'text', 'textarea', 'checkboxes', 'radios']).safeParse(data).success,
			}
		});

		export type QuestionData = typeof Questions.sample;

		export const Answers = new Struct({
			name: 'pit_answers',
			structure: {
				questionId: text('question_id').notNull(),
				answer: text('answer').notNull(),
				team: integer('team').notNull(),
				accountId: text('account_id').notNull()
			},
			versionHistory: {
				type: 'versions',
				amount: 3
			},
			generators: {
				universe: () => '2122',
			},
			validators: {
				answer: (data) => {
					if (typeof data !== 'string') return false;
					return z.array(z.string()).safeParse(JSON.parse(data)).success;
				}
			}
		});

		export type AnswerData = typeof Answers.sample;

		Answers.queryListen('from-group', async (event, data) => {
			const session = (await Session.getSession(event)).unwrap();
			const account = (await Session.getAccount(session)).unwrap();

			if (!account) throw new Error('Not logged in');

			const { group } = z.object({
				group: z.string(),
			}).parse(data);

			const g = (await Groups.fromId(group)).unwrap();
			if (!g) throw new Error('Group not found');

			const res = (await getAnswersFromGroup(g)).unwrap();

			const stream = new StructStream(Answers);

			setTimeout(() => {
				for (const r of res) stream.add(r);
			}, 10);

			return stream;
		});

		export const getAnswersFromGroup = (group: GroupData) => {
			return attemptAsync(async () => {
				const res = await DB.select()
					.from(Answers.table)
					.innerJoin(Questions.table, eq(Questions.table.id, Answers.table.questionId))
					.where(eq(Questions.table.groupId, group.id));

				return res.map(r => Answers.Generator(r.pit_answers));
			});
		};

		createEntitlement({
			name: 'view-pit-scouting',
			structs: [Sections, Groups, Questions, Answers],
			permissions: [
				'pit_sections:read:*',
				'pit_groups:read:*',
				'pit_questions:read:*',
				'pit_answers:read:*'
			],
			group: 'Scouting'
		});
	}
}

export const _scoutingMatchScoutingTable = Scouting.MatchScouting.table;
export const _scoutingTeamCommentsTable = Scouting.TeamComments.table;
export const _scoutingPitSectionsTable = Scouting.PIT.Sections.table;
export const _scoutingPitGroupsTable = Scouting.PIT.Groups.table;
export const _scoutingPitQuestionsTable = Scouting.PIT.Questions.table;
export const _scoutingPitAnswersTable = Scouting.PIT.Answers.table;

export const _scoutingMatchScoutingVersionTable = Scouting.MatchScouting.versionTable;
export const _scoutingTeamCommentsVersionTable = Scouting.TeamComments.versionTable;
export const _scoutingPitSectionsVersionTable = Scouting.PIT.Sections.versionTable;
export const _scoutingPitGroupsVersionTable = Scouting.PIT.Groups.versionTable;
export const _scoutingPitQuestionsVersionTable = Scouting.PIT.Questions.versionTable;
export const _scoutingPitAnswersVersionTable = Scouting.PIT.Answers.versionTable;
