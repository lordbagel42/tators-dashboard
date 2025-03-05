<script lang="ts">
	import type { TBATeam } from '$lib/utils/tba';
	import type { TBAEvent } from 'tatorscout/tba';
	import DateInput from '../forms/DateInput.svelte';
	import { onMount } from 'svelte';

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
	// let drivebase = $state('');
	// let weight = $state(0);
	// let averageVelocity = $state(0);
	// let averageSecondsNotMoving = $state(0);

	onMount(() => {
		
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
		<!-- <tr>
			<td>Drivebase:</td>
			<td>{drivebase}</td>
		</tr>
		<tr>
			<td>Weight:</td>
			<td>{weight}</td>
		</tr>
		<tr>
			<td>Average Velocity:</td>
			<td>{averageVelocity}</td>
		</tr>
		<tr>
			<td>Average Seconds Not Moving:</td>
			<td>{averageSecondsNotMoving}</td>
		</tr> -->
	</tbody>
</table>
