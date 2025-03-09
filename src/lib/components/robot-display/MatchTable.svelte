<script lang="ts">
	import { dateTime } from 'ts-utils/clock';
	import { Scouting } from '$lib/model/scouting';
	import { onMount } from 'svelte';
	import { TBATeam, TBAMatch, TBAEvent } from '$lib/utils/tba';
	import { DataArr } from 'drizzle-struct/front-end';
	import MatchDisplay from './MatchDisplay.svelte';

	interface Props {
		event: TBAEvent;
		team: TBATeam;
	}

	const { team, event }: Props = $props();

	let matches: TBAMatch[] = $state([]);

	let matchScouting = $state(new DataArr(Scouting.MatchScouting, []));

	const generateMatchStr = (match: TBAMatch) => {
		if (match.tba.comp_level === 'sf') {
			return `sf ${match.tba.set_number}`;
		} else {
			return `${match.tba.comp_level} ${match.tba.match_number}`;
		}
	};

	const generateTime = (match: TBAMatch) => {
		if (match.tba.actual_time) {
			return dateTime(match.tba.actual_time * 1000);
		} else {
			return dateTime(Number(match.tba.predicted_time) * 1000);
		}
	};

	const generateFlagColor = (match?: Scouting.MatchScoutingData) => {
		if (!match) return 'danger';
		// TODO: Implement flag color
		return 'success';
	};

	const generateFlagTitle = (match?: Scouting.MatchScoutingData) => {
		if (!match) return 'No Scouting data';
		// TODO: Parse checks
		return 'Scouting data available';
	};

	const generateStatus = (match: TBAMatch) => {
		if (!match.tba.score_breakdown) {
			return 'Not Played';
		} else {
			return 'Played';
		}
	};

	onMount(() => {
		team.getMatches().then((m) => {
			if (m.isOk()) {
				matches = m.value;
			}
		});

		matchScouting = Scouting.scoutingFromTeam(team.tba.team_number, event.tba.key);

		// import('bootstrap').then((bs) => {
		// 	table?.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
		// 		new bs.Tooltip(el);
		// 	});
		// });

		matchScouting.subscribe(console.log);

		return () => {
			// import('bootstrap').then((bs) => {
			// 	table?.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
			// 		const tooltip = bs.Tooltip.getInstance(el);
			// 		if (tooltip) tooltip.dispose();
			// 	});
			// });
		};
	});

	let table: HTMLTableElement;

	const findMatch = (scouting: Scouting.MatchScoutingData[], match: TBAMatch) => {
		return scouting.find((m) => {
			if (match.tba.comp_level === 'sf') {
				return m.data.compLevel === 'sf' && m.data.matchNumber === match.tba.set_number;
			} else {
				return (
					m.data.compLevel === match.tba.comp_level && m.data.matchNumber === match.tba.match_number
				);
			}
		});
	};
</script>

<div class="scroll-y" style="overflow-y: hidden; max-height: 100%;">
	<div class="table-responsive">
		<a
			href="/dashboard/event/{event.tba.key}/team/{team.tba.team_number}/traces"
			class="btn btn-primary"
		>
			View all Traces
		</a>
		<table class="table table-striped table-hover" bind:this={table}>
			<thead>
				<tr>
					<th>Match</th>
					<th>Time</th>
					<th>Flag</th>
					<th>Status</th>
					<th>View</th>
				</tr>
			</thead>
			<tbody>
				{#each matches as match}
					<tr>
						<td>{generateMatchStr(match)}</td>
						<td>{generateTime(match)}</td>
						<td>
							<i
								class="material-icons text-{generateFlagColor(findMatch($matchScouting, match))}"
								style="color: "
								title={generateFlagTitle(findMatch($matchScouting, match))}
							>
								flag
							</i>
						</td>
						<td>{generateStatus(match)}</td>
						<td>
							<a
								href="/dashboard/event/{event.tba.key}/team/{team.tba.team_number}/match/{match.tba
									.comp_level}/{match.tba.match_number}"
								class="btn btn-primary"
							>
								<i class="material-icons">visibility</i></a
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
