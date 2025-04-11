<script lang="ts">
    import { Strategy } from "$lib/model/strategy";
	import { alert, select } from "$lib/utils/prompts";
	import type { TBAEvent, TBAMatch, TBATeam } from "$lib/utils/tba";
	import { teamsFromMatch } from "tatorscout/tba";

    interface Props {
        strategy: Strategy.StrategyData;
        partners: Strategy.PartnerData[];
        opponents: Strategy.OpponentData[];
        event: TBAEvent;
        matches: TBAMatch[];
        teams: TBATeam[];
    }

    const { strategy, partners, opponents, event, matches, teams }: Props = $props();

    const selectTeams = (partners: number[], opponents: number[]) => {
        if (partners.length !== 3) {
            console.log(partners);
            return alert('You must select 3 partners');
        }
        if (opponents.length !== 3) {
            console.log(opponents);
            return alert('You must select 3 opponents');
        }

        if (!partners.includes(2122)) {
            console.log(partners);
            return alert('The Tators must be one of the partners');
        }

        strategy.update(s => ({
            ...s,
            alliance: 'red',
            matchNumber: -1,
            compLevel: 'na',
            type: 'custom',
            partner1: partners[0],
            partner2: partners[1],
            partner3: partners[2],
            opponent1: opponents[0],
            opponent2: opponents[1],
            opponent3: opponents[2],
        }));
    };

    const selectMatch = (
        match: TBAMatch,
    ) => {
        const teams = teamsFromMatch(match.tba);
        if (!teams.includes(2122)) {
            console.log(teams);
            return alert('You must create a strategy for a team the Tators are in');
        }

        const index = teams.indexOf(2122);
        const allianceColor = index  < 3 ? 'red' : 'blue';
        const red = teams.slice(0, 3);
        const blue = teams.slice(3, 6);
        const partners = allianceColor === 'red' ? red : blue;
        const opponents = allianceColor === 'red' ? blue : red;
        
        strategy.update(s => ({
            ...s,
            alliance: allianceColor,
            matchNumber: match.tba.match_number,
            compLevel: match.tba.comp_level,
            type: 'match',
            partner1: partners[0],
            partner2: partners[1],
            partner3: partners[2],
            opponent1: opponents[0],
            opponent2: opponents[1],
            opponent3: opponents[2],
        }));
    };
</script>

{#snippet startingPos(team: number, data: Strategy.PartnerData)}
    
{/snippet}

{#snippet auto(team: number, data: Strategy.PartnerData)}
    
{/snippet}

{#snippet postAuto(team: number, data: Strategy.PartnerData | Strategy.OpponentData)}

{/snippet}

{#snippet role(team: number, data: Strategy.PartnerData | Strategy.OpponentData)}
    
{/snippet}

{#snippet endgame(team: number, data: Strategy.PartnerData)}
    
{/snippet}

{#snippet notes(team: number, data: Strategy.PartnerData | Strategy.OpponentData)}

{/snippet}






{#snippet partner(team: number, data: Strategy.PartnerData)}
    
{/snippet}


{#snippet opponent(team: number, data: Strategy.OpponentData)}
    
{/snippet}


<div class="container-fluid">
    <div class="row mb-3">
        <div class="col-12">
            <h1>Strategy</h1>
        </div>
    </div>
</div>