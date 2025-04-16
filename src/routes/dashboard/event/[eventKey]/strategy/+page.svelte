<script lang="ts">
	import MatchSelect from '$lib/components/FIRST/MatchSelect.svelte';
	import TeamSelect from '$lib/components/FIRST/TeamSelect.svelte';
	import { listen } from '$lib/utils/struct-listener.js';
	import { onMount } from 'svelte';
	import { teamsFromMatch } from 'tatorscout/tba';
	import { capitalize } from 'ts-utils/text';
	import { Account } from '$lib/model/account.js';
	import { select } from '$lib/utils/prompts.js';
	import { Strategy } from '$lib/model/strategy.js';
	import { goto } from '$app/navigation';
	import nav from '$lib/imports/robot-display.js';
	import New from '$lib/components/strategy/New.svelte';

	const { data } = $props();

	const event = $derived(data.event);
	const matches = $derived(data.matches);
	const teams = $derived(data.teams);
	const strategies = $derived(data.strategies);

	$effect(() => nav(event.tba));

	onMount(() => {
		const unsub = listen(strategies, (d) => d.data.eventKey === event.tba.key);
		return () => {
			unsub();
		};
	});

	const gotoStrategy = async (s: Strategy.StrategyData) => {
		goto(`/dashboard/event/${event.tba.key}/strategy/${s.data.id}`);
	};

	const selectStrategy = async () => {
		const strategy = await select('Select a strategy', $strategies, {
			render: (s) => String(s.data.name)
		});
		if (!strategy) return;

		gotoStrategy(strategy);
	};
</script>

<div class="container">
	<div class="row mb-3">
		<div class="col-12">
			<div class="d-flex justify-content-between align-items-center">
				<h1>Create a Strategy</h1>
				<button type="button" class="btn" onclick={selectStrategy}>
					<i class="material-icons"> open_in_new </i>
					Open Existing ({$strategies.length})
				</button>
			</div>
		</div>
	</div>
	<New 
		{event}
		{matches}
		{strategies}
		{teams}
	/>
<div class="row mb-3">
	{#each $strategies as strategy} 
		<div class="col-md-4">
			<a href="/dashboard/event/{event.tba.key}/strategy/{strategy.data.id}" class="text-decoration-none">
				<div class="card layer-2">
					<div class="card-body">
						<h5 class="card-title">{strategy.data.name}</h5>
						<p class="card-text">
							{#if strategy.data.matchNumber !== -1}
								({strategy.data.compLevel} {strategy.data.matchNumber})
							{:else}
								(Custom)
							{/if}
						</p>
						<p class="card-text">
							Created by: {strategy.data.createdBy}
						</p>
					</div>
				</div>
			</a>
		</div>
	{/each}
</div>
</div>