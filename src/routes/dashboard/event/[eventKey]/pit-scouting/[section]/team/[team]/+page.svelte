<script lang="ts">
	import nav from '$lib/imports/robot-display.js';
	import Section from '$lib/components/pit-scouting/Section.svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { sleep } from 'ts-utils/sleep';
	import { onMount } from 'svelte';
	import { listen } from '$lib/utils/struct-listener.js';

	const { data = $bindable() } = $props();
	// const { eventKey, section, sections, teams, team, sectionIndex } = data;
	const eventKey = $derived(data.eventKey);
	const section = $derived(data.section);
	const sections = $derived(data.sections);
	const teams = $derived(data.teams);
	const team = $derived(data.team);
	const sectionIndex = $derived(data.sectionIndex);
	const event = $derived(data.event);
	const groups = $derived(data.groups);
	const answers = $derived(data.answers);
	const questions = $derived(data.questions);

	$effect(() => nav(event));

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

	onMount(() => {
		const offSections = listen(sections, s => s.data.eventKey === event.key);
		const offGroups = listen(groups, g => section.data.id === g.data.sectionId);
		const offQuestions = listen(questions, q => !!groups.data.find(g => g.data.id === q.data.groupId));
		const offAnswers = listen(answers, a => !!questions.data.find(q => q.data.id === a.data.questionId));

		return () => {
			offSections();
			offGroups();
			offQuestions();
			offAnswers();
		}
	});
</script>

<div class="container">
	<div class="row mb-3">
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
			{#each $sections as section, i}
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
		<Section {section} team={team.team_number} groups={$groups.filter(g => g.data.sectionId === section.data.id)} {questions} {answers} />
	{/key}
</div>
