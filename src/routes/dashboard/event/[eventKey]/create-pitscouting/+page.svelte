<script lang="ts">
	import EditSection from '$lib/components/pit-scouting/EditSection.svelte';
	import { Scouting } from '$lib/model/scouting';
	import { prompt } from '$lib/utils/prompts';
	import { DataArr } from 'drizzle-struct/front-end';
	import { onMount } from 'svelte';
	import { Account } from '$lib/model/account';
	import { Form } from '$lib/utils/form';
	import { page } from '$app/state';

	let sections = $state(new DataArr(Scouting.PIT.Sections, []));
	let self = $state(Account.self);


	onMount(() => {
		sections = Scouting.PIT.Sections.fromProperty('eventKey', page.params.eventKey, false);
		sections.sort((a, b) => Number(a.data.order) - Number(b.data.order));
		self = Account.getSelf();
	});

	const addSection = async () => {
		const name = await prompt('Section Name');
		if (!name) return;

		Scouting.PIT.Sections.new({
			name,
			accountId: self.get().data.id || '',
			order: $sections.length,
			eventKey: page.params.eventKey
		});
	};
</script>

<div class="container">
	<h1>Create Pit Scouting</h1>
	{#each $sections as section}
		<EditSection {section} />
	{/each}
	<button class="btn btn-primary" onclick={addSection}>Add Section</button>
</div>