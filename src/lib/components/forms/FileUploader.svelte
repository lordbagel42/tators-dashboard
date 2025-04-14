<script lang="ts">
	import Uppy from '@uppy/core';
	import { Dashboard } from '@uppy/svelte';
	import XHRUpload from '@uppy/xhr-upload';
	import ImageEditor from '@uppy/image-editor';
	import Compressor from '@uppy/compressor';
	import { EventEmitter } from 'ts-utils/event-emitter';
	import { z } from 'zod';

	import '@uppy/core/dist/style.min.css';
	import '@uppy/dashboard/dist/style.min.css';
	import '@uppy/image-editor/dist/style.min.css';

	const emitter = new EventEmitter<{
		load: string;
		error: string;
	}>();

	export const on = emitter.on.bind(emitter);

	interface Props {
		multiple: boolean; // this doesn't actually do anything, i'm unsure how to handle this server-side
		message: string; // this is also not used, but I am unsure what its purpose is.
		endpoint: string;
	}

	let uppyHeight = $state('100%'); // number representing pixels

	const { multiple, message, endpoint }: Props = $props();

	let uppy = new Uppy({ autoProceed: true, restrictions: { maxNumberOfFiles: 1 } })
		.use(XHRUpload, {
			endpoint,
			onAfterResponse(xhr, retryCount) {
				console.log(xhr.responseText);

				if (xhr.status >= 200 && xhr.status < 300) {
					emitter.emit(
						'load',
						z
							.object({
								url: z.string()
							})
							.parse(JSON.parse(xhr.responseText)).url
					);
				} else {
					console.error(xhr.responseText);
					emitter.emit('error', 'Failed to upload file.');
				}
			}
		})
		.use(Compressor)
		.use(ImageEditor);
</script>

<div class="">
	<Dashboard
		{uppy}
		props={{
			theme: 'dark',
			proudlyDisplayPoweredByUppy: false,
			height: uppyHeight,
			autoOpen: 'imageEditor',
			inline: false
		}}
	/>
</div>
