<script lang="ts">
	import { onMount } from 'svelte';
	import type { TBATeam, TBAEvent, TBAMedia } from 'tatorscout/tba';
	import * as TBA from '$lib/utils/tba';
	import { Scouting } from '$lib/model/scouting';
	import { FIRST } from '$lib/model/FIRST';
	import { DataArr } from 'drizzle-struct/front-end';

	interface Props {
		team: TBATeam;
		event: TBAEvent;
	}

	let pictures: string[] = $state([]);
	let teamPictures = $state(new DataArr(FIRST.TeamPictures, []));
	// $inspect(pictures);

	const { team, event }: Props = $props();

	onMount(() => {
		new TBA.TBATeam(team, new TBA.TBAEvent(event)).getMedia().then((m) => {
			if (m.isErr()) return console.error(m.error);
			pictures.push(
				...m.value.filter((media) => media.type === 'imgur').map((media) => media.direct_url)
			);
		});

		teamPictures = FIRST.TeamPictures.query(
			'from-event',
			{
				team: team.team_number,
				eventKey: event.key
			},
			{
				asStream: false,
				satisfies: (tp) => tp.data.number === team.team_number && tp.data.eventKey === event.key
			}
		);
		return teamPictures.subscribe((p) => {
			pictures.push(...new Set(p.map((tp) => tp.data.picture).filter(Boolean)));
		});
	});
</script>

<div class="position-relative h-100">
	<div id="carousel-{team.team_number}" class="carousel slide h-100">
		<div class="carousel-inner">
			{#each pictures as picture, i}
				<div class="carousel-item {i === 0 ? 'active' : ''}">
					<img
						src={picture}
						alt="..."
						class="d-block w-100"
						style="object-fit: contain; height: 250px;"
					/>
				</div>
			{/each}
		</div>
		<button
			class="carousel-control-prev"
			type="button"
			data-bs-target="#carousel-{team.team_number}"
			data-bs-slide="prev"
		>
			<span class="carousel-control-prev-icon" aria-hidden="true"></span>
			<span class="visually-hidden">Previous</span>
		</button>
		<button
			class="carousel-control-next"
			type="button"
			data-bs-target="#carousel-{team.team_number}"
			data-bs-slide="next"
		>
			<span class="carousel-control-next-icon" aria-hidden="true"></span>
			<span class="visually-hidden">Next</span>
		</button>
	</div>
	<button type="button" class="btn top-0 end-0 position-absolute">
		<i class="material-icons">add</i>
	</button>
</div>
