<script lang="ts">
	import { MatchCanvas } from '$lib/model/match-canvas';
	import type { Scouting } from '$lib/model/scouting';
	import { TBAEvent } from '$lib/utils/tba';
	import { Canvas } from 'canvas/canvas';
	import { onMount } from 'svelte';
	import { TraceSchema, type TraceArray } from 'tatorscout/trace';

	interface Props {
		scouting: Scouting.MatchScoutingData;
		event: TBAEvent;
	}

	const { scouting, event }: Props = $props();

	let target: HTMLCanvasElement;
	// let canvas: Canvas|undefined = $state(undefined);
	let matchCanvas: MatchCanvas | undefined = $state(undefined);

	onMount(() => {
		const ctx = target.getContext('2d');
		if (!ctx) throw new Error('Could not get 2d context');

		// canvas = new Canvas(ctx);
		const trace = TraceSchema.safeParse(JSON.parse(scouting.data.trace || '[]'));
		if (trace.success) {
			matchCanvas = new MatchCanvas(trace.data as TraceArray, event.tba.year, ctx);
			matchCanvas.animate();
			matchCanvas.canvas.height = 500;
			matchCanvas.canvas.width = 1000;
			// matchCanvas.canvas.ctx.canvas.style.height = "150px";
			// matchCanvas.canvas.ctx.canvas.style.width = "300px";
		}
	});
</script>

<div class="card">
	<div class="card-body py-3 px-1">
		<canvas
			bind:this={target}
			style="
            height: auto;
            width: 100%;
            aspect-ratio: 2 / 1;
            display: block;
        "
		></canvas>
	</div>
</div>
