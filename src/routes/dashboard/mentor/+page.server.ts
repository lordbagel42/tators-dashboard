import { DB } from '$lib/server/db/index.js';
import { Account } from '$lib/server/structs/account.js';
import { Permissions } from '$lib/server/structs/permissions.js';
import { redirect } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import { ServerCode } from 'ts-utils/status';

export const load = async (event) => {
	if (!event.locals.account) throw redirect(ServerCode.temporaryRedirect, '/account/sign-in');
};
