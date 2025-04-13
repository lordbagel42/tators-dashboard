<script lang="ts">
	import TeamEventStats from '../charts/TeamEventStats.svelte';
	import Progress from '../charts/Progress.svelte';
	import { Scouting } from '$lib/model/scouting';
	import { TBATeam, TBAEvent, TBAMatch } from '$lib/utils/tba';
	import { DataArr } from 'drizzle-struct/front-end';
	import { onMount } from 'svelte';

	interface Props {
		teams: TBATeam[];
		teamNumber: number;
		event: TBAEvent;
		staticY?: number;
		matches: TBAMatch[];
	}

	let { teamNumber, teams, event, staticY = $bindable(), matches }: Props = $props();

	let team = $derived(teams.find((t) => t.tba.team_number === teamNumber));

	let scouting = $state(new DataArr(Scouting.MatchScouting, []));

	onMount(() => {
		scouting = Scouting.scoutingFromTeam(teamNumber, event.tba.key);
	});
</script>

{#if team}
	{#key scouting}
		<div class="container-fluid">
			<div class="row">
				<div class="col-md-6">
					<TeamEventStats {team} {event} {staticY} {scouting} {matches} />
				</div>
				<div class="col-md-6">
					<Progress {team} {event} {staticY} {scouting} {matches} />
				</div>
			</div>
		</div>
	{/key}
{/if}
