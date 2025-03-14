import {
	Struct,
	type StructData,
	type DataArr,
	type StructDataVersion
} from 'drizzle-struct/front-end';
import { sse } from '../utils/sse';
import { browser } from '$app/environment';
import { attempt, attemptAsync } from 'ts-utils/check';
import { z } from 'zod';
import { Account } from './account';
import { Trace, TraceSchema, type TraceArray } from 'tatorscout/trace';
import { $Math } from 'ts-utils/math';

export namespace Scouting {
	export const MatchScouting = new Struct({
		name: 'match_scouting',
		structure: {
			eventKey: 'string',
			matchNumber: 'number',
			compLevel: 'string',
			// matchId: 'string',
			team: 'number',
			scoutId: 'string',
			scoutGroup: 'number',
			prescouting: 'boolean',
			remote: 'boolean',
			trace: 'string',
			checks: 'string',
			scoutUsername: 'string',
			alliance: 'string'
		},
		socket: sse,
		browser
	});

	export type MatchScoutingData = StructData<typeof MatchScouting.data.structure>;
	export type MatchScoutingArr = DataArr<typeof MatchScouting.data.structure>;
	export type MatchScoutingHistory = StructDataVersion<typeof MatchScouting.data.structure>;

	export const getAverageVelocity = (data: MatchScoutingData[]) => {
		return Trace.velocity.average(
			data.map((d) => TraceSchema.parse(JSON.parse(d.data.trace || '[]'))).flat() as TraceArray
		);
	};

	export const getArchivedMatches = (team: number, eventKey: string) => {
		return MatchScouting.query(
			'archived-matches',
			{ team, eventKey },
			{
				asStream: false,
				satisfies: (d) => d.data.team === team && d.data.eventKey === eventKey && !!d.data.archived
			}
		);
	};

	export const averageAutoScore = (data: MatchScoutingData[], year: number) => {
		return attempt(() => {
			if (year === 2025) {
				return $Math.average(
					data.map(
						(d) =>
							Trace.score.parse2025(
								TraceSchema.parse(JSON.parse(d.data.trace || '[]')) as TraceArray,
								d.data.alliance as 'red' | 'blue'
							).auto.total
					)
				);
			}
			return 0;
		});
	};

	export const averageTeleopScore = (data: MatchScoutingData[], year: number) => {
		return attempt(() => {
			if (year === 2025) {
				const teles = data.map(
					(d) =>
						Trace.score.parse2025(
							TraceSchema.parse(JSON.parse(d.data.trace || '[]')) as TraceArray,
							d.data.alliance as 'red' | 'blue'
						).teleop
				);

				return $Math.average(teles.map((t) => t.total - (t.dpc + t.shc + t.park)));
			}
			return 0;
		});
	};

	export const averageEndgameScore = (data: MatchScoutingData[], year: number) => {
		return attempt(() => {
			if (year === 2025) {
				const teles = data.map(
					(d) =>
						Trace.score.parse2025(
							TraceSchema.parse(JSON.parse(d.data.trace || '[]')) as TraceArray,
							d.data.alliance as 'red' | 'blue'
						).teleop
				);

				return $Math.average(teles.map((t) => t.park + t.dpc + t.shc));
			}
			return 0;
		});
	};

	export const averageSecondsNotMoving = (data: MatchScoutingData[]) => {
		return attempt(() => {
			return $Math.average(
				data.map((d) =>
					Trace.secondsNotMoving(
						TraceSchema.parse(JSON.parse(d.data.trace || '[]')) as TraceArray,
						false
					)
				)
			);
		});
	};

	export const scoutingFromTeam = (team: number, eventKey: string) => {
		return MatchScouting.query(
			'from-team',
			{ team, eventKey },
			{
				asStream: false,
				satisfies: (d) => d.data.team === team && d.data.eventKey === eventKey && !!d.data.archived
			}
		);
	};

	export const TeamComments = new Struct({
		name: 'team_comments',
		structure: {
			matchScoutingId: 'string',
			accountId: 'string',
			team: 'number',
			comment: 'string',
			type: 'string',
			eventKey: 'string',
			scoutUsername: 'string'
		},
		socket: sse,
		browser
	});

	export type TeamCommentsData = StructData<typeof TeamComments.data.structure>;
	export type TeamCommentsArr = DataArr<typeof TeamComments.data.structure>;

	export const parseTrace = (trace: string) => {
		return attempt<TraceArray>(() => {
			return z
				.array(z.tuple([z.number(), z.number(), z.number(), z.string()]))
				.parse(JSON.parse(trace)) as TraceArray;
		});
	};

	export namespace PIT {
		export const Sections = new Struct({
			name: 'pit_sections',
			structure: {
				name: 'string',
				order: 'number',
				eventKey: 'string'
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
				order: 'number'
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
				description: 'string',
				type: 'string',
				key: 'string',
				order: 'number',
				options: 'string'
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
				answer: 'string',
				team: 'number',
				accountId: 'string'
			},
			socket: sse,
			browser
		});

		export type AnswerData = StructData<typeof Answers.data.structure>;
		export type AnswerArr = DataArr<typeof Answers.data.structure>;

		export type Options = {};

		export const parseOptions = (question: QuestionData) => {
			return attempt(() => {
				const options = question.data.options;
				if (!options) throw new Error('No options key');
				return z.array(z.string()).parse(JSON.parse(options));
			});
		};

		export const parseAnswer = (answer: AnswerData) => {
			return attempt(() => {
				const value = answer.data.answer;
				if (!value) throw new Error('No answer key');
				return z.array(z.string()).parse(JSON.parse(value));
			});
		};

		export const getAnswersFromGroup = (group: GroupData, questionIDs: string[]) => {
			return Answers.query(
				'from-group',
				{
					group: group.data.id
				},
				{
					asStream: false,
					satisfies: (d) => (d.data.questionId ? questionIDs.includes(d.data.questionId) : false)
				}
			);
		};

		export const answerQuestion = (
			question: QuestionData,
			answer: string[],
			team: number,
			account: Account.AccountData
		) => {
			return attemptAsync(async () => {
				if (!question.data.id) throw new Error('Question ID not found');
				const accountId = account.data.id;
				if (!accountId) throw new Error('Account ID not found');
				const res = (
					await Answers.new({
						questionId: question.data.id,
						answer: JSON.stringify(answer),
						team,
						accountId
					})
				).unwrap();

				if (!res.success) throw new Error(res.message || 'Failed to answer question');
			});
		};

	}
}
