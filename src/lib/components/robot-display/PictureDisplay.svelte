<script lang="ts">
	import { onMount } from 'svelte';
	import type { TBATeam, TBAEvent, TBAMedia } from 'tatorscout/tba';
	import * as TBA from '$lib/utils/tba';
	import { Scouting } from '$lib/model/scouting';
	import { FIRST } from '$lib/model/FIRST';
	import { DataArr } from 'drizzle-struct/front-end';
	import { loadFiles } from '$lib/utils/downloads';
	import FileUploaderComponent from '../forms/FileUploader.svelte';
	import { FileUploader } from '$lib/utils/files';
	import { Account } from '$lib/model/account';

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
				satisfies: (tp) => tp.data.team === team.team_number && tp.data.eventKey === event.key
			}
		);

		const unsub = teamPictures.subscribe((p) => {
			pictures.push(...new Set(p.map((tp) => `/uploads/${tp.data.picture}`).filter(Boolean)));
		});

		const off = uploadComponent.on('upload', (file) => {
			FIRST.TeamPictures.new({
				team: team.team_number,
				eventKey: event.key,
				picture: file,
				accountId: Account.getSelf().get().data.id || ''
			});
		});

		return () => {
			unsub();
			off();
		};
	});

	const uploader = new FileUploader(
		`/dashboard/event/${event.key}/team/${team.team_number}/picture`,
		{
			method: 'POST'
		}
	);

	let uploadComponent: FileUploaderComponent;
</script>

<div class="container-fluid h-100">
	<div class="row h-100">
		<div class="col-8">
			<div id="carousel-{team.team_number}" class="carousel slide h-100">
				<div class="carousel-inner">
					{#each pictures as picture, i}
						<div class="carousel-item {i === 0 ? 'active' : ''}">
							<img
								src="/assets{picture}"
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
		</div>
		<div class="col-4">
			<FileUploaderComponent
				bind:this={uploadComponent}
				multiple={true}
				{uploader}
				message="Upload a picture"
			/>
		</div>
	</div>
</div>
