<script lang="ts">
	import '$lib/imports/robot-display.js';
	import Trace from '$lib/components/robot-display/Trace.svelte';
	import { Scouting } from '$lib/model/scouting.js';
	import { TBAEvent, TBATeam } from '$lib/utils/tba.js';
	import { DataArr } from 'drizzle-struct/front-end';
	import { onMount } from 'svelte';
	import Modal from '$lib/components/bootstrap/Modal.svelte';

    const { data } = $props();
    // const teams = $derived(data.teams);
    const event = $derived(new TBAEvent(data.event));
    const team = $derived(new TBATeam(data.team, event));

    let scoutingArr = $state(new DataArr(Scouting.MatchScouting, []));

    onMount(() => {
        scoutingArr = Scouting.scoutingFromTeam(team.tba.team_number, event.tba.key);
        return scoutingArr.subscribe(console.log);
    });

    let modal: Modal;
    let selectedScouting: Scouting.MatchScoutingData | undefined = $state(undefined);

    const open = (scouting: Scouting.MatchScoutingData) => {
        selectedScouting = scouting;
        modal.show();
    };
</script>


{#if $scoutingArr.length}
    <div class="container-fluid">
        <div class="row">
            {#each $scoutingArr as scouting}
                <div class="col-3">
                    <h3>
                        {scouting.data.compLevel}{scouting.data.matchNumber} - {scouting.data.eventKey}
                    </h3>
                    <button class="btn" onclick={() => open(scouting)}>
                        <Trace {scouting} {event} />
                    </button>
                </div>
            {/each}
        </div>
    </div>
{:else}
    <p>No scouting data found for team {team.tba.team_number} at event {event.tba.name}</p>
{/if}

<Modal bind:this={modal} size="lg" title="Trace {selectedScouting?.data.compLevel}{selectedScouting?.data.matchNumber} - {selectedScouting?.data.eventKey}">
    {#snippet body()}
        {#key selectedScouting}
            {#if selectedScouting}
                <Trace scouting={selectedScouting} {event} />
            {:else}
                <p>No scouting data selected</p>
            {/if}
        {/key}
    {/snippet}
    {#snippet buttons()}{/snippet}
</Modal>