<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { connectWallet } from '$lib/web3.svelte';
	import '../app.css';

	let { children } = $props();

	$effect(() => {
		console.log('🚀 Layout mounted');
	});


</script>
<Header />
{@render children()}
