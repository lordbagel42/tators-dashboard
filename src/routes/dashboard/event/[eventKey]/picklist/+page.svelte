<script lang="ts">
	import List from "$lib/components/interactive/List.svelte";
	import { Picklist } from "$lib/model/picklist";
	import { prompt } from "$lib/utils/prompts";
	import { onMount } from "svelte";
    import { writable } from "svelte/store";

    const { data } = $props();
    const event = $derived(data.event);
    const teams = $derived(data.teams);

    const screenWidth = writable(900);

    let smallScreen = $state(false);

    const updateScreenSize = () => {
        screenWidth.set(window.innerWidth);
    }

    onMount(() => {
        const unsub = screenWidth.subscribe(value => {
            smallScreen = value < 768;
        });
        updateScreenSize();
        window.addEventListener("resize", updateScreenSize);

        return () => {
            window.removeEventListener("resize", updateScreenSize);
            unsub();
        };
    });
</script>

<div class="container-fluid">
    <div class="row mb-3">
        <div class="col">
            <h1>Picklist</h1>
            <button type="button" class="btn btn-primary"
                onclick={async () => {
                    const name = await prompt('Enter the name of the new list');
                    if (!name) return;
                    const teams = await prompt('Enter the teams (newline separated)', {
                        multiline: true,
                    });
                    if (!teams) return;

                    Picklist.newList(event.tba.key, name, teams.split('\n').map(t => Number(t.trim())));
                }}
            >
                <i class="material-icons"> add </i>
                Add List
            </button>
        </div>
    </div>
    <div class="row mb-3">
        <div class="col-md-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Available Teams</h5>
                    <List items={teams.map(t => t.tba.team_number.toString())} listType="available" onUpdate={teams => {
                        console.log(teams);
                    }} />
                </div>
            </div>
        </div>
    </div>
</div>


<style>
    .warning {
        color: red;
        font-weight: bold;
        text-align: center;
        padding: 10px;
        background: yellow;
    }
</style>
<div class="warning" hidden={!smallScreen}>
    ⚠️ Your screen is too small for optimal display.
</div>