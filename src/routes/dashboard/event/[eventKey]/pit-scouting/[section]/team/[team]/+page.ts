import { Scouting } from '$lib/model/scouting';
import { DataArr } from 'drizzle-struct/front-end';

export const load = (event) => {
	return {
		section: Scouting.PIT.Sections.Generator(event.data.section),
		eventKey: event.data.eventKey,
		sections: new DataArr(Scouting.PIT.Sections, event.data.sections.map((s) => Scouting.PIT.Sections.Generator(s))),
		teams: event.data.teams,
		team: event.data.team,
		sectionIndex: event.data.sectionIndex,
		event: event.data.event,
		questions: new DataArr(Scouting.PIT.Questions, event.data.questions.map(q => Scouting.PIT.Questions.Generator(q))),
		answers: new DataArr(Scouting.PIT.Answers, event.data.answers.map(a => Scouting.PIT.Answers.Generator(a))),
		groups: new DataArr(Scouting.PIT.Groups, event.data.groups.map(g => Scouting.PIT.Groups.Generator(g))),
	};
};
