<script lang="ts">
	import Stats from './Stat.svelte';
	import { Potato } from '$lib/model/potato';

	interface Props {
		potato: Potato.FriendData;
	}

	const { potato }: Props = $props();
</script>

<Stats level={$potato.level || 0} name="Health" stat={$potato.health || 0} color="red" />
<Stats level={$potato.level || 0} name="Attack" stat={$potato.attack || 0} color="gold" />
<Stats level={$potato.level || 0} name="Defense" stat={$potato.defense || 0} color="gray" />
<Stats level={$potato.level || 0} name="Speed" stat={$potato.speed || 0} color="silver" />
<Stats level={$potato.level || 0} name="Mana" stat={$potato.mana || 0} color="blue" />
