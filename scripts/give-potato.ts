import { prompt } from '../src/lib/server/cli/utils';
import { openStructs } from '../src/lib/server/cli/struct';
import { Account } from '../src/lib/server/structs/account';
import { Struct } from 'drizzle-struct/back-end';
import { DB } from '../src/lib/server/db';
import { Potato } from '../src/lib/server/structs/potato';

export default async () => {
    (await Struct.buildAll(DB)).unwrap();

    const user = (await prompt({
        message: 'Enter account username',
    })).unwrap();

    if (!user) {
        console.error('Invalid username');
        return;
    }

    const account = (await Account.Account.fromProperty('username', user, {
        type: 'single',
    })).unwrap();

    if (!account) {
        console.error('Account not found');
        return;
    }

    const potato = (await Potato.getPotato(account.id)).unwrap();

    const levels = (await prompt({
        message: 'Enter potato level',
    })).unwrap();
    if (!levels) {
        console.error('Invalid level');
        return;
    }
    const level = parseInt(levels);
    if (isNaN(level)) {
        console.error('Invalid level');
        return;
    }

    Potato.giveLevels(potato, level, 'Manually through CLI', 'CLI');
};