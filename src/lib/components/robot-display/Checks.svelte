<script lang="ts">
	import { Scouting } from '$lib/model/scouting';
	import type { BootstrapColor } from 'colors/color';
	import { DataArr } from 'drizzle-struct/front-end';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { capitalize, fromCamelCase } from 'ts-utils/text';
	import { z } from 'zod';

	interface Props {
		scouting: Scouting.MatchScoutingData;
	}

	const { scouting }: Props = $props();
	let checks: string[] = $state([]);

	const checkColors: {
		[key: string]: BootstrapColor;
	} = {
		autoMobility: 'success',
		parked: 'success',
		playedDefense: 'primary',
		tippy: 'warning',
		easilyDefended: 'warning',
		robotDied: 'danger',
		problemsDriving: 'danger',
		groundPicks: 'primary',
		default: 'secondary'
	};

	onMount(() => {
		return scouting.subscribe((data) => {
			try {
				const c = data.checks || '[]';
				checks = z.array(z.string()).parse(JSON.parse(c));
				// checks.set(parsed);
			} catch (error) {
				console.error(error);
			}
		});
	});
</script>

<div class="card text-center h-100">
	<div class="card-header">
		<h5 class="mb-0">Checks</h5>
	</div>
	<div class="card-body">
		<ul class="list-group">
			{#each checks as check (check)}
				<li class="list-group-item text-{checkColors[check] ?? checkColors.default}">
					{capitalize(fromCamelCase(check))}
				</li>
			{/each}
		</ul>
		{#if !checks.length}
			<p class="text-muted text-center">No checks available.</p>
		{/if}
	</div>
</div>
