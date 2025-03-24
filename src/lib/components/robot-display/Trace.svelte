<script lang="ts">
	import { MatchCanvas } from '$lib/model/match-canvas';
	import type { Scouting } from '$lib/model/scouting';
	import { TBAEvent } from '$lib/utils/tba';
	import { Canvas } from 'canvas/canvas';
	import { onMount } from 'svelte';
	import { TraceSchema, type TraceArray } from 'tatorscout/trace';
	import rangeSlider from 'range-slider-input';
	import { writable, type Writable } from 'svelte/store';

	interface Props {
		scouting: Scouting.MatchScoutingData;
		event: TBAEvent;
		focus?: Writable<'auto' | 'teleop' | 'endgame' | 'all'>;
	}

	const {
		scouting,
		event,
		focus = writable<'auto' | 'teleop' | 'endgame' | 'all'>('all')
	}: Props = $props();

	let target: HTMLCanvasElement;
	// let canvas: Canvas|undefined = $state(undefined);
	let matchCanvas: MatchCanvas | undefined = $state(undefined);
	let slider: HTMLDivElement;

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
		} else {
			console.error(trace.error);
		}

		const s = rangeSlider(slider, {
			max: matchCanvas?.trace.length || 0,
			step: 1,
			min: 0,
			value: [0, matchCanvas?.trace.length || 0],
			onInput: ([min, max]) => {
				console.log('Input', min, max);
				matchCanvas?.between(min, max);
			}
		});

		const sub = focus.subscribe((f) => {
			switch (f) {
				case 'auto':
					// matchCanvas?.auto();
					s.value([0, 15 * 4]);
					break;
				case 'teleop':
					// matchCanvas?.teleop();
					s.value([15 * 4, 135 * 4]);
					break;
				case 'endgame':
					// matchCanvas?.endgame();
					s.value([135 * 4, matchCanvas?.trace.length || 0]);
					break;
				case 'all':
					// matchCanvas?.reset();
					s.value([0, matchCanvas?.trace.length || 0]);
					break;
			}
		});

		return () => {
			sub();
		};
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
			class="mb-3"
		></canvas>
		<div bind:this={slider}></div>
	</div>
</div>
