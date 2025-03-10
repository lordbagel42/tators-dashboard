<script lang="ts">
	import nav from '$lib/imports/robot-display.js';
	import Card from '$lib/components/dashboard/Card.svelte';
	import { Dashboard } from '$lib/model/dashboard';
	import DB from '$lib/components/dashboard/Dashboard.svelte';
	import { Navbar } from '$lib/model/navbar.js';
	import EventSummary from '$lib/components/charts/EventSummary.svelte';
	const { data = $bindable() } = $props();
	const event = $derived(data.event);
	const teams = $derived(data.teams);
	const matches = $derived(data.matches);
	const summaries = $derived(data.summaries);

	$effect(() => nav(event));

	const dashboard = $derived(
		new Dashboard.Dashboard({
			name: event.name,
			cards: [],
			id: 'event-dashboard'
		})
	);
</script>

<DB {dashboard}>
	{#snippet body()}
		<div style="grid-column: span var(--grid-size);">
			<div class="ws-nowrap p-3 scroll-x" style="width: 100% !important;">
				{#each teams as team}
					<a
						href="/dashboard/event/{event.key}/team/{team.team_number}"
						type="button"
						class="btn btn-primary mx-2"
					>
						{team.team_number}
					</a>
				{/each}
			</div>
			<div class="container-fluid">

				{#each summaries as row, k}
				<div class="row mb-5">
					{#if k !== 0}
						<hr />
					{/if}
					<h2 class="text-primary">{row.title}</h2>
					{#each row.labels as label, i}
						<h5>{label}</h5>
						<div class="scroll-x mb-1">
							<div class="chart-container">
								<EventSummary 
									labels={Object.entries(row.data)
										.sort((a, b) => b[1][i] - a[1][i])
										.map(v => v[0])}
									datasets={[
										{
											label,
											data: Object.entries(row.data)
											.sort((a, b) => b[1][i] - a[1][i])
											.map(v => v[1][i])
										}
									]}
								/>
							</div>
						</div>
					{/each}
				</div>
			{/each}
			</div>
		</div>
	{/snippet}
</DB>

<style>
    .chart-container {
        min-width: 1500px !important;
        width: 100vw;
        height: 100%;
    }
</style>
