<script lang="ts">
	import type { TBAEvent, TBATeam } from 'tatorscout/tba';
	import DateInput from '../forms/DateInput.svelte';
	import { onMount } from 'svelte';
	import { TBATeam as T, TBAEvent as E } from '$lib/utils/tba';
	import { DataArr } from 'drizzle-struct/front-end';
	import { Scouting } from '$lib/model/scouting';

	interface Props {
		team: TBATeam;
		event: TBAEvent;
	}

	const {
		team, event
	}: Props = $props();

	let rank = $state(0);
	let record = $state('');
	let played = $state(0);
	let scouting = $state(new DataArr(Scouting.MatchScouting, []));
	// let drivebase = $state('');
	// let weight = $state(0);
	// let averageVelocity = $state(0);
	// let averageSecondsNotMoving = $state(0);

	onMount(() => {
		new T(team, new E(event)).getStatus().then(s => {
			if (s.isErr()) return console.error(s.error);
			rank = s.value.qual?.ranking.rank ?? 0;
			const { wins, losses, ties } = s.value.qual?.ranking.record ?? { wins: 0, losses: 0, ties: 0 };
			record = `${wins}-${losses}-${ties}`;
			played = wins + losses + ties;
		});

		scouting = Scouting.scoutingFromTeam(team.team_number, event.key);
	});
</script>

<table class="table">
	<tbody>
		<tr>
			<td>Rank:</td>
			<td>{rank}</td>
		</tr>
		<tr>
			<td>Record:</td>
			<td>{record}</td>
		</tr>
		<tr>
			<td>Played:</td>
			<td>{played}</td>
		</tr>
		<tr>
			<td>Average Velocity:</td>
			<td>
				{#if $scouting.length}
					{Scouting.getAverageVelocity($scouting)}
				{:else}
					No data
				{/if}
			</td>
		</tr>
		<!-- <tr>
			<td>Drivebase:</td>
			<td>{drivebase}</td>
		</tr>
		<tr>
			<td>Weight:</td>
			<td>{weight}</td>
		</tr>
		<tr>
			<td>Average Seconds Not Moving:</td>
			<td>{averageSecondsNotMoving}</td>
		</tr> -->
	</tbody>
</table>
