<script lang="ts">
	import { writable } from 'svelte/store';
	import { Match2025Schema } from 'tatorscout/tba';
	import { TBAEvent, TBATeam, TBAMatch } from '$lib/utils/tba';
	import z from 'zod';

	interface Props {
		match: TBAMatch;
		team: TBATeam;
		event: TBAEvent;
	}

	const { match, team, event }: Props = $props();

	type MatchSchema = z.infer<typeof Match2025Schema>;

	// this provides intellisense and makes typescript happy.
	// i have no idea if this is correct, but it works and feels pretty good to me.
	// type assertions feel gross to me, but i don't really know how to do this better.
	const tba = match.tba as MatchSchema;
</script>

<div class="card text-center h-100">
	<div class="card-header">
		<h5 class="mb-0">Endgame</h5>
	</div>
	<div class="card-body">
		<table class="table table-bordered">
			<thead>
				<tr>
					<th>Blue Alliance</th>
					<th>Red Alliance</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td
						class={`${tba.alliances.blue.team_keys[0] === team.tba.key ? 'table-highlight' : ''} ${tba.score_breakdown.blue.endGameRobot1 === 'DeepCage' ? 'table-green' : tba.score_breakdown.blue.endGameRobot1 === 'ShallowCage' ? 'table-blue' : tba.score_breakdown.blue.endGameRobot1 === 'Parked' ? 'table-purple' : ''}`}
					>
						{tba.alliances.blue.team_keys[0].slice(3)}: {tba.score_breakdown.blue.endGameRobot1 ||
							'None'}
					</td>
					<td
						class={`${tba.alliances.red.team_keys[0] === team.tba.key ? 'table-highlight' : ''} ${tba.score_breakdown.red.endGameRobot1 === 'DeepCage' ? 'table-green' : tba.score_breakdown.red.endGameRobot1 === 'ShallowCage' ? 'table-blue' : tba.score_breakdown.red.endGameRobot1 === 'Parked' ? 'table-purple' : ''}`}
					>
						{tba.alliances.red.team_keys[0].slice(3)}: {tba.score_breakdown.red.endGameRobot1 ||
							'None'}
					</td>
				</tr>
				<tr>
					<td
						class={`${tba.alliances.blue.team_keys[1] === team.tba.key ? 'table-highlight' : ''} ${tba.score_breakdown.blue.endGameRobot2 === 'DeepCage' ? 'table-green' : tba.score_breakdown.blue.endGameRobot2 === 'ShallowCage' ? 'table-blue' : tba.score_breakdown.blue.endGameRobot2 === 'Parked' ? 'table-purple' : ''}`}
					>
						{tba.alliances.blue.team_keys[1].slice(3)}: {tba.score_breakdown.blue.endGameRobot2 ||
							'None'}
					</td>
					<td
						class={`${tba.alliances.red.team_keys[1] === team.tba.key ? 'table-highlight' : ''} ${tba.score_breakdown.red.endGameRobot2 === 'DeepCage' ? 'table-green' : tba.score_breakdown.red.endGameRobot2 === 'ShallowCage' ? 'table-blue' : tba.score_breakdown.red.endGameRobot2 === 'Parked' ? 'table-purple' : ''}`}
					>
						{tba.alliances.red.team_keys[1].slice(3)}: {tba.score_breakdown.red.endGameRobot2 ||
							'None'}
					</td>
				</tr>
				<tr>
					<td
						class={`${tba.alliances.blue.team_keys[2] === team.tba.key ? 'table-highlight' : ''} ${tba.score_breakdown.blue.endGameRobot3 === 'DeepCage' ? 'table-green' : tba.score_breakdown.blue.endGameRobot3 === 'ShallowCage' ? 'table-blue' : tba.score_breakdown.blue.endGameRobot3 === 'Parked' ? 'table-purple' : ''}`}
					>
						{tba.alliances.blue.team_keys[2].slice(3)}: {tba.score_breakdown.blue.endGameRobot3 ||
							'None'}
					</td>
					<td
						class={`${tba.alliances.red.team_keys[2] === team.tba.key ? 'table-highlight' : ''} ${tba.score_breakdown.red.endGameRobot3 === 'DeepCage' ? 'table-green' : tba.score_breakdown.red.endGameRobot3 === 'ShallowCage' ? 'table-blue' : tba.score_breakdown.red.endGameRobot3 === 'Parked' ? 'table-purple' : ''}`}
					>
						{tba.alliances.red.team_keys[2].slice(3)}: {tba.score_breakdown.red.endGameRobot3 ||
							'None'}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>

<style>
	.table-green {
		color: green;
	}

	.table-blue {
		color: lightblue;
	}

	.table-purple {
		color: rgb(211, 55, 99);
	}

	.table-highlight {
		background-color: darkgray;
	}
</style>
