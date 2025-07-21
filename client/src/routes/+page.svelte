<script>
	import Wallet from '$lib/components/Wallet.svelte';
	import { propertyState } from '$lib/stores/propertyStore.svelte';
	import { checkWalletConnection, connectWallet, createProperty, disconnectWallet, getAllProperties, shortAddress, walletState} from '$lib/web3.svelte';
	import { onMount } from 'svelte';

	onMount(async () => {
		console.log('🚀 Page loaded, checking wallet...');
		await checkWalletConnection();
	});

	const formData = $state({
		propertyTitle: '',
		description: '',
		category: 'Apartment',
		price: '',
		image: '',
		propertyAddress: ''
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		console.log('🚀 Form submit:', formData);
		
	/* 	if (!isFormValid() || !isWalletReady()) {
			console.log('❌ Form validation failed');
			return;
		} */

		try {
			await createProperty(formData);
			
			// Success - wait then reset form
		/* 	setTimeout(() => {
				resetForm();
				resetCreateState();
			}, 3000); */
			
		} catch (error) {
			console.error('Create property failed:', error);
		}
	};


	/* --- get all properties --- */

	let refreshInterval;
	const startAutoRefresh = async () => {
	// İlk yükleme
	const result = await getAllProperties();
	console.log('🔄 Refreshed:', result);
	console.log('📊 Properties loaded:', result.length, 'items');
	
	// Her 30 saniyede bir güncelle  
	refreshInterval = setInterval(async () => {
		if (!propertyState.loading) {
			const refreshResult = await getAllProperties();
			console.log('🔄 Refreshed:', refreshResult);
			console.log('🔄 Refreshed:', refreshResult.length, 'properties');
		}
	}, 30000);
};

	const stopAutoRefresh = () => {
		if (refreshInterval) {
			clearInterval(refreshInterval);
			refreshInterval = null;
		}
	};

	$effect(() => {
		if (walletState.isConnected) {
			startAutoRefresh();
		} else {
			stopAutoRefresh();
		}
	});
</script>

<svelte:head>
	<title>Wallet Connection Test</title>
</svelte:head>
	{#if !walletState.isConnected}
		<button onclick={() => connectWallet()}>Connect Wallet</button>
	{:else}
		<div>Connected: {shortAddress()}</div>
		<button onclick={() => disconnectWallet()}>Disconnect Wallet</button>
	{/if}


{#if walletState.isConnected}
	<div class="flex flex-col items-center gap-2">
		<input type="text" placeholder="Property Title" bind:value={formData.propertyTitle}>
		<input type="text" placeholder="Property Description" bind:value={formData.description}>
		<input type="text" placeholder="Property Price" bind:value={formData.price}>
		<input type="text" placeholder="Property Image" bind:value={formData.image}>
		<input type="text" placeholder="Property Address" bind:value={formData.propertyAddress}>
		<button onclick={handleSubmit}>Create Property</button>
	</div>
{:else}
	<div>
		<p>Please connect your wallet to create a property</p>
	</div>
{/if}