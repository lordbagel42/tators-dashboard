<script lang="ts">
	import { Scouting } from "$lib/model/scouting";
	import type { TBATeam, TBAEvent } from "$lib/utils/tba";
    import { DataArr } from 'drizzle-struct/front-end';
	import { onMount } from "svelte";

    interface Props {
        team: TBATeam;
        event: TBAEvent;
    }

    const { team, event }: Props = $props();

    let matches = $state(new DataArr(Scouting.MatchScouting, []));


    onMount(() => {
        matches = Scouting.getArchivedMatches(team.tba.team_number, event.tba.key);
    });
</script>