import { Struct, type StructData, type DataArr } from 'drizzle-struct/front-end';
import { sse } from '../utils/sse';
import { browser } from '$app/environment';
import { attempt } from 'ts-utils/check';
import { z } from 'zod';


export namespace Scouting {
	export const MatchScouting = new Struct({
		name: 'match_scouting',
		structure: {
			matchId: 'string',
			team: 'number',
			scoutId: 'string',
			scoutGroup: 'string',
			prescouting: 'boolean',
			remote: 'boolean',
			trace: 'string',
			checks: 'string'
		},
		socket: sse,
		browser
	});

	export type MatchScoutingData = StructData<typeof MatchScouting.data.structure>;
	export type MatchScoutingArr = DataArr<typeof MatchScouting.data.structure>;

	export const TeamComments = new Struct({
		name: 'team_comments',
		structure: {
			matchScoutingId: 'string',
			accountId: 'string',
			team: 'number',
			comment: 'string',
			type: 'string',
			eventKey: 'string'
		},
		socket: sse,
		browser
	});

	export type TeamCommentsData = StructData<typeof TeamComments.data.structure>;
	export type TeamCommentsArr = DataArr<typeof TeamComments.data.structure>;

	export namespace PIT {
		export const Sections = new Struct({
			name: 'pit_sections',
			structure: {
				name: 'string',
				accountId: 'string',
				order: 'number',
				eventKey: 'string',
			},
			socket: sse,
			browser
		});

		export type SectionData = StructData<typeof Sections.data.structure>;
		export type SectionArr = DataArr<typeof Sections.data.structure>;

		export const Groups = new Struct({
			name: 'pit_groups',
			structure: {
				sectionId: 'string',
				name: 'string',
				accountId: 'string',
				order: 'number',
			},
			socket: sse,
			browser
		});

		export type GroupData = StructData<typeof Groups.data.structure>;
		export type GroupArr = DataArr<typeof Groups.data.structure>;

		export const Questions = new Struct({
			name: 'pit_questions',
			structure: {
				groupId: 'string',
				question: 'string',
				type: 'string',
				key: 'string',
				accountId: 'string',
				order: 'number',
				options: 'string',
			},
			socket: sse,
			browser
		});

		export type QuestionData = StructData<typeof Questions.data.structure>;
		export type QuestionArr = DataArr<typeof Questions.data.structure>;

		export const Answers = new Struct({
			name: 'pit_answers',
			structure: {
				questionId: 'string',
				accountId: 'string',
				value: 'string',
				matchId: 'string'
			},
			socket: sse,
			browser
		});

		export type AnswerData = StructData<typeof Answers.data.structure>;
		export type AnswerArr = DataArr<typeof Answers.data.structure>;

		export type Options = {};

		export const parseOptions = (options: string) => {
			return attempt(() => {
				return z.array(z.string()).parse(JSON.parse(options));
			});
		};

		export const parseAnswer = (answer: string) => {
			return attempt(() => {
				return z.array(z.string()).parse(JSON.parse(answer));
			});
		}

		export const getAnswersFromGroup = (group: GroupData, questionIDs: string[]) => {
			return Answers.query('from-group', { 
				group: group.data.id,
			}, {
				asStream: false,
				satisfies: (d) => d.data.questionId ? questionIDs.includes(d.data.questionId) : false,
			});
		};
	}
}
