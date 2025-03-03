<script lang="ts">
	import Navbar from '$lib/components/general/Navbar.svelte';
	import { PUBLIC_APP_NAME } from '$env/static/public';
	import '$lib/defaults/mentor';

	const { children } = $props();
</script>

<main class="dashboard">
	<Navbar title={PUBLIC_APP_NAME} />

	{@render children()}
</main>
