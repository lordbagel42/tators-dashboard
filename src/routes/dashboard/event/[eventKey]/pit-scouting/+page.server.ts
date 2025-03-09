import { Scouting } from '$lib/server/structs/scouting.js';
import { redirect } from '@sveltejs/kit';
import { ServerCode } from 'ts-utils/status';

export const load = async (event) => {
	if (!event.locals.account) throw redirect(ServerCode.temporaryRedirect, '/account/sign-in');
	return {
		eventKey: event.params.eventKey
	};
};
