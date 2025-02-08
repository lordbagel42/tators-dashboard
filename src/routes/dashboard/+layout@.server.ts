import { Session } from '$lib/server/structs/session';
import terminal from '$lib/server/utils/terminal.js';
import { fail, redirect } from '@sveltejs/kit';
import { ServerCode } from 'ts-utils/status';

export const load = async (event) => {
    const session = await Session.getSession(event);
    if (session.isErr()) {
        terminal.error(session.error);
        throw fail(ServerCode.internalServerError);
    }

    const account = await Session.getAccount(session.value);
    if (account.isErr()) {
        terminal.error(account.error);
        throw fail(ServerCode.internalServerError);
    }

    if (!account.value) {
        throw redirect(ServerCode.temporaryRedirect, '/account/log-in');
    }
}