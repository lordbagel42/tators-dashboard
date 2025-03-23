<script lang="ts">
    import { Potato } from "$lib/model/potato";
    import { Account } from "$lib/model/account";
	import { onMount } from "svelte";
	import Modal from "../bootstrap/Modal.svelte";

    const self = Account.getSelf();

    let potato: Potato.FriendData | undefined = $state(undefined);

    let phase = $state('');

    $effect(() => {
        if (potato) {
            phase = Potato.getPhase(potato.data.level || 0);
        }
    });

    onMount(() => {
        return self.subscribe(async () => {
            console.log(self);
            const [p] = (await Potato.Friend.fromProperty('account', String(self.get().data.id), true).await()).unwrap();
            if (!p) return;
            potato = p;
        });
    });

    let modal: Modal;
</script>

{#if potato}
    <button class="btn" onclick={() => modal.show()}>
        <img src="/potato/{phase}.png" alt="" srcset="" style="width: 24px; height: 24px;">
    </button>
{/if}

<Modal title="Potato" size="md" bind:this={modal}>
    {#snippet body()}
        {#if potato}
            Your potato's level is {potato.data.level} and phase is {phase}
        {:else}
            You don't have a potato yet.
        {/if}
    {/snippet}

    {#snippet buttons()}
        
    {/snippet}
</Modal>

<style>
</style>