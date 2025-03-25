<script lang="ts">
	import { onMount } from 'svelte';
	import { TBAEvent, TBATeam, TBAMatch } from '$lib/utils/tba';
	import z from 'zod';

	interface Props {
		team: TBATeam;
		event: TBAEvent;
	}

	const { team, event }: Props = $props();

	let matches: TBAMatch[] = $state([]);

    const getEndgame = (team: TBATeam) => {
        const endgame = {
            deepCage: 0,
            shallowCage: 0,
            parked: 0,
            none: 0
        };
        matches.forEach((match) => {
            const tba = match.tba;
            if (tba.score_breakdown) {
                const alliance: 'blue' | 'red' | null = tba.alliances.blue.team_keys.includes(team.tba.key) ? 'blue' : 
                                                        tba.alliances.red.team_keys.includes(team.tba.key) ? 'red' : null;

                if (alliance) {
                    console.log(tba.alliances[alliance].team_keys.indexOf(team.tba.key) + 1)
                    const teamIndex = tba.alliances[alliance].team_keys.indexOf(team.tba.key) + 1;
                    const scoreBreakdown = tba.score_breakdown[alliance] as Record<string, string>;
                    console.log(scoreBreakdown);
                    const endGameKey = `endGameRobot${teamIndex}`;

                    if (scoreBreakdown[endGameKey] === 'DeepCage') {
                        endgame.deepCage += 1;
                    } else if (scoreBreakdown[endGameKey] === 'ShallowCage') {
                        endgame.shallowCage += 1;
                    } else if (scoreBreakdown[endGameKey] === 'Parked') {
                        endgame.parked += 1;
                    } else {
                        endgame.none += 1;
                    }
                }
            }
        });
        return endgame;
    }

	onMount(() => {
		team.getMatches().then((m) => {
			if (m.isOk()) {
				matches = m.value;
			}
		});

        console.log(getEndgame(team));
	});
</script>
