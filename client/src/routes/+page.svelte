<script>
	import Wallet from '$lib/components/Wallet.svelte';
	import { checkWalletConnection, connectWallet, shortAddress, walletState} from '$lib/web3.svelte';
	import { onMount } from 'svelte';

	onMount(async () => {
		console.log('🚀 Page loaded, checking wallet...');
		await checkWalletConnection();
	});
   
</script>

<svelte:head>
	<title>Wallet Connection Test</title>
</svelte:head>
{#if !walletState.isConnected}
		<button onclick={() => connectWallet()}>Connect Wallet</button>
	{:else}
		<div>Connected: {shortAddress()}</div>
	{/if}


<!-- <Wallet/> -->