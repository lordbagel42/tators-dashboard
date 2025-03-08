<script lang="ts">
	import '$lib/imports/robot-display.js';
	import { Scouting } from '$lib/model/scouting';
	import { alert, confirm, prompt, select } from '$lib/utils/prompts';
	import { DataArr } from 'drizzle-struct/front-end';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { TBAEvent } from '$lib/utils/tba.js';

	const { data } = $props();
	const { eventKey, year } = data;

	let sections = $state(new DataArr(Scouting.PIT.Sections, []));

	onMount(() => {
		sections = Scouting.PIT.Sections.fromProperty('eventKey', page.params.eventKey, false);
		sections.sort((a, b) => Number(a.data.order) - Number(b.data.order));
	});

	const addSection = async () => {
		const name = await prompt('Section Name');
		if (!name) return;

		const res = await Scouting.PIT.Sections.new({
			name,
			order: $sections.length,
			eventKey
		});
	};

	const copy = async () => {
		try {
			const events = (await TBAEvent.getEvents(year))
				.unwrap()
				.filter((e) => e.tba.key !== eventKey);

			const withSections = (
				await Promise.all(
					events.map(async (e) => {
						const sections = (
							await Scouting.PIT.Sections.fromProperty('eventKey', e.tba.key, true).await()
						).unwrap();
						return { event: e, sections };
					})
				)
			).filter((e) => e.sections.length);

			const selected = await select(
				'Choose an event to copy from',
				withSections.map((e) => e.event.tba.name)
			);

			if (!selected) return;
			Scouting.PIT.Sections.call('copy-from-event', {
				from: selected,
				to: eventKey
			});
		} catch (err) {
			console.error(err);
		}
	};
	const generateEventTemplate = async () => {
		if (!(await confirm('Are you sure you want to generate an event template?'))) return;
		const res = await Scouting.PIT.Sections.call('generate-event-template', {
			eventKey: eventKey
		});
		if (res.isErr()) return console.error(res.error);
		if (!res.value.success) alert(`${res.value.message} (You likely already have sections)`);
	};
</script>

<div class="container">
	<div class="row mb-3">
		<div class="col">
			<h1>Pit Scouting</h1>
		</div>
	</div>
	<div class="row mb-3">
		<div class="col-6 ps-0">
			<button type="button" class="btn btn-primary w-100" onclick={generateEventTemplate}>
				<i class="material-icons"> list_alt </i>
				Generate Event Template
			</button>
		</div>
		<div class="col-6 pe-0">
			<button type="button" class="btn btn-primary w-100" onclick={copy}>
				<i class="material-icons">copy_all</i>
				Copy From Event
			</button>
		</div>
	</div>
	{#each $sections as section, i}
		<div class="row mb-3">
			<div class="card">
				<div class="card-body">
					<div class="d-flex justify-content-between">
						<h5 class="card-title">
							{section.data.name}
						</h5>
						<div class="btn-group" role="group">
							<a href="/dashboard/event/{eventKey}/create-pit-scouting/{i}" class="btn btn-primary">
								<i class="material-icons">edit</i>
							</a>
							<button
								type="button"
								class="btn btn-danger"
								onclick={() => {
									confirm('Are you sure you want to delete this section?').then((res) => {
										if (res) section.delete();
									});
								}}
							>
								<i class="material-icons"> delete </i>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/each}
	<div class="row">
		<button class="btn btn-success" onclick={addSection}>
			<i class="material-icons">add</i>
			Add Section
		</button>
	</div>
</div>
