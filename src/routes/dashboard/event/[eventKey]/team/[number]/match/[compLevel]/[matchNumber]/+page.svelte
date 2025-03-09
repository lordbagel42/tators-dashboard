<script lang="ts">
	import MatchDisplay from '$lib/components/robot-display/MatchDisplay.svelte';

	const { data } = $props();
	const event = $derived(data.event);
	const match = $derived(data.match);
	// const matches = $derived(data.matches);
	const team = $derived(data.team);
	// const teams = $derived(data.teams);
	const scouting = $derived(data.scouting);
	console.log(data);
</script>

<div class="container">
	<div class="row mb-3">
		<div class="col-12">
			<h1>{team.tba.nickname} - {event.tba.name}</h1>
			<div class="btn-group" role="group">
				<a
					href="/dashboard/event/{event.tba.key}/team/{team.tba.team_number}/traces"
					class="btn btn-primary me-2"
				>
					View all Traces
				</a>
				<a
					href="/dashboard/event/{event.tba.key}/team/{team.tba.team_number}"
					class="btn btn-success">View Team</a
				>
			</div>
		</div>
	</div>
	<div class="row">
		<MatchDisplay {scouting} {team} {event} {match} />
	</div>
</div>
