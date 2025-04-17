<script lang="ts">
	import { Scouting } from '$lib/model/scouting';
	import { TBATeam, TBAEvent, TBAMatch } from '$lib/utils/tba';
	import { Chart } from 'chart.js';
	import { onMount } from 'svelte';
	import { TraceSchema, type TraceArray } from 'tatorscout/trace';

	interface Props {
		team: TBATeam;
		event: TBAEvent;
		matches: TBAMatch[];
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

		return scouting.subscribe(async (data) => {
			if (chart) chart.destroy();
			try {
				const countsPerMatch = data.map((d) => {
					const trace = TraceSchema.parse(JSON.parse(d.data.trace || '[]')) as TraceArray;

					return trace.reduce(
						(acc, curr) => {
							if (!curr[3]) return acc;
							if (
								['cl1', 'cl2', 'cl3', 'cl4', 'brg', 'prc', 'shc', 'dpc', 'prk'].includes(
									curr[3] as string
								)
							) {
								acc[curr[3] as string] = (acc[curr[3] as string] || 0) + 1;
							}
							return acc;
						},
						{} as Record<string, number>
					);
				});

				const labels = data.map((d) => `${d.data.compLevel}${d.data.matchNumber}`);
				const actionKeys = [
					'cl1', // Level 1
					'cl2', // Level 2
					'cl3', // Level 3
					'cl4', // Level 4
					'brg', // Barge
					'prc', // Processor
					'shc', // Shallow Climb
					'dpc', // Deep Climb
					'prk' // Parked
				];

				const actionLabels = [
					'Level 1',
					'Level 2',
					'Level 3',
					'Level 4',
					'Barge',
					'Processor',
					'Shallow Climb',
					'Deep Climb',
					'Parked'
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
					'rgba(255, 215, 0, 0.2)' // Deep Climb
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

				const datasets = actionKeys.map((key, index) => {
					return {
						label: actionLabels[index],
						data: countsPerMatch.map((count) => count[key] || 0),
						backgroundColor: colors[index % colors.length],
						borderColor: borderColors[index % borderColors.length],
						borderWidth: 1
					};
				});

				chart = new Chart(canvas, {
					type: 'bar',
					data: {
						labels,
						datasets
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						scales: {
							y: {
								beginAtZero: true,
								stacked: true
							},
							x: {
								stacked: true
							}
						}
					}
				});
			} catch (error) {
				console.error(`Error generating progress chart for team ${team.tba.team_number}:`, error);
			}
		});
	});
</script>

<canvas bind:this={canvas} class="h-100 w-100"></canvas>
