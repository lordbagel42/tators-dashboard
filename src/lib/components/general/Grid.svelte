<script lang="ts">
	import { onMount } from 'svelte';
	import {
		createGrid,
		ModuleRegistry,
		ClientSideRowModelModule,
		type GridOptions,
		themeQuartz,
		PaginationModule,
		type GridApi,
		QuickFilterModule,
		ValidationModule,
		RowAutoHeightModule
	} from 'ag-grid-community';

	// Register AG Grid Modules
	ModuleRegistry.registerModules([
		ClientSideRowModelModule,
		PaginationModule,
		QuickFilterModule,
		ValidationModule,
		RowAutoHeightModule
	]);

	interface Props<T extends Record<string, unknown> = Record<string, unknown>> {
		columnDefs: {
			headerName: string;
			field: keyof T;
		}[];
		rowData: T[];
		gridClasses: string;
		filterEnable: boolean;
		filterClasses: string;
	}

	let { columnDefs, rowData, gridClasses, filterEnable, filterClasses }: Props = $props();

	// Create a custom dark theme using Theming API
	const darkTheme = themeQuartz.withParams({
		backgroundColor: '#212529',
		browserColorScheme: 'dark',
		chromeBackgroundColor: {
			ref: 'foregroundColor',
			mix: 0.07,
			onto: 'backgroundColor'
		},
		foregroundColor: '#FFF',
		headerFontSize: 14
	});

	let gridDiv: HTMLDivElement;
	let grid: GridApi;
	let filterText: string = $state('');

	const onFilterTextBoxChanged = () => {
		grid.setGridOption('quickFilterText', filterText);
		console.log(filterText);
	};

	onMount(() => {
		const gridOptions: GridOptions<any> = {
			theme: darkTheme, // Apply custom dark theme
			columnDefs,
			rowData,
			defaultColDef: {
				sortable: true,
				filter: true
			},
			pagination: true,
			paginationPageSize: 10,
			paginationPageSizeSelector: [10, 20, 50]
			// paginationAutoPageSize: true
		};

		if (gridDiv) {
			grid = createGrid(gridDiv, gridOptions); // Create the grid with custom options
		}
	});
</script>

<!-- Grid Container -->
{#if filterEnable}
	<div class="filter-container">
		<span class="text-light">Quick Filter:</span>
		<input
			type="text"
			id="filter-text-box"
			class="form-control"
			placeholder="Filter..."
			oninput={onFilterTextBoxChanged}
			bind:value={filterText}
		/>
	</div>
{/if}
<div bind:this={gridDiv} class="ag-theme-quartz w-auto"></div>

<style>
	/* Ensure the grid container respects Bootstrap sizing */
	.ag-theme-quartz {
		height: 400px;
	}

	/* Fix input spacing for filter */
	.filter-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.filter-container input {
		max-width: 300px;
	}
</style>
