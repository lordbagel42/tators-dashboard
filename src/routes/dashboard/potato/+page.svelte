<script lang="ts">
	import { Navbar } from '$lib/model/navbar';
	import { Potato } from '$lib/model/potato';
	import { capitalize } from 'ts-utils/text';
	const { data } = $props();
	const [first, second, third, ...rest] = $derived(data.rankings);
	const you = $derived(data.you);

	Navbar.addSection({
		name: 'Potato',
		links: [
			{
				name: 'Home',
				href: '/',
				icon: 'home',
				type: 'material-icons'
			}
		],
		priority: 0
	});
</script>

{#snippet row(
	data: {
		username: string;
		level: number;
		name: string;
	},
	color: string
)}
	<tr class:you={data.username === you?.username}>
		<td>
			<img
				src="/potato/{Potato.getPhase(data.level)}.png"
				alt={Potato.getPhase(data.level)}
				srcset=""
				style="width: 56px; height: 56px;"
				title={capitalize(Potato.getPhase(data.level))}
			/>
		</td>
		<td class="text-{color}"
			>{data.username}
			{#if data.username === you?.username}
				<span class="badge bg-primary">You</span>
			{/if}
		</td>
		<td class="text-{color}">{data.name}</td>
		<td class="text-{color}">{data.level}</td>
	</tr>
{/snippet}

<div class="container">
	<div class="row mb-3 pt-3">
		<div class="col">
			<h1>Potato Leaderboard</h1>
			<p class="text-muted">
				The way to gain levels for your potato is to contribute to scouting.
				<br />
				&nbsp; Match scouting: 10 levels
				<br />
				&nbsp; Prescouting: additional 5 levels
				<br />
				&nbsp; Remote Scouting: additional 5 levels
				<br />
				&nbsp; Pit Scouting: 1 level per question answered
				<br />
				&nbsp; Taking Team Pictures: 5 levels
			</p>
			<button type="button" class="btn btn-primary" onclick={() => window.history.back()}>
				<i class="material-icons">arrow_back</i> Go Back
			</button>
		</div>
	</div>
	<div class="row mb-3">
		<div class="table-responsive">
			<table class="table table-striped">
				<tbody>
					<tr>
						<td colspan="4" class="text-muted text-center">
							<h4>Top 3</h4>
						</td>
					</tr>
					{#if first}
						{@render row(first, 'success')}
					{/if}
					{#if second}
						{@render row(second, 'info')}
					{/if}
					{#if third}
						{@render row(third, 'warning')}
					{/if}
					{#if rest.length}
						<tr>
							<td colspan="4" class="text-muted text-center">
								<h4>Growing Potatoes</h4>
							</td>
						</tr>
						{#each rest as r}
							{@render row(r, 'light')}
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<style>
	.you * {
		background-color: #f0f0f0 !important;
		color: black !important;
	}
</style>
