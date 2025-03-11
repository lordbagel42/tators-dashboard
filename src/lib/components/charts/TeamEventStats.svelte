<script lang="ts">
	import { Scouting } from '$lib/model/scouting';
	import { TBATeam, TBAEvent } from '$lib/utils/tba';
	import { Chart } from 'chart.js';
	import { DataArr } from 'drizzle-struct/front-end';
	import { onMount } from 'svelte';
	import { Trace, TraceSchema, type TraceArray } from 'tatorscout/trace';
	import { $Math as M } from 'ts-utils/math';

	interface Props {
		team: TBATeam;
		event: TBAEvent;
		staticY?: number;
	}

	let { team, event, staticY = $bindable() }: Props = $props();

	let scouting = $state(new DataArr(Scouting.MatchScouting, []));

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	onMount(() => {
		scouting = Scouting.scoutingFromTeam(team.tba.team_number, event.tba.key);
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

				const coral = (section: 'auto' | 'teleop') => (data: (typeof score)[number]) => {
					return data[section].cl1 + data[section].cl2 + data[section].cl3 + data[section].cl4;
				};

				const algae = (section: 'auto' | 'teleop') => (data: (typeof score)[number]) => {
					return data[section].brg + data[section].prc;
				};

				const endgame = (data: (typeof score)[number]) => {
					return data.teleop.park + data.teleop.shc + data.teleop.dpc;
				};

				const average = (numbers: number[]) => {
					if (!numbers.length) return 0;
					return M.average(numbers.filter((n) => !isNaN(n)));
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
