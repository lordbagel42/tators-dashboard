<script lang="ts">
	import { Canvas } from 'canvas/canvas';
	import { Circle } from 'canvas/circle';
	import { Container } from 'canvas/container';
	import type { Drawable } from 'canvas/drawable';
	import { Img } from 'canvas/image';
	import { Path } from 'canvas/path';
	import { onMount } from 'svelte';
	import type { TraceArray } from 'tatorscout/trace';
	interface Props {
		trace: TraceArray;
		year: number;
	}

	const { trace, year }: Props = $props();

	let target: HTMLCanvasElement;

	onMount(() => {
		const ctx = target.getContext('2d');
		if (!ctx) {
			throw new Error('Could not get 2d context');
		}
		const canvas = new Canvas(ctx, {
			events: ['click']
		});
		const field = new Img(`/fields/${year}.png`, {
			width: 1,
			height: 1
		});
		const container = new Container(
			...(trace
				.map((p, i, a) => {
					if (i === 0) {
						const [, x, y, a] = p;
						if (a) {
							return new Circle([x, y], 0.03);
						}
						return;
					}
					const [, x, y, act] = p;
					const [, prevX, prevY] = a[i - 1];
					const path = new Path([
						[prevX, prevY],
						[x, y]
					]);

					// if (i < SECTIONS.auto[1]) {
					// 	path.properties.line.color = 'blue';
					// } else if (i < SECTIONS.teleop[1]) {
					// 	path.properties.line.color = 'green';
					// } relse {
					// 	path.properties.line.color = 'red';
					// }

					if (act) {
						const action = new Circle([x, y], 0.03);
						action.fill.color = 'red';
						action.properties.line.color = 'red';
						const img = new Img(`/icons/${act}.png`, {
							width: 0.05,
							height: 0.05,
							x: x - 0.025,
							y: y - 0.025
						});
						return [path, new Container(action, img)];
					}

					return [path];
				})
				.filter((d) => d)
				.flat() as Drawable[])
		);
		canvas.add(field, container);

		return canvas.animate();
	});
</script>

<canvas bind:this={target} style="width: 100%; aspect-ratio: 2;" height="500" width="1000"></canvas>
