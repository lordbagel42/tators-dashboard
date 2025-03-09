<script lang="ts">
	import nav from '$lib/imports/robot-display.js';
	import Card from '$lib/components/dashboard/Card.svelte';
	import { Dashboard } from '$lib/model/dashboard';
	import DB from '$lib/components/dashboard/Dashboard.svelte';
	import { sleep } from 'ts-utils/sleep';
	import { afterNavigate } from '$app/navigation';
	import PictureDisplay from '$lib/components/robot-display/PictureDisplay.svelte';
	import PitScoutingCard from '$lib/components/robot-display/pit-scouting/PitScoutingCard.svelte';
	import TeamComments from '$lib/components/robot-display/TeamComments.svelte';
	import EventSummary from '$lib/components/robot-display/EventSummary.svelte';
	import { TBAEvent, TBATeam } from '$lib/utils/tba.js';
	import MatchTable from '$lib/components/robot-display/MatchTable.svelte';

	const { data } = $props();
	const event = $derived(new TBAEvent(data.event));
	const teams = $derived(data.teams.map((t) => new TBATeam(t, event)));
	const team = $derived(new TBATeam(data.team, event));
	$effect(() => nav(event.tba));

	const summary = new Dashboard.Card({
		name: 'Event Summary',
		iconType: 'material-icons',
		icon: 'summarize',
		id: 'card1',
		size: {
			width: 1,
			height: 1,
			sm: {
				width: 2,
				height: 1
			},
			xs: {
				width: 2,
				height: 1
			}
		}
	});

	const comments = new Dashboard.Card({
		name: 'Comments',
		iconType: 'material-icons',
		icon: 'chat',
		id: 'card2',
		size: {
			width: 2,
			height: 1,
			sm: {
				width: 2,
				height: 1
			},
			xs: {
				width: 2,
				height: 1
			}
		}
	});

	const pictures = new Dashboard.Card({
		name: 'Pictures',
		iconType: 'material-icons',
		icon: 'image',
		id: 'card3',
		size: {
			width: 2,
			height: 1,
			sm: {
				width: 2,
				height: 1
			},
			xs: {
				width: 2,
				height: 1
			}
		}
	});

	const actionHeatmap = new Dashboard.Card({
		name: 'Action Heatmap',
		iconType: 'material-icons',
		icon: 'layers',
		id: 'card4',
		size: {
			width: 1,
			height: 1
		}
	});

	const pitScouting = new Dashboard.Card({
		name: 'Pit Scouting',
		iconType: 'material-icons',
		icon: 'question_answer',
		id: 'card6',
		size: {
			width: 1,
			height: 2,
			sm: {
				width: 2,
				height: 2
			},
			xs: {
				width: 2,
				height: 2
			}
		}
	});

	const matchViewer = new Dashboard.Card({
		name: 'Matches',
		iconType: 'material-icons',
		icon: 'preview',
		id: 'card7',
		size: {
			width: 2,
			height: 1,
			sm: {
				width: 2,
				height: 1
			},
			xs: {
				width: 2,
				height: 1
			}
		}
	});
	let dashboard = $state(
		new Dashboard.Dashboard({
			name: `Robot Display: ${data.team.team_number} - ${data.team.nickname}`,
			cards: [summary, pictures, comments, actionHeatmap, pitScouting, matchViewer],
			id: 'robot-display'
		})
	);

	$effect(() => {
		dashboard = new Dashboard.Dashboard({
			name: `Robot Display: ${team.tba.team_number} - ${team.tba.nickname}`,
			cards: [summary, pictures, comments, actionHeatmap, pitScouting, matchViewer],
			id: 'robot-display'
		});
	});

	let scroller: HTMLDivElement;

	afterNavigate(() => {
		const btn = scroller.querySelector(`[data-team="${team.tba.team_number}"]`);
		if (btn) {
			sleep(500).then(() =>
				btn.scrollIntoView({
					behavior: 'smooth',
					block: 'nearest',
					inline: 'center'
				})
			);
		}
	});
</script>

<DB {dashboard}>
	{#snippet body()}
		<div style="grid-column: span var(--grid-size);">
			<div class="ws-nowrap scroll-x p-3 mb-3" bind:this={scroller}>
				{#each teams as t}
					<a
						type="button"
						href="/dashboard/event/{event.tba.key}/team/{t.tba.team_number}"
						class="btn mx-2"
						class:btn-primary={t.tba.team_number !== team.tba.team_number}
						class:btn-outline-secondary={t.tba.team_number === team.tba.team_number}
						class:btn-disabled={t.tba.team_number === team.tba.team_number}
						class:text-muted={t.tba.team_number === team.tba.team_number}
						onclick={(e) => {
							if (t.tba.team_number === team.tba.team_number) {
								return e.preventDefault();
							}
						}}
						data-team={t.tba.team_number}
					>
						{t.tba.team_number}
					</a>
				{/each}
			</div>
			<!-- <div class="btn-group" role="group" aria-label="Basic checkbox toggle button group">
				<input
					type="checkbox"
					class="btn-check"
					id="btncheck1"
					autocomplete="off"
					bind:checked={focus.auto}
				/>
				<label class="btn btn-outline-secondary" for="btncheck1">Auto</label>

				<input
					type="checkbox"
					class="btn-check"
					id="btncheck2"
					autocomplete="off"
					bind:checked={focus.teleop}
				/>
				<label class="btn btn-outline-secondary" for="btncheck2">Teleop</label>

				<input
					type="checkbox"
					class="btn-check"
					id="btncheck3"
					autocomplete="off"
					bind:checked={focus.endgame}
				/>
				<label class="btn btn-outline-secondary" for="btncheck3">Endgame</label>
			</div> -->
		</div>

		{#key team}
			<Card card={summary}>
				{#snippet body()}
					<EventSummary {team} {event} />
				{/snippet}
			</Card>
			<Card card={pictures}>
				{#snippet body()}
					<PictureDisplay {team} {event} />
				{/snippet}
			</Card>
			<Card card={comments}>
				{#snippet body()}
					<TeamComments team={team.tba.team_number} event={event.tba.key} />
				{/snippet}
			</Card>
			<!-- <Card card={actionHeatmap}>
				{#snippet body()}
					<p>This will be the action heatmap card</p>
				{/snippet}
			</Card> -->
			<Card card={pitScouting}>
				{#snippet body()}
					<PitScoutingCard {team} {event} />
				{/snippet}
			</Card>
			<Card card={matchViewer}>
				{#snippet body()}
					<!-- <div class="container-fluid">
						<div class="row mb-3">
							<div class="col-12">
								<a
									href="/dashboard/event/{event.tba.key}/team/{team.tba.team_number}/traces"
									class="btn btn-primary"
								>
									Traces
								</a>
							</div>
						</div>
					</div> -->
					<MatchTable {team} {event} />
				{/snippet}
			</Card>
		{/key}
	{/snippet}
</DB>

<style>
	.btn-disabled {
		pointer-events: none;
	}
</style>
