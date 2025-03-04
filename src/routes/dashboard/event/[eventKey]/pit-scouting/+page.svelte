<script lang="ts">
	import '$lib/imports/robot-display.js';
	import { page } from '$app/state';
	import { Scouting } from '$lib/model/scouting';
	import { DataArr } from 'drizzle-struct/front-end';
	import { onMount } from 'svelte';

	const { data } = $props();
	const { eventKey } = data;
	let sections = $state(new DataArr(Scouting.PIT.Sections, []));

	onMount(() => {
		sections = Scouting.PIT.Sections.fromProperty('eventKey', page.params.eventKey, false);
		sections.sort((a, b) => Number(a.data.order) - Number(b.data.order));
	});
</script>

<div class="container-fluid">
	<div class="row mb-3">
		<h1>Pit Scouting</h1>
		<small class="text-muted">Select a section to scout</small>
	</div>
	{#if $sections.length}
		<div class="row mb-3">
			{#each $sections as section, i}
				<div class="col-md-4 p-3">
					<a
						href="/dashboard/event/{eventKey}/pit-scouting/{i}"
						class="text-reset text-decoration-none"
					>
						<!-- <a href="{location.href}/pitscouting/{i}">  -->
						<div class="card">
							<div class="card-body">
								<h5 class="card-title">{section.data.name}</h5>
							</div>
						</div>
					</a>
				</div>
			{/each}
		</div>
	{:else}
		<div class="row">
			<p>No sections found</p>
		</div>
	{/if}
</div>
