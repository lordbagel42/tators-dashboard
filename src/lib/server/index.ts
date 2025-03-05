import { Struct } from 'drizzle-struct/back-end';
import terminal from '$lib/server/utils/terminal';
import { Universes } from '$lib/server/structs/universe';
import { Permissions } from '$lib/server/structs/permissions';
import { getEntitlementNames } from './utils/entitlements';
import type { Entitlement } from '$lib/types/entitlements';
import { openStructs } from './cli/struct';

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

	const scoutRole = (
		await Permissions.Role.fromProperty('name', 'Scout', {
			type: 'single'
		})
	).unwrap();
	if (!scoutRole) {
		const entitlements: Entitlement[] = [
			'view-checklist',
			'view-pit-scouting',
			'view-potatoes',
			'view-roles',
			'view-scouting',
			'view-strategy',
			'view-tba-info',
			'view-universe'
		];
		const scout = (
			await Permissions.Role.new(
				{
					universe: '2122',
					name: 'Scout',
					description: 'Team Tators Scout',
					links: '[]',
					entitlements: JSON.stringify(entitlements)
				},
				{
					overwriteGenerators: true
				}
			)
		).unwrap();
		(await scout.setUniverse('2122')).unwrap();
	}

	const editorRole = await Permissions.Role.fromProperty('name', 'Editor', {
		type: 'single'
	});

	if (!editorRole) {
		const entitlements: Entitlement[] = [
			'create-custom-tba-responses',
			'manage-pit-scouting',
			'manage-roles',
			'manage-tba',
			'manage-universe',
			'view-checklist',
			'view-pit-scouting',
			'view-potatoes',
			'view-scouting',
			'view-strategy',
			'view-tba-info',
			'view-universe'
		];

		const editor = (
			await Permissions.Role.new(
				{
					universe: '2122',
					name: 'Editor',
					description: 'Team Tators Editor',
					links: '[]',
					entitlements: JSON.stringify(entitlements)
				},
				{
					overwriteGenerators: true
				}
			)
		).unwrap();
		(await editor.setUniverse('2122')).unwrap();
	}
};

{
	openStructs().then(() => {
		const built = new Set<string>();
		for (const struct of Struct.structs.values()) {
			struct.once('build', () => {
				built.add(struct.name);
				if (built.size === Struct.structs.size) {
					postBuild();
				}
			});
		}
	});
}
