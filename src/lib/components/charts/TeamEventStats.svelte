<script lang="ts">
	import { Scouting } from '$lib/model/scouting';
	import { TBATeam, TBAEvent, TBAMatch } from '$lib/utils/tba';
	import { Chart } from 'chart.js';
	import { DataArr } from 'drizzle-struct/front-end';
	import { onMount } from 'svelte';
	import { Trace, TraceSchema, type TraceArray } from 'tatorscout/trace';
	import { match as matchCase } from 'ts-utils/match';

	interface Props {
		team: TBATeam;
		event: TBAEvent;
		staticY?: number;
		scouting: Scouting.MatchScoutingArr;
		matches: TBAMatch[];
	}

	let { team, event, staticY = $bindable(), scouting, matches }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	onMount(() => {
		scouting.sort((a, b) => {
			if (a.data.compLevel === b.data.compLevel)
				return Number(a.data.matchNumber) - Number(b.data.matchNumber);
			const order = ['qm', 'qf', 'sf', 'f'];
			return order.indexOf(String(a.data.compLevel)) - order.indexOf(String(b.data.compLevel));
		});

		return scouting.subscribe(async (data) => {
			if (chart) chart.destroy();
			try {
				const score = data.map((s) => {
					const match = matches.find(
						(m) =>
							m.tba.match_number === s.data.matchNumber && m.tba.comp_level === s.data.compLevel
					);
					const trace = TraceSchema.parse(JSON.parse(s.data.trace || '[]')) as TraceArray;
					const traceScore = Trace.score.parse2025(
						trace,
						(s.data.alliance || 'red') as 'red' | 'blue'
					);
					if (!match)
						return {
							traceScore,
							autoPoints: 0,
							endgamePoints: 0
						};
					const match2025Res = match.asYear(2025);
					if (match2025Res.isErr())
						return {
							traceScore,
							autoPoints: 0,
							endgamePoints: 0
						};
					const match2025 = match2025Res.unwrap();
					const redPosition = match2025.alliances.red.team_keys.indexOf(team.tba.key);
					const bluePosition = match2025.alliances.blue.team_keys.indexOf(team.tba.key);
					const alliance = redPosition !== -1 ? 'red' : bluePosition !== -1 ? 'blue' : null;
					const position =
						alliance === 'red' ? redPosition : alliance === 'blue' ? bluePosition : -1;
					let endgamePoints = 0;
					let autoPoints = 0;
					if (alliance) {
						const mobilityRobots = [
							match2025.score_breakdown[alliance].autoLineRobot1,
							match2025.score_breakdown[alliance].autoLineRobot2,
							match2025.score_breakdown[alliance].autoLineRobot3
						];

						autoPoints = 3 * Number(mobilityRobots[position] === 'Yes');

						const endgameRobots = [
							match2025.score_breakdown[alliance].endGameRobot1, // Parked, DeepClimb, ShallowClimb
							match2025.score_breakdown[alliance].endGameRobot2,
							match2025.score_breakdown[alliance].endGameRobot3
						];

						endgamePoints = matchCase<string, number>(endgameRobots[position])
							.case('Parked', () => 2)
							.case('ShallowCage', () => 6)
							.case('DeepCage', () => 12)
							.default(() => 0)
							.exec()
							.unwrap();
					}

					return {
						traceScore,
						autoPoints,
						endgamePoints
					};
				});

				const coral = (section: 'auto' | 'teleop') => (data: (typeof score)[number]) => {
					return (
						data.traceScore[section].cl1 +
						data.traceScore[section].cl2 +
						data.traceScore[section].cl3 +
						data.traceScore[section].cl4
					);
				};

				const algae = (section: 'auto' | 'teleop') => (data: (typeof score)[number]) => {
					return data.traceScore[section].brg + data.traceScore[section].prc;
				};

				const endgame = (data: (typeof score)[number]) => {
					return data.endgamePoints;
				};

				const average = (numbers: number[]) => {
					return numbers.reduce((acc, n) => acc + n, 0) / numbers.length;
				};

				const datasets = [
					{
						label: 'Coral',
						data: [
							// Auto
							Math.min(...score.map(coral('auto'))),
							average(score.map(coral('auto'))),
							Math.max(...score.map(coral('auto'))),
							// Teleop
							Math.min(...score.map(coral('teleop'))),
							average(score.map(coral('teleop'))),
							Math.max(...score.map(coral('teleop'))),
							// Endgame
							0,
							0,
							0,
							// Total
							Math.min(...score.map((s) => coral('auto')(s) + coral('teleop')(s))),
							average(score.map((s) => coral('auto')(s) + coral('teleop')(s))),
							Math.max(...score.map((s) => coral('auto')(s) + coral('teleop')(s)))
						]
					},
					{
						label: 'Algae',
						data: [
							// Auto
							Math.min(...score.map(algae('auto'))),
							average(score.map(algae('auto'))),
							Math.max(...score.map(algae('auto'))),
							// Teleop
							Math.min(...score.map(algae('teleop'))),
							average(score.map(algae('teleop'))),
							Math.max(...score.map(algae('teleop'))),
							// Endgame
							0,
							0,
							0,
							// Total
							Math.min(...score.map((s) => algae('auto')(s) + algae('teleop')(s))),
							average(score.map((s) => algae('auto')(s) + algae('teleop')(s))),
							Math.max(...score.map((s) => algae('auto')(s) + algae('teleop')(s)))
						]
					},
					{
						label: 'Endgame',
						data: [
							// Auto
							0,
							0,
							0,
							// Teleop
							0,
							0,
							0,
							// Endgame
							Math.min(...score.map(endgame)),
							average(score.map(endgame)),
							Math.max(...score.map(endgame)),
							// Total
							Math.min(...score.map(endgame)),
							average(score.map(endgame)),
							Math.max(...score.map(endgame))
						]
					}
				];


				const labels = [
					'Min Auto',
					'Avg Auto',
					'Max Auto',
					'Min Tele',
					'Avg Tele',
					'Max Tele',
					'Min End',
					'Avg End',
					'Max End',
					'Min Total',
					'Avg Total',
					'Max Total'
				];


				let max = 0;
				for (let i = 0; i < labels.length; i++) {
					const sum = datasets.reduce((acc, d) => acc + d.data[i], 0);
					if (sum === Infinity) continue;
					max = Math.max(max, sum);
				}
				staticY = Math.max(staticY || 0, max);

				chart = new Chart(canvas, {
					options: {
						scales: {
							y: {
								beginAtZero: true,
								stacked: true,
								max: staticY ? staticY : undefined
							},
							x: {
								stacked: true
							}
						},
						responsive: true,
						maintainAspectRatio: false
					},
					type: 'bar',
					data: {
						datasets,
						labels
					}
				});
			} catch (error) {
				console.error(`Error generating progress chart for team ${team.tba.team_number}:`, error);
			}
		});
	});
</script>

<canvas bind:this={canvas} class="h-100 w-100"></canvas>
