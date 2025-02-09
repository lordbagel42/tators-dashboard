<script lang="ts">
	import { FIRST } from '$lib/model/FIRST';
	import { Scouting } from '$lib/model/scouting';
	import Grid from '$lib/components/general/Grid.svelte';
	import { faker } from '@faker-js/faker';

	interface Props {
		comments: {
			account: string;
			type: string;
			comment: string;
			match: string;
		}[];
	}

	let { comments }: Props = $props();

	// example comments
	// comments = [
	// 	{
	// 		account: 'user1',
	// 		type: 'positive',
	// 		comment: 'Great performance in the last match!',
	// 		match: 'Match 1'
	// 	},
	// 	{
	// 		account: 'user2',
	// 		type: 'constructive',
	// 		comment: 'Needs improvement in defense.',
	// 		match: 'Match 2'
	// 	},
	// 	{
	// 		account: 'user3',
	// 		type: 'neutral',
	// 		comment: 'Average performance overall.',
	// 		match: 'Match 3'
	// 	}
	// ];

	const columns = [
		{ headerName: 'Account', field: 'account' },
		{ headerName: 'type', field: 'type' },
		{ headerName: 'comment', field: 'comment', wrapText: true, autoHeight: true },
		{ headerName: 'match', field: 'match' }
	];

	// const rows = [
	// 	{
	// 		name: 'John Doe',
	// 		age: 25,
	// 		location: 'New York'
	// 	}
	// ];

	const rows = Array.from({ length: 5000 }, (_, index) => ({
		account: faker.person.fullName(),
		type: faker.helpers.arrayElement(['positive', 'constructive', 'neutral']),
		comment: faker.lorem.paragraph(),
		match: `Match ${index + 1}`
	}));

	console.log(rows);
</script>

<div>
	<Grid
		columnDefs={columns}
		rowData={rows}
		gridClasses="table table-striped"
		filterEnable={true}
		filterClasses=""
	/>
</div>
