import { Scouting } from '$lib/server/structs/scouting.js';
import { redirect } from '@sveltejs/kit';
import { ServerCode } from 'ts-utils/status';

export const load = async (event) => {
	if (!event.locals.account) throw redirect(ServerCode.temporaryRedirect, '/account/sign-in');
	const { eventKey, section } = event.params;

	const sections = (
		await Scouting.PIT.Sections.fromProperty('eventKey', eventKey, {
			type: 'stream'
		}).await()
	)
		.unwrap()
		.sort((a, b) => a.data.order - b.data.order);

	const s = sections[parseInt(section)];

	if (!s) throw redirect(ServerCode.permanentRedirect, `/status/404?url=${event.url.href}`);

	return {
		section: s.safe(),
		eventKey,
		sections: sections.map((s) => s.safe()),
		sectionIndex: parseInt(section)
	};
};
