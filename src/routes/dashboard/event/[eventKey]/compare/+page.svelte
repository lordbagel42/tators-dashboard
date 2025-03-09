<script lang="ts">
	import { goto } from '$app/navigation';
	import Progress from '$lib/components/charts/Progress.svelte';
	import TeamEventStats from '$lib/components/charts/TeamEventStats.svelte';

	const { data } = $props();
	const event = $derived(data.event);
	const selectedTeams = $derived(data.selectedTeams);
	const teams = $derived(data.teams);

	$inspect(selectedTeams);

	let scroller: HTMLDivElement;
	let staticY = $state(0);
	let view: 'progress' | 'stats' = $state('progress');

	$effect(() => {
		if (!view) return; // On view set
		staticY = 0;
	});
</script>

<div class="container-fluid">
	<div class="row mb-3">
		<div class="col">
			<div class="d-flex justify-content-between">
				<h1>Compare Teams</h1>
				<div class="btn-group" role="group" aria-label="View">
					<input
						type="radio"
						class="btn-check"
						id="progress-view"
						autocomplete="off"
						checked
						bind:group={view}
						value="progress"
					/>
					<label class="btn btn-outline-primary" for="progress-view">Progress</label>
					<input
						type="radio"
						class="btn-check"
						id="stats-view"
						autocomplete="off"
						bind:group={view}
						value="stats"
					/>
					<label class="btn btn-outline-primary" for="stats-view">Event Stats</label>
				</div>
			</div>
		</div>
	</div>
	<div class="row mb-3">
		<div class="ws-nowrap scroll-x p-3 mb-3" bind:this={scroller}>
			{#each teams as team}
				<input
					type="checkbox"
					class="btn-check"
					id="btn-check-{team.tba.team_number}"
					autocomplete="off"
					checked={!!selectedTeams.find((t) => t.tba.team_number === team.tba.team_number)}
					onchange={(event) => {
						if (event.currentTarget.checked) {
							selectedTeams.push(team);
						} else {
							selectedTeams.splice(
								selectedTeams.findIndex((t) => t.tba.team_number === team.tba.team_number),
								1
							);
						}

						selectedTeams.sort((a, b) => a.tba.team_number - b.tba.team_number);

						const search = new URLSearchParams(location.search);
						search.set('teams', selectedTeams.map((t) => t.tba.team_number).join(','));
						goto(`${location.pathname}?${search.toString()}`);
					}}
				/>
				<label class="btn btn-outline-primary" for="btn-check-{team.tba.team_number}">
					{team.tba.team_number}
				</label>
			{/each}
		</div>
	</div>
	<div class="row mb-3">
		{#key selectedTeams}
			{#each selectedTeams as team}
				<div class="col-md-4">
					<div class="card">
						<div class="card-body" style="height: 300px;">
							<h5 class="card-title">{team.tba.team_number} | {team.tba.nickname}</h5>
							{#if view === 'progress'}
								<Progress {team} {event} bind:staticY />
							{:else}
								<TeamEventStats {team} {event} bind:staticY />
							{/if}
						</div>
					</div>
				</div>
			{/each}
		{/key}
	</div>
</div>
