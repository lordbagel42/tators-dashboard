<script lang="ts">
	import type { Account } from '$lib/model/account';
    import * as agGrid from 'ag-grid-community';
	import { onMount } from 'svelte';
    import { confirm } from '$lib/utils/prompts';

    interface Props {
        accounts: Account.AccountArr;
    }

    const { accounts }: Props = $props();

    type A = {
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        verified: boolean;
        picture: string;
        actions: null;
    }

    type Params = {
        value: A | null | undefined;
        valueFormatted: string | null | undefined;
        fullWidth: boolean;
        pinned: 'left' | 'right' | null;
        data: unknown;
        getValue: () => A | null | undefined;
        setValue: (value: A | null | undefined) => void;
    }

    type Button = {
        color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
        outline: boolean;
        size: 'sm' | 'md' | 'lg';
        action: () => void;
        html: string;
        render: (account: A | null | undefined) => boolean;
    }
    class Actions {
        public readonly eGui = document.createElement('div');
        private readonly buttons: Button[] = [{
            color: 'primary',
            outline: false,
            size: 'sm',
            action: async () => {
                const a = accounts.data.find(a => a.data.username === this.account?.username);
                if (!a) return;
                if (await confirm('Are you sure you want to verify this account?')) {
                    a.update(data => ({ ...data, verified: true }));
                }
            },
            html: 'Verify',
            render: (a) => !!a?.verified,
        }, {
            color: 'danger',
            outline: false,
            size: 'sm',
            action: async () => {
                const a = accounts.data.find(a => a.data.username === this.account?.username);
                if (!a) return;
                if (await confirm('Are you sure you want to unverify this account?')) {
                    a.update(data => ({ ...data, verified: false }));
                }
            },
            html: 'Unverify',
            render: (a) => !a?.verified,
        }, {
            color: 'danger',
            outline: false,
            size: 'sm',
            action: async () => {
                const a = accounts.data.find(a => a.data.username === this.account?.username);
                if (!a) return;
                if (await confirm('Are you sure you want to delete this account?')) {
                    a.delete();
                }
            },
            html: 'Delete',
            render: () => true,
        }];
        private _buttons: HTMLButtonElement[] = [];
        private readonly account: A | null | undefined;

        constructor(params: Params) {
            this.account = params.value;
            this.render();
        }

        private depose() {
            this._buttons.forEach(b => {
                b.remove();
                if (b.onclick) b.removeEventListener('click', b.onclick);
            });
            this.eGui.innerHTML = '';
        }

        private render() {
            this.depose();
            this._buttons = this.buttons.map(b => {
                if (!b.render(this.account)) return null;
                const button = document.createElement('button');
                let color = `btn-${b.color}`;
                if (b.outline) color = `btn-outline-${b.color}`;
                button.classList.add('btn', `btn-${b.size}`, color);
                button.innerHTML = b.html;
                button.addEventListener('click', b.action);
                return button;
            }).filter(Boolean);
            this.eGui.append(...this._buttons);
        }


        getGuid() {
            return this.eGui;
        }

        refresh(params: Params) {
            this.render();
            return true;
        }

        destroy() {
            this.depose();
        }
    }

    let rendered: A[] = $state([]);

    let grid: HTMLDivElement;

    $effect(() => {
        agGrid.createGrid(grid, {
            rowData: rendered,
            columnDefs: [
                { field: 'username', filter: true },
                { field: 'firstName', filter: true },
                { field: 'lastName', filter: true },
                { field: 'email', filter: true },
                { field: 'verified', filter: true },
                { field: 'picture', filter: true },
                { field: 'actions', cellRenderer: Actions }
            ],

        });
    });

    onMount(() => {
        return accounts.subscribe((accounts) => {
            rendered = accounts.map(a => ({
                username: String(a.data.username),
                firstName: String(a.data.firstName),
                lastName: String(a.data.lastName),
                email: String(a.data.email),
                verified: Boolean(a.data.verified),
                picture: String(a.data.picture),
                actions: null,
            }));
        });
    });
</script>

<div bind:this={grid}></div>