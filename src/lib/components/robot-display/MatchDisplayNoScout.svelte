<script lang="ts">
	import { Scouting } from '$lib/model/scouting';
	import { FIRST } from '$lib/model/FIRST';
	import { onMount } from 'svelte';
	import { MatchCanvas } from '$lib/model/match-canvas';
	import type { Focus } from '$lib/types/robot-display';
	import Trace from './Trace.svelte';
	import { TBAEvent, TBATeam, TBAMatch } from '$lib/utils/tba';
	import { writable } from 'svelte/store';
	import MatchComments from './MatchComments.svelte';
	import Checks from './Checks.svelte';
	import { dateTime } from 'ts-utils/clock';
	import MatchActions from './MatchActions.svelte';
	import MatchEndgame from './MatchEndgame.svelte';
	import { confirm } from '$lib/utils/prompts';
	import MatchContribution from '../charts/MatchContribution.svelte';

	interface Props {
		match: TBAMatch;
		team: TBATeam;
		// focus: Focus;
		event: TBAEvent;
	}

	const { team, event, match }: Props = $props();
</script>

<div class="container-fluid">
	<div class="row mb-3">
		No scouting data found for {team.tba.nickname} - {event.tba.name}
		{match.tba.comp_level}{match.tba.match_number}. Here's what I can show you:
	</div>
	<div class="row mb-3">
		{#each match.tba.videos || [] as video}
			<div class="col-md-6">
				<div class="card h-100">
					<div class="card-body p-1">
						{#if video.type === 'youtube'}
							<iframe
								src="https://www.youtube.com/embed/{video.key}?autoplay=0&controls=1&loop=0&modestbranding=1&rel=0&showinfo=0&color=white&iv_load_policy=3&fs=1&disablekb=1&enablejsapi=1&origin=https%3A%2F%2Fwww.thebluealliance.com&widgetid=1"
								frameborder="0"
								title="YouTube video player"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
								class="w-100 mb-0"
								style="
									height: 200px;
								"
							></iframe>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
	<div class="row mb-3">
		<div class="col-md-4">
			<MatchEndgame {match} {team} {event} classes="layer-1" />
		</div>
	</div>
</div>
