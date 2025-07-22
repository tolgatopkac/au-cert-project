<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import '../app.css';

	let { children } = $props();

	$effect(() => {
		console.log('🚀 Layout mounted');
	});
</script>

<Header />
{@render children()}
