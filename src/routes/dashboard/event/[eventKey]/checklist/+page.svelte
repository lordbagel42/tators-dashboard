<script lang="ts">
	import nav from '$lib/imports/robot-display';
	const { data } = $props();
	const event = $derived(data.event);
	const checklist = $derived(data.data);

	$effect(() => nav(event.tba));
</script>

<div class="container">
	<div class="row mb-3">
		<h1>Pit Scouting Checklist for {event.tba.name}</h1>
	</div>
	<div class="row mb-3">
		{#each checklist as item}
			{#if item.left.data.length}
				<div class="col">

					<h4>{item.team.tba.team_number} {item.team.tba.nickname} ({item.left.data.length})</h4>
					<ul class="list-group">
						{#each item.left.data as question}
							<li class="list-group text-danger">
								<pre>{question.data.key}</pre>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		{/each}
</div>	
</div>
