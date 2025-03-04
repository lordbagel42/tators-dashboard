<script lang="ts">
	import { Scouting } from '$lib/model/scouting';
	import { DataArr } from 'drizzle-struct/front-end';
	import { onMount } from 'svelte';
	import type { TBAEvent, TBATeam } from 'tatorscout/tba';
	import Section from './Section.svelte';

	interface Props {
		team: TBATeam;
		event: TBAEvent;
	}

	const { team, event }: Props = $props();

	let sections = $state(new DataArr(Scouting.PIT.Sections, []));

	onMount(() => {
		sections = Scouting.PIT.Sections.fromProperty('eventKey', event.key, false);
	});
</script>

<div class="container-fluid" style="
	max-height: 100%;
	overflow-y: auto;
">
	{#if $sections.length}
		{#each $sections as section, i}
		{#if i > 0}
			<hr>
		{/if}
			<div class="row mb-3">
					<div class="d-flex justify-content-between align-items-center">
						<h6 class="mb-0">{section.data.name}</h6>
						<a
							href="/dashboard/event/{event.key}/pit-scouting/{i}/team/{team.team_number}"
							class="btn"
						>
							<i class="material-icons">edit</i>
						</a>
					</div>
			</div>
			<div class="row mb-3">
				<Section {section} {team} {event} />
			</div>
		{/each}
	{:else}
		<div class="row">
			<div class="col-12">
				<p>No sections found for event: {event.name}</p>
			</div>
		</div>
	{/if}
</div>
