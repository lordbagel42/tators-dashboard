<script lang="ts">
	import type { Scouting } from "$lib/model/scouting";
	import { TBAEvent, TBAMatch, TBATeam } from "$lib/utils/tba";
    import { Chart } from 'chart.js';
	import { onMount } from "svelte";
	import { Trace, TraceSchema, type TraceArray } from "tatorscout/trace";

    interface Props {
		match: TBAMatch;
		scouting: Scouting.MatchScoutingData;
		team: TBATeam;
		// focus: Focus;
		event: TBAEvent;
	}

    const { scouting, team, event, match }: Props = $props();

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return console.error("Could not get canvas context");
try {
	
			const trace = TraceSchema.safeParse(JSON.parse(scouting.data.trace || '[]'));
	
			if (!trace.success) {
				console.error("Could not parse trace");
				return;
			}
	
			const res = Trace.score.parse2025(
				trace.data as TraceArray,
				(scouting.data.alliance || 'red') as 'red' | 'blue',
			);
	
			const chart = new Chart(canvas, {
				type: 'bar',
				data: {
					datasets: [{
						label: 'Coral Points',
						data: [
							res.auto.cl1 + res.auto.cl2 + res.auto.cl3 + res.auto.cl4,
							res.teleop.cl1 + res.teleop.cl2 + res.teleop.cl3 + res.teleop.cl4,
							0,
							res.auto.cl1 + res.auto.cl2 + res.auto.cl3 + res.auto.cl4 + res.teleop.cl1 + res.teleop.cl2 + res.teleop.cl3 + res.teleop.cl4,
						],
					}, {
						label: 'Algae Points',
						data: [
							res.auto.brg + res.auto.prc,
							res.teleop.brg + res.teleop.prc,
							0,
							res.auto.brg + res.auto.prc + res.teleop.brg + res.teleop.prc,
						],
					}, {
						label: 'Endgame Points',
						data: [
							0, 
							0, 
							res.teleop.dpc + res.teleop.shc + res.teleop.park,
							res.teleop.dpc + res.teleop.shc + res.teleop.park
						]
					}],
					labels: ['Auto', 'Teleop', 'Endgame', 'Total'],
				},
				options: {
					scales: {
						y: {
							stacked: true,
						},
						x: {
							stacked: true,
						},
					},
					responsive: true,
				}
			});
	
			chart.render();
	
			return () => chart.destroy();
} catch (error) {
	
}
	});
</script>

<canvas bind:this={canvas}></canvas>