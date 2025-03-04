<script lang="ts">
	import { Scouting } from '$lib/model/scouting.js';
	import { DataArr } from 'drizzle-struct/front-end';
	import { onMount } from 'svelte';

	const { data = $bindable() } = $props();
	const teams = $derived(data.teams);
	const team = $derived(data.team);
	const event = $derived(data.event);

	let scoutings: Scouting.MatchScoutingArr = $state(new DataArr(Scouting.MatchScouting, []));

	onMount(() => {
		scoutings = Scouting.MatchScouting.query(
			'team-event',
			{
				team: team.team_number,
				event: event.key
			},
			{
				asStream: false,
				includeArchive: false,
				satisfies: (data) => data.data.team === team.team_number && data.data.eventKey === event.key
			}
		);
	});
</script>

{#each $scoutings as scouting}
	<div class="card">
		<div class="card-body">
			<!-- Generate trace here -->
		</div>
	</div>
{/each}
