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
		DateEditorModule,
		TextEditorModule,
		NumberEditorModule,
		CheckboxEditorModule,
		type ICellEditorComp,
    } from 'ag-grid-community';
    import { capitalize, fromSnakeCase } from 'ts-utils/text';

    const { data } = $props();
    const structs = $derived(data.structs);
    const d = $derived(data.data);
    const struct = $derived(data.struct);

    // Register AG Grid Modules
    ModuleRegistry.registerModules([
		ClientSideRowModelModule, 
		PaginationModule,
		DateEditorModule,
		TextEditorModule,
		NumberEditorModule,
		CheckboxEditorModule,
	]);

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

    // Create custom JSON editor
    class JSONEditor implements ICellEditorComp {
        eInput: HTMLTextAreaElement;
        gridOptions: GridOptions<any> = {};
        constructor() {
            this.eInput = document.createElement('textarea');
        }

        init(params: any) {
            this.eInput.value = JSON.stringify(params.value, null, 2);
            this.eInput.style.width = '100%';
            this.eInput.style.height = '100%';
            this.eInput.onblur = () => {
                try {
                    params.setValue(JSON.parse(this.eInput.value)); // Save the JSON data
                } catch (e) {
                    alert('Invalid JSON format');
                }
            };
        }

        getGui() {
            return this.eInput;
        }

        destroy() {
            // Cleanup when the editor is destroyed
        }

		getValue() {
			return this.eInput.value;
		}
    }

    // Function to check if a value is valid JSON
    function isValidJSON(value: string): boolean {
        try {
            JSON.parse(value);
            return true;
        } catch {
            return false;
        }
    }

    onMount(() => {
        const gridOptions: GridOptions<any> = {
            theme: darkTheme,
            columnDefs: Object.entries(struct).map(([k, type]) => ({
                field: k,
                editable: (params) => !!params.data.canUpdate,
                cellEditor: (params: any) => console.log(params),
            })),
            rowData: d.map((d) =>
                Object.fromEntries(
                    Object.entries(d).map(([k, v]) => {
                        if (typeof v === 'string') {
                            try {
								if (!isNaN(Number(v))) {
									return [k, v];
								}
                                if (v.includes('{') && v.includes('}') || v.includes('[') && v.includes(']')) {
									return [k, JSON.parse(v)];
                                }
								if (new Date(v).toString() !== 'Invalid Date') {
									return [k, new Date(v)];
								}
                            } catch {
                                return [k, v];
                            }
                        }
                        return [k, v];
                    })
                )
            ),
			defaultColDef: {
				editable: true,
				// filter: true,
			},
            pagination: true,
            paginationPageSize: 100,
            paginationPageSizeSelector: [50, 100, 200],
        };

        grid = createGrid(gridDiv, gridOptions); // Initialize grid
    });
</script>

<div class="container-fluid">
    <div class="row mb-3">
        <div class="col">
            <div style="overflow-x: auto; white-space: nowrap; display: flex;">
                {#each structs as struct}
                    <button type="button" class="btn btn-primary me-3" onclick={() => {
                        location.href = `/dashboard/admin/data/${struct}`;
                    }}>
                        {capitalize(fromSnakeCase(struct))}
                    </button>
                {/each}
            </div>
        </div>
    </div>
    <div class="row mb-3">
        <div class="col">
            <div style="overflow-x: auto;">
                <div bind:this={gridDiv} class="ag-theme-alpine" style="width: 100%; height: 500px;"></div>
            </div>
        </div>
    </div>
</div>
