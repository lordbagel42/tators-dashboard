<script lang="ts">
	import { Strategy } from '$lib/model/strategy';
	import type { TBAMatch } from '$lib/utils/tba';
	import { teamsFromMatch } from 'tatorscout/tba';


    const { data } = $props();
    const event = $derived(data.event);
    const matches = $derived(data.matches);
    const teams = $derived(data.teams);
    const strategy = $derived(data.strategy);
    const partners = $derived(data.partners);
    const opponents = $derived(data.opponents);

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


{#snippet startingPos(data: Strategy.PartnerData)}
    <label for="starting-pos-{data.data.id}" class="form-label">Starting Position</label>
    <input type="text" id="starting-pos-{data.data.id}" class="form-control">
{/snippet}

{#snippet auto(data: Strategy.PartnerData)}
    <label for="auto-{data.data.id}" class="form-label">Auto</label>
    <input type="text" id="auto-{data.data.id}" class="form-control">
{/snippet}

{#snippet postAuto(data: Strategy.PartnerData | Strategy.OpponentData)}
    <label for="post-auto-{data.data.id}" class="form-label">Post Auto</label>
    <textarea id="post-auto-{data.data.id}" class="form-control"></textarea>
{/snippet}

{#snippet role(data: Strategy.PartnerData | Strategy.OpponentData)}
    <label for="role-{data.data.id}" class="form-label">Role</label>
    <textarea id="role-{data.data.id}" class="form-control"></textarea>
{/snippet}

{#snippet endgame(data: Strategy.PartnerData)}
    <label for="endgame-{data.data.id}" class="form-label">Endgame</label>
    <input type="text" id="endgame-{data.data.id}" class="form-control">
{/snippet}

{#snippet notes(data: Strategy.PartnerData | Strategy.OpponentData)}
    <label for="notes-{data.data.id}" class="form-label">Notes</label>
    <textarea id="notes-{data.data.id}" class="form-control"></textarea>
{/snippet}






{#snippet partner(data: Strategy.PartnerData)}
    <div class="card">
        <div class="card-body">
            <div class="container-fluid">
                <div class="row mb-3">
                    <h5>Auto</h5>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6">
                        {@render startingPos(data)}
                    </div>
                    <div class="col-md-6">
                        {@render auto(data)}
                    </div>
                </div>
                <!-- <hr> -->
                <div class="row mb-3">
                    <h5>Teleop</h5>
                </div>
                <div class="row mb-3">
                    <div class="col-md-4">
                        {@render postAuto(data)}
                    </div>
                    <div class="col-md-4">
                        {@render role(data)}
                    </div>
                    <div class="col-md-4">
                        {@render endgame(data)}
                    </div>
                </div>
                <!-- <hr> -->
                <div class="row mb-3">
                    <div class="col-md-12">
                        {@render notes(data)}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/snippet}


{#snippet opponent(data: Strategy.OpponentData)}
    <div class="card">
        <div class="card-body">
            <div class="container-fluid">
                <div class="row mb-3">
                    <h5>Teleop</h5>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6">
                        {@render postAuto(data)}
                    </div>
                    <div class="col-md-6">
                        {@render role(data)}
                    </div>
                </div>
                <!-- <hr> -->
                <div class="row mb-3">
                    <div class="col-md-12">
                        {@render notes(data)}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/snippet}


<div class="container-fluid">
    <div class="row mb-3">
        <div class="col-12">
            <h1>Strategy</h1>
        </div>
    </div>
    <div class="row mb-3">
        <div class="col-lg-6 col-md-12">
            <h2>Partners</h2>
            <!-- <hr> -->
            <h4>Team {$strategy.partner1}</h4>
            {@render partner(partners[0])}
            <h4>Team {$strategy.partner2}</h4>
            {@render partner(partners[1])}
            <h4>Team {$strategy.partner3}</h4>
            {@render partner(partners[2])}
        </div>
        <div class="col-lg-6 col-md-12">
            <h2>Opponents</h2>
            <!-- <hr> -->
            <h4>Team {$strategy.opponent1}</h4>
            {@render opponent(opponents[0])}
            <h4>Team {$strategy.opponent2}</h4>
            {@render opponent(opponents[1])}
            <h4>Team {$strategy.opponent3}</h4>
            {@render opponent(opponents[2])}
        </div>
    </div>
</div>