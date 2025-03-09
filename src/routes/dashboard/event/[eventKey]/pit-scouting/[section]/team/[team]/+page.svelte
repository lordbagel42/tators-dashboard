<script lang="ts">
	import nav from '$lib/imports/robot-display.js';
	import Section from '$lib/components/pit-scouting/Section.svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { sleep } from 'ts-utils/sleep';

	const { data = $bindable() } = $props();
	// const { eventKey, section, sections, teams, team, sectionIndex } = data;
	const eventKey = $derived(data.eventKey);
	const section = $derived(data.section);
	const sections = $derived(data.sections);
	const teams = $derived(data.teams);
	const team = $derived(data.team);
	const sectionIndex = $derived(data.sectionIndex);

	$effect(() => nav(eventKey));

	let scroller: HTMLDivElement;

	afterNavigate(() => {
		const btn = scroller.querySelector(`[data-team="${team.team_number}"]`);
		if (btn) {
			sleep(500).then(() =>
				btn.scrollIntoView({
					behavior: 'smooth',
					block: 'nearest',
					inline: 'center'
				})
			);
		}
	});
</script>

<div class="container">
	<div class="row">
		<h2>Pitscouting: {team.nickname}</h2>
	</div>
	<div class="row mb-3">
		<div class="ws-nowrap p-3 mb-3" bind:this={scroller} style="overflow-x: auto;">
			{#each teams as t}
				<a
					type="button"
					href="/dashboard/event/{eventKey}/pit-scouting/{sectionIndex}/team/{t.team_number}"
					class="btn mx-2"
					class:btn-primary={t.team_number !== team.team_number}
					class:btn-outline-secondary={t.team_number === team.team_number}
					class:btn-disabled={t.team_number === team.team_number}
					class:text-muted={t.team_number === team.team_number}
					onclick={(e) => {
						if (t.team_number === team.team_number) {
							return e.preventDefault();
						}
					}}
					data-team={t.team_number}
				>
					{t.team_number}
				</a>
			{/each}
		</div>
	</div>
	<div class="row mb-3">
		<div class="no-scroll-y ws-nowrap" style="overflow-x: auto;">
			{#each sections as section, i}
				<button
					onclick={() => {
						goto(`/dashboard/event/${eventKey}/pit-scouting/${i}/team/${team.team_number}`);
					}}
					class="btn btn-primary mx-2"
					disabled={sectionIndex === i}
				>
					{section.data.name}
				</button>
			{/each}
		</div>
	</div>
	{#key team}
		<Section {section} team={team.team_number} />
	{/key}
</div>
