import { summarize } from '$lib/server/utils/google-summary.js'
import { fail } from '@sveltejs/kit';
import { ServerCode } from 'ts-utils/status';

export const GET = async (event) => {
    const data = await summarize(event.params.eventKey);
    if (data.isErr()) throw fail(ServerCode.internalServerError, {
        error: data.error.message,
    });

    return new Response(JSON.stringify(data.value.serialize()), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        }
    });
}