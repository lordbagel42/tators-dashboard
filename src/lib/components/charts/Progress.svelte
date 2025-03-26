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
					const match = matches.find(m => m.tba.match_number === s.data.matchNumber && m.tba.comp_level === s.data.compLevel);
					const trace = TraceSchema.parse(JSON.parse(s.data.trace || '[]')) as TraceArray;
					const traceScore = Trace.score.parse2025(trace, (s.data.alliance || 'red') as 'red' | 'blue');
					if (!match) return {
						traceScore,
						autoPoints: 0,
						endgamePoints: 0,
					}
					const match2025Res = match.asYear(2025);
					if (match2025Res.isErr()) return {
						traceScore,
						autoPoints: 0,
						endgamePoints: 0,
					}
					const match2025 = match2025Res.unwrap();
					const redPosition = match2025.alliances.red.team_keys.indexOf(team.tba.key);
					const bluePosition = match2025.alliances.blue.team_keys.indexOf(team.tba.key);
					const alliance = redPosition !== -1 ? 'red' : bluePosition !== -1 ? 'blue' : null;
					const position = alliance === 'red' ? redPosition : alliance === 'blue' ? bluePosition: -1;
					let endgamePoints = 0;
					let autoPoints = 0;
					if (alliance) {
						const mobilityRobots = [
							match2025.score_breakdown[alliance].autoLineRobot1,
							match2025.score_breakdown[alliance].autoLineRobot2,
							match2025.score_breakdown[alliance].autoLineRobot3,
						];

						autoPoints = 3 * Number(mobilityRobots[position] === 'Yes'); 

						const endgameRobots = [
							match2025.score_breakdown[alliance].endGameRobot1, // Parked, DeepClimb, ShallowClimb
							match2025.score_breakdown[alliance].endGameRobot2,
							match2025.score_breakdown[alliance].endGameRobot3,
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
						endgamePoints,
					}
				});
				const labels = data.map((s) => `${s.data.compLevel}${s.data.matchNumber}`);

				const datasets = [
					{
						label: 'Coral',
						data: score.map(
							(s) =>
								s.traceScore.auto.cl1 +
								s.traceScore.auto.cl2 +
								s.traceScore.auto.cl3 +
								s.traceScore.auto.cl4 +
								s.traceScore.teleop.cl1 +
								s.traceScore.teleop.cl2 +
								s.traceScore.teleop.cl3 +
								s.traceScore.teleop.cl4
						)
					},
					{
						label: 'Algae',
						data: score.map((s) => s.traceScore.auto.brg + s.traceScore.auto.prc + s.traceScore.teleop.brg + s.traceScore.teleop.prc)
					},
					{
						label: 'Endgame',
						data: score.map((s) => s.endgamePoints)
					}
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
								max: staticY
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
