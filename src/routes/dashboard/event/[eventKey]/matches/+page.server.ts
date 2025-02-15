import * as TBA from '$lib/server/utils/tba';
import { redirect, fail } from '@sveltejs/kit';
import { ServerCode } from 'ts-utils/status';
import { Scouting } from '$lib/server/structs/scouting.js';

export const load = async (event) => {
	const e = await TBA.Event.getEvent(event.params.eventKey);
	if (e.isErr()) {
		throw redirect(ServerCode.temporaryRedirect, `/404?url${event.url.href}`);
	}

	const [teams, matches] = await Promise.all([e.value.getTeams(), e.value.getMatches()]);

	if (teams.isErr()) throw fail(ServerCode.internalServerError);
	if (matches.isErr()) throw fail(ServerCode.internalServerError);

	return {
		event: e.value.tba,
		matches: matches.value.map((m) => m.tba)
	};
};
