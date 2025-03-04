<script lang="ts">
	import { Scouting } from '$lib/model/scouting';
	import { onMount } from 'svelte';
	import type { TBAEvent, TBATeam } from 'tatorscout/tba';
	import { capitalize } from 'ts-utils/text';

	interface Props {
		question: Scouting.PIT.QuestionData;
		answer: Scouting.PIT.AnswerData | undefined;
	}

	const { question, answer }: Props = $props();

	let value = $state('No answer');

	onMount(() => {
		if (!answer) return;
		const res = Scouting.PIT.parseAnswer(answer);
		if (res.isOk()) {
			value = res.value.join(', ');
		}
	});
</script>

<div class="d-flex justify-content-between">
	<div class="text-end">
		{capitalize($question.key || '')}
	</div>
	<div class="">
		{value}
	</div>
</div>