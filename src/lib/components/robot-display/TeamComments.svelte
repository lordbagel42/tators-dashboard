<script lang="ts">
	import { FIRST } from '$lib/model/FIRST';
	import { Scouting } from '$lib/model/scouting';
	import Grid from '$lib/components/general/Grid.svelte';
	import { faker } from '@faker-js/faker';
	import type { INumberFilterParams, ITextFilterParams } from 'ag-grid-community';

	interface Props {
		comments: {
			account: string;
			type: string;
			comment: string;
			match: string;
		}[];
	}

	let { comments }: Props = $props();

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
			headerName: 'Account',
			field: 'account',
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
			headerName: 'Comment',
			field: 'comment',
			filter: 'agTextColumnFilter',
			filterParams: commentFilterParams
		},
		{
			headerName: 'Match',
			field: 'match',
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

	const rows = comments;

	console.log(rows);
</script>

<div class="h-85 w-100">
	<Grid
		columnDefs={columns}
		rowData={rows}
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
