import { Event } from '$lib/server/utils/tba.js';
import { fail, redirect } from '@sveltejs/kit';
import { ServerCode } from 'ts-utils/status';

export const load = async (event) => {
    if (!event.locals.account) throw redirect(ServerCode.temporaryRedirect, '/account/sign-in');
	const e = await Event.getEvent(event.params.eventKey);
	if (e.isErr()) {
		throw fail(ServerCode.notFound, {
			message: 'Event not found'
		});
	}

	const teams = await e.value.getTeams();

	if (teams.isErr()) {
		throw fail(ServerCode.internalServerError, {
			message: 'Failed to get teams'
		});
	}

	const searchTeams = (event.url.searchParams.get('teams') || '')
		.split(',')
		.map((t) => parseInt(t))
		.filter((t) => !isNaN(t))
		.sort((a, b) => a - b);

	return {
		event: e.value.tba,
		selectedTeams: searchTeams
			.map((t) => teams.value.find((team) => team.tba.team_number === t))
			.filter(Boolean)
			.map((t) => t.tba),
		teams: teams.value.map((t) => t.tba)
	};
};
