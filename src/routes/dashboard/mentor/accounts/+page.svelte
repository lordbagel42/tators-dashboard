<script lang="ts">
	import Table from "$lib/components/account/Table.svelte";
import { Account } from "$lib/model/account";
	import { DataArr } from "drizzle-struct/front-end";
	import { onMount } from "svelte";

    let accounts: Account.AccountArr = $state(new DataArr(Account.Account, []));

    onMount(() => {
        accounts = Account.Account.all(false);
    });
</script>

<Table {accounts} />