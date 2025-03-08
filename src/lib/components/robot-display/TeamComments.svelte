<script lang="ts">
	import { FIRST } from '$lib/model/FIRST';
	import { Scouting } from '$lib/model/scouting';
	import { DataArr } from 'drizzle-struct/front-end';
	import Grid from '../general/Grid.svelte';
	import type { INumberFilterParams, ITextFilterParams } from 'ag-grid-community';
	import { onMount } from 'svelte';
	import { globalFilter } from '$lib/model/filter';

	interface Props {
		team: number;
		event: string;
	}

	const { team, event }: Props = $props();

	let comments = $state(new DataArr(Scouting.TeamComments, []));

	const accountFilterParams: ITextFilterParams = {
		filterOptions: ['contains', 'notContains'],
		textFormatter: (r) => {
			if (r == null) return null;

			return r.toLowerCase();
		},
		debounceMs: 200,
		maxNumConditions: 1
	};

	const typeFilterparams: ITextFilterParams = {
		textFormatter: (r) => {
			if (r == null) return null;

			return r.toLowerCase();
		},
		debounceMs: 200,
		maxNumConditions: 1
	};

	const commentFilterParams: ITextFilterParams = {
		textFormatter: (r) => {
			if (r == null) return null;

			return r.toLowerCase();
		},
		debounceMs: 200,
		maxNumConditions: 1
	};

	const columns = [
		{
			headerName: 'Comment',
			field: 'comment',
			filter: 'agTextColumnFilter',
			filterParams: commentFilterParams
		},
		{
			headerName: 'Account',
			field: 'scoutUsername',
			filter: 'agTextColumnFilter',
			filterParams: accountFilterParams
		},
		{
			headerName: 'Type',
			field: 'type',
			filter: 'agTextColumnFilter',
			filterParams: typeFilterparams
		},
		{
			headerName: 'Match',
			field: 'matchNumber',
			filter: 'agNumberColumnFilter'
		}
	];

	// DEV ONLY
	// const rows = Array.from({ length: 5000 }, (_, index) => ({
	// 	account: faker.person.fullName(),
	// 	type: faker.helpers.arrayElement(['positive', 'constructive', 'neutral']),
	// 	comment: faker.lorem.paragraph(),
	// 	match: index + 1
	// }));

	onMount(() => {
		comments = Scouting.TeamComments.query(
			'from-event',
			{ eventKey: event, team },
			{
				asStream: false,
				satisfies: (c) => c.data.team === team && c.data.eventKey === event
			}
		);

		return globalFilter.subscribe((f) => {
			comments.filter(d => {
				const { auto, teleop, endgame } = f;
				
			});
		});
	});
</script>

<div class="h-85 w-100">
	<Grid
		columnDefs={columns}
		rowData={$comments.map((c) => c.data)}
		gridClasses="table table-striped"
		filterEnable={true}
		filterClasses=""
	/>
</div>

<style>
	.h-85 {
		height: 85%;
	}
</style>
