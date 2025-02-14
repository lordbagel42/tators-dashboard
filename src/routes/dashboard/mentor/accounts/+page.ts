import { Account } from '$lib/model/account.js';
import { Permissions } from '$lib/model/permissions.js';

export const load = (event) => {
	return {
		accounts: event.data.accounts.map((d) => ({
			account: Account.Account.Generator(d.account),
			admin: d.admin,
			developer: d.developer,
			roles: d.roles.map((r) => Permissions.Role.Generator(r))
		}))
	};
};
