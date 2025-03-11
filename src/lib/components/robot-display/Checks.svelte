<script lang="ts">
	import { Scouting } from '$lib/model/scouting';
	import type { BootstrapColor } from 'colors/color';
	import { DataArr } from 'drizzle-struct/front-end';
	import { onMount } from 'svelte';
	import { capitalize, fromCamelCase } from 'ts-utils/text';

	interface Props {
		scouting: Scouting.MatchScoutingData;
	}

	const { scouting }: Props = $props();
	let checkArr = $state(new DataArr(Scouting.MatchScouting, []));
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

	onMount(async () => {
		checkArr = Scouting.MatchScouting.fromProperty('checks', String(scouting.data.id), false);

		// now what
	});

	console.log(checkArr);
</script>

<div class="row mb-3">
	<h5 class="text-center">Checks</h5>
	<ul class="list-group">
		{#each checks as check (check)}
			<li class="list-group-item text-{checkColors[check] ?? checkColors.default}">
				{capitalize(fromCamelCase(check))}
			</li>
		{/each}
	</ul>
	{#if checks.length === 0}
		<p class="text-muted text-center">No checks available.</p>
	{/if}
</div>
