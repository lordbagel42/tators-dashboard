<script lang="ts">
	import { Scouting } from '$lib/model/scouting';
	import { FIRST } from '$lib/model/FIRST';
	import { onMount } from 'svelte';
	import { MatchCanvas } from '$lib/model/match-canvas';
	import type { Focus } from '$lib/types/robot-display';
	import Trace from './Trace.svelte';
	import { TBAEvent, TBATeam, TBAMatch } from '$lib/utils/tba';

	interface Props {
		match: TBAMatch;
		scouting?: Scouting.MatchScoutingData;
		team: TBATeam;
		// focus: Focus;
		event: TBAEvent;
	}

	const { scouting, team, event, match }: Props = $props();
</script>

<div class="container-fluid">
	<div class="row mb-3">
		{#if scouting}
			<Trace {scouting} {event} />
		{:else}
			<div class="col-12">
				<div class="card">
					<div class="card-body">
						<p>No scouting data available</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
	<div class="row mb-3"></div>
</div>
