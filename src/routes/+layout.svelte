<script>
	import { Struct } from 'drizzle-struct/front-end';
	import { browser } from '$app/environment';
	import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';

	ModuleRegistry.registerModules([ClientSideRowModelModule]);

	setTimeout(() => {
		if (browser) Struct.buildAll();
	});
	const { children } = $props();
</script>

<main>
	{@render children()}
</main>
