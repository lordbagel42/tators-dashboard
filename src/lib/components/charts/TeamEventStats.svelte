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

				const processor = (section: 'auto' | 'teleop') => (data: (typeof score)[number]) => {
					return data.traceScore[section].prc;
				};

				const barge = (section: 'auto' | 'teleop') => (data: (typeof score)[number]) => {
					return data.traceScore[section].brg;
				};

				const endgame = (data: (typeof score)[number]) => {
					return {
						parked: data.endgamePoints === 2 ? 2 : 0,
						shallowClimb: data.endgamePoints === 6 ? 6 : 0,
						deepClimb: data.endgamePoints === 12 ? 12 : 0
					};
				};

				const average = (numbers: number[]) => {
					return numbers.reduce((acc, n) => acc + n, 0) / numbers.length;
				};

				const datasets = [
					{
						label: 'Level 1',
						data: [
							// Auto
							Math.min(...score.map((s) => s.traceScore.auto.cl1)),
							average(score.map((s) => s.traceScore.auto.cl1)),
							Math.max(...score.map((s) => s.traceScore.auto.cl1)),
							// Teleop
							Math.min(...score.map((s) => s.traceScore.teleop.cl1)),
							average(score.map((s) => s.traceScore.teleop.cl1)),
							Math.max(...score.map((s) => s.traceScore.teleop.cl1)),
							// Endgame
							0,
							0,
							0,
							// Total
							Math.min(...score.map((s) => s.traceScore.auto.cl1 + s.traceScore.teleop.cl1)),
							average(score.map((s) => s.traceScore.auto.cl1 + s.traceScore.teleop.cl1)),
							Math.max(...score.map((s) => s.traceScore.auto.cl1 + s.traceScore.teleop.cl1))
						]
					},
					{
						label: 'Level 2',
						data: [
							// Auto
							Math.min(...score.map((s) => s.traceScore.auto.cl2)),
							average(score.map((s) => s.traceScore.auto.cl2)),
							Math.max(...score.map((s) => s.traceScore.auto.cl2)),
							// Teleop
							Math.min(...score.map((s) => s.traceScore.teleop.cl2)),
							average(score.map((s) => s.traceScore.teleop.cl2)),
							Math.max(...score.map((s) => s.traceScore.teleop.cl2)),
							// Endgame
							0,
							0,
							0,
							// Total
							Math.min(...score.map((s) => s.traceScore.auto.cl2 + s.traceScore.teleop.cl2)),
							average(score.map((s) => s.traceScore.auto.cl2 + s.traceScore.teleop.cl2)),
							Math.max(...score.map((s) => s.traceScore.auto.cl2 + s.traceScore.teleop.cl2))
						]
					},
					{
						label: 'Level 3',
						data: [
							// Auto
							Math.min(...score.map((s) => s.traceScore.auto.cl3)),
							average(score.map((s) => s.traceScore.auto.cl3)),
							Math.max(...score.map((s) => s.traceScore.auto.cl3)),
							// Teleop
							Math.min(...score.map((s) => s.traceScore.teleop.cl3)),
							average(score.map((s) => s.traceScore.teleop.cl3)),
							Math.max(...score.map((s) => s.traceScore.teleop.cl3)),
							// Endgame
							0,
							0,
							0,
							// Total
							Math.min(...score.map((s) => s.traceScore.auto.cl3 + s.traceScore.teleop.cl3)),
							average(score.map((s) => s.traceScore.auto.cl3 + s.traceScore.teleop.cl3)),
							Math.max(...score.map((s) => s.traceScore.auto.cl3 + s.traceScore.teleop.cl3))
						]
					},
					{
						label: 'Level 4',
						data: [
							// Auto
							Math.min(...score.map((s) => s.traceScore.auto.cl4)),
							average(score.map((s) => s.traceScore.auto.cl4)),
							Math.max(...score.map((s) => s.traceScore.auto.cl4)),
							// Teleop
							Math.min(...score.map((s) => s.traceScore.teleop.cl4)),
							average(score.map((s) => s.traceScore.teleop.cl4)),
							Math.max(...score.map((s) => s.traceScore.teleop.cl4)),
							// Endgame
							0,
							0,
							0,
							// Total
							Math.min(...score.map((s) => s.traceScore.auto.cl4 + s.traceScore.teleop.cl4)),
							average(score.map((s) => s.traceScore.auto.cl4 + s.traceScore.teleop.cl4)),
							Math.max(...score.map((s) => s.traceScore.auto.cl4 + s.traceScore.teleop.cl4))
						]
					},
					{
						label: 'Barge',
						data: [
							// Auto
							Math.min(...score.map(barge('auto'))),
							average(score.map(barge('auto'))),
							Math.max(...score.map(barge('auto'))),
							// Teleop
							Math.min(...score.map(barge('teleop'))),
							average(score.map(barge('teleop'))),
							Math.max(...score.map(barge('teleop'))),
							// Endgame
							0,
							0,
							0,
							// Total
							Math.min(...score.map((s) => barge('auto')(s) + barge('teleop')(s))),
							average(score.map((s) => barge('auto')(s) + barge('teleop')(s))),
							Math.max(...score.map((s) => barge('auto')(s) + barge('teleop')(s)))
						]
					},
					{
						label: 'Processor',
						data: [
							// Auto
							Math.min(...score.map(processor('auto'))),
							average(score.map(processor('auto'))),
							Math.max(...score.map(processor('auto'))),
							// Teleop
							Math.min(...score.map(processor('teleop'))),
							average(score.map(processor('teleop'))),
							Math.max(...score.map(processor('teleop'))),
							// Endgame
							0,
							0,
							0,
							// Total
							Math.min(...score.map((s) => processor('auto')(s) + processor('teleop')(s))),
							average(score.map((s) => processor('auto')(s) + processor('teleop')(s))),
							Math.max(...score.map((s) => processor('auto')(s) + processor('teleop')(s)))
						]
					},
					{
						label: 'Parked',
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
							Math.min(...score.map((s) => endgame(s).parked)),
							average(score.map((s) => endgame(s).parked)),
							Math.max(...score.map((s) => endgame(s).parked)),
							// Total
							Math.min(...score.map((s) => endgame(s).parked)),
							average(score.map((s) => endgame(s).parked)),
							Math.max(...score.map((s) => endgame(s).parked))
						]
					},
					{
						label: 'Shallow Climb',
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
							Math.min(...score.map((s) => endgame(s).shallowClimb)),
							average(score.map((s) => endgame(s).shallowClimb)),
							Math.max(...score.map((s) => endgame(s).shallowClimb)),
							// Total
							Math.min(...score.map((s) => endgame(s).shallowClimb)),
							average(score.map((s) => endgame(s).shallowClimb)),
							Math.max(...score.map((s) => endgame(s).shallowClimb))
						]
					},
					{
						label: 'Deep Climb',
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
							Math.min(...score.map((s) => endgame(s).deepClimb)),
							average(score.map((s) => endgame(s).deepClimb)),
							Math.max(...score.map((s) => endgame(s).deepClimb)),
							// Total
							Math.min(...score.map((s) => endgame(s).deepClimb)),
							average(score.map((s) => endgame(s).deepClimb)),
							Math.max(...score.map((s) => endgame(s).deepClimb))
						]
					}
				];

				const colors = [
					'rgba(255, 99, 132, 0.2)', // Level 1
					'rgba(54, 162, 235, 0.2)', // Level 2
					'rgba(255, 206, 86, 0.2)', // Level 3
					'rgba(75, 192, 192, 0.2)', // Level 4
					'rgba(153, 102, 255, 0.2)', // Barge
					'rgba(255, 159, 64, 0.2)', // Processor
					'rgba(201, 203, 207, 0.2)', // Park
					'rgba(100, 149, 237, 0.2)', // Shallow Climb
					'rgba(255, 215, 0, 0.2)'  // Deep Climb
				];

				const borderColors = [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)',
					'rgba(201, 203, 207, 1)',
					'rgba(100, 149, 237, 1)',
					'rgba(255, 215, 0, 1)'
				];

				// Assign colors to datasets
				for (let i = 0; i < datasets.length; i++) {
					datasets[i].backgroundColor = colors[i];
					datasets[i].borderColor = borderColors[i];
					datasets[i].borderWidth = 1;
				}

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
