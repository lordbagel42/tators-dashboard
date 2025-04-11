import { Strategy } from '$lib/server/structs/strategy.js';
import { fail, redirect } from '@sveltejs/kit';
import { ServerCode } from 'ts-utils/status';

export const load = async (event) => {
    const strategy = await Strategy.Strategy.fromId(event.params.id).unwrap();
    if (!strategy) {
        throw redirect(ServerCode.permanentRedirect, `/dashboard/event/${event.params.eventKey}/strategy`);
    }
};