import { text } from '@sveltejs/kit';
import { z } from 'zod';

export const POST = async (event) => {
	const { now } = z.object({ now: z.number() }).parse(await event.request.json());
	const diff = Math.abs(Date.now() - now);
	event.locals.session.update({
		latency: diff
	});
	return text(`Ping: ${diff}`)
};
