<script lang="ts">
	import { Scouting } from '$lib/model/scouting';
	import { TBATeam, TBAEvent } from '$lib/utils/tba';
	import { Chart } from 'chart.js';
	import { DataArr } from 'drizzle-struct/front-end';
	import { onMount } from 'svelte';
	import { Trace, TraceSchema, type TraceArray } from 'tatorscout/trace';

	interface Props {
		team: TBATeam;
		event: TBAEvent;
		staticY?: number;
		scouting: Scouting.MatchScoutingArr;
	}

	let { team, event, staticY = $bindable(), scouting }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	onMount(() => {
		scouting.sort((a, b) => {
			if (a.data.compLevel === b.data.compLevel)
				return Number(a.data.matchNumber) - Number(b.data.matchNumber);
			const order = ['qm', 'qf', 'sf', 'f'];
			return order.indexOf(String(a.data.compLevel)) - order.indexOf(String(b.data.compLevel));
		});

		return scouting.subscribe((data) => {
			if (chart) chart.destroy();
			try {
				const score = data.map((s) => {
					const trace = TraceSchema.parse(JSON.parse(s.data.trace || '[]')) as TraceArray;
					return Trace.score.parse2025(trace, (s.data.alliance || 'red') as 'red' | 'blue');
				});
				const labels = data.map((s) => `${s.data.compLevel}${s.data.matchNumber}`);

				const datasets = [
					{
						label: 'Coral',
						data: score.map(
							(s) =>
								s.auto.cl1 +
								s.auto.cl2 +
								s.auto.cl3 +
								s.auto.cl4 +
								s.teleop.cl1 +
								s.teleop.cl2 +
								s.teleop.cl3 +
								s.teleop.cl4
						)
					},
					{
						label: 'Algae',
						data: score.map((s) => s.auto.brg + s.auto.prc + s.teleop.brg + s.teleop.prc)
					},
					{
						label: 'Endgame',
						data: score.map((s) => s.teleop.park + s.teleop.shc + s.teleop.dpc)
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
