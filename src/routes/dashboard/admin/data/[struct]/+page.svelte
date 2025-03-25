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
		type ICellEditorParams,
    } from 'ag-grid-community';
    import { capitalize, fromSnakeCase } from 'ts-utils/text';
	import * as monaco from 'monaco-editor';

    const { data } = $props();
    const structs = $derived(data.structs);
    const d = $derived(data.data);
    const struct = $derived(data.struct);

	const proxy = $derived(data.data.map(d => ({ ...d, })));

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


	class StringCellEditor implements ICellEditorComp {
    private eGui?: HTMLDivElement;
    private editor?: monaco.editor.IStandaloneCodeEditor;
    private value: any;
    private ispopup = false;

    init(params: ICellEditorParams) {
        this.value = params.value;
        
        // If value is a JSON object, use Monaco Editor
        if (typeof params.value === 'object' || params.value?.startsWith?.('{') || params.value?.startsWith?.('[')) {
            this.jsonEditor(params);
        } else if (params.value.constructor.name === 'Date') {
            this.dateEditor(params);
        } else if (!isNaN(params.value) && new Date(params.value).toString() === 'Invalid Date') {
            this.numberEditor(params);
        } else {
            this.stringEditor(params);
        }
    }

    jsonEditor(params: ICellEditorParams) {
        this.ispopup = true;
        this.eGui = document.createElement('div');
        this.eGui.style.width = '400px';
        this.eGui.style.height = '300px';
        this.eGui.style.border = '1px solid #ccc';
        this.eGui.style.overflow = 'hidden';

        this.editor = monaco.editor.create(this.eGui, {
            value: JSON.stringify(params.value, null, 2),
            language: 'json',
            theme: 'vs-dark',
            automaticLayout: true,
        });
    }

    dateEditor(params: ICellEditorParams) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `<input type="date" class="form-control" style="width: 100%;" value="${new Date(params.value).toISOString().split('T')[0]}">`;
    }

    numberEditor(params: ICellEditorParams) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `<input type="number" class="form-control" style="width: 100%;" value="${params.value}">`;
    }

    stringEditor(params: ICellEditorParams) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `<input type="text" class="form-control" style="width: 100%;" value="${params.value}">`;
    }

    getGui() {
        return this.eGui as HTMLElement;
    }

    afterGuiAttached() {
        if (this.editor) {
            this.editor.focus();
        } else {
            this.eGui?.querySelector('input')?.focus();
        }
    }

    getValue() {
        if (this.editor) {
            return JSON.parse(this.editor.getValue());
        }
        return this.eGui?.querySelector('input')?.value;
    }

    isPopup() {
        return this.ispopup;
    }
}



    onMount(() => {
        const gridOptions: GridOptions<any> = {
            theme: darkTheme,
            columnDefs: Object.entries(struct)
				.filter(([k, type]) => k !== 'id')
				.filter(([k, type]) => k !== 'canUpdate')
				.filter(([k, type]) => k !== 'enableRLS')
				.map(([k, type]) => ({
					field: k,
					editable: (params) => !!params.data.canUpdate 
					// && ![
					// 'created',
					// 'updated',
					// ].includes(k)
					,
					cellEditor: type === 'string' ? StringCellEditor : undefined,
				})),
            rowData: proxy.map((d) =>
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
