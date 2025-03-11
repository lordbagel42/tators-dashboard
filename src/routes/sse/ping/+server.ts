import { z } from 'zod';

export const POST = async (event) => {
	const { now } = z.object({ now: z.number() }).parse(await event.request.json());
	const diff = Date.now() - now;
	event.locals.session.update({
		latency: diff
	});
	return new Response('pong');
};
