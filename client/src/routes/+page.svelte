<script>
	import { PropertyService } from '$lib/services/propertyService';
	import Home from '$lib/views/Home/Home.svelte';
	import { homePageStateLoad } from '$lib/views/Home/HomeState.svelte';
	import { walletState, connectWallet } from '$lib/web3.svelte.js';

	// Handle connect wallet for actions requiring wallet
	async function handleConnectWallet() {
		if (!walletState.isConnected) {
			await connectWallet();
		}
	}

	$effect(() => {
		console.log('🚀 Loading data...');
		console.log('👛 Wallet connected:', walletState);
		homePageStateLoad();

		// Wallet connection durumu değişirse yeniden yükle
		if (walletState.isConnected) {
			console.log('👛 Wallet connected, refreshing data...');
		}

		return () => {
			console.log('🧹 Cleanup previous load');
		};
	});
</script>

<svelte:head>
	<title>PropChain - Decentralized Real Estate Platform</title>
	<meta
		name="description"
		content="Buy, sell and review real estate properties on the blockchain. Secure, transparent, and decentralized."
	/>
</svelte:head>

<Home {handleConnectWallet} />
