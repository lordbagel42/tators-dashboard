<script lang="ts">
	import { Scouting } from '$lib/model/scouting';
	import { DataArr } from 'drizzle-struct/front-end';
	import { onMount } from 'svelte';
	import Group from './Group.svelte';

	interface Props {
		section: Scouting.PIT.SectionData;
		team: number;
	}

	const { section, team }: Props = $props();

	let groups = $state(new DataArr(Scouting.PIT.Groups, []));

	$effect(() => {
		if (!section || !team) return; // trigger on section or team change
		groups = Scouting.PIT.Groups.fromProperty('sectionId', $section.id || '', false);
		groups.sort((a, b) => Number(a.data.order) - Number(b.data.order));
	});
</script>

<div class="container-fluid">
	<div class="row mb-3">
		<h3>{$section.name}</h3>
		<hr>
	</div>
	{#each $groups as group}
		<div class="row mb-3">
			<Group {group} {team} />
		</div>
	{/each}
</div>
