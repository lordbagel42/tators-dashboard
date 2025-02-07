<script lang="ts">
    import { Scouting } from "$lib/model/scouting";
	import { prompt } from "$lib/utils/prompts";
    import { DataArr } from "drizzle-struct/front-end";
    import { onMount } from "svelte";

    interface Props {
        question: Scouting.PIT.QuestionData;
        questions: Scouting.PIT.QuestionArr;
    };

    const { question, questions }: Props = $props();

</script>

<div class="card">
    <div class="card-body">

    </div>
</div>