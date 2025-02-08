import { Struct } from 'drizzle-struct/back-end';
import terminal from '$lib/server/utils/terminal';
import { Universes } from '$lib/server/structs/universe';
import { Permissions } from '$lib/server/structs/permissions';
import { getEntitlementNames } from './utils/entitlements';

const postBuild = async () => {
    const exists = (await Universes.Universe.fromId('2122')).unwrap();
    if (!exists) {
        await Universes.Universe.new(
            {
                id: '2122',
                name: 'Team Tators',
                description: 'Team Tators single universe',
                public: false,
                archived: false,
                canUpdate: false,
                lifetime: 0,
                attributes: '[]',
                universe: '2122',
                updated: new Date().toISOString(),
                created: new Date().toISOString()
            },
            {
                overwriteGlobals: true
            }
        );
    }

    Permissions.Role.fromProperty('name', 'Admin', {
        type: 'single'
    }).then(async (hasAdmin) => {
        const res = await getEntitlementNames();
        if (res.isErr()) return terminal.error(res.error);
        if (hasAdmin.isErr()) return terminal.error(hasAdmin.error);

        if (hasAdmin.value) {
            return hasAdmin.value.update({
                entitlements: JSON.stringify(res.value)
            });
        }

        const admin = (
            await Permissions.Role.new({
                universe: '2122',
                name: 'Admin',
                description: `Team Tators Aministrator`,
                links: '[]',
                entitlements: JSON.stringify(res.value)
            })
        ).unwrap();
        (await admin.setUniverse('2122')).unwrap();
        (await admin.setStatic(true)).unwrap();
    });

    Permissions.Role.fromProperty('name', 'Member', {
        type: 'single'
    }).then(async (hasMember) => {
        if (hasMember.isErr() || hasMember.value) return;

        const member = (
            await Permissions.Role.new({
                universe: '2122',
                name: 'Member',
                description: `Team Tators Member`,
                links: '[]',
                entitlements: '[]'
            })
        ).unwrap();
        (await member.setUniverse('2122')).unwrap();
        (await member.setStatic(true)).unwrap();
    });
};

{
    const built = new Set<string>();
    for (const struct of Struct.structs.values()) {
        struct.once('build', () => {
            built.add(struct.name);
            if (built.size === Struct.structs.size) {
                postBuild();
            }
        });
    }
}