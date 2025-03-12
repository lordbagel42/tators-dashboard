import { text } from '@sveltejs/kit';
import { z } from 'zod';

export const POST = async (event) => {
	const { latency } = z.object({ latency: z.number() }).parse(await event.request.json());
	event.locals.session.update({
		latency: latency / 2,
	});
	return new Response('Pong', {
		status: 200,
	});
};