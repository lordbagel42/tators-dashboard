<script lang="ts">
	import { TBAEvent, TBATeam, TBAMatch } from '$lib/utils/tba';
    import EndgamePie from '$lib/components/charts/EndgamePie.svelte';

	interface Props {
		team: TBATeam;
		event: TBAEvent;
	}

    const { team, event }: Props = $props();

</script>

<EndgamePie {team} {event} />
