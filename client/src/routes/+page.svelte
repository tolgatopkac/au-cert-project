<script lang="ts">
	import { PropertyService } from '$lib/services/propertyService';
	import Home from '$lib/views/Home/Home.svelte';
	import { homePageStateLoad } from '$lib/views/Home/HomeState.svelte';
	import { walletState, connectWallet } from '$lib/web3.svelte.js';

	
	let helpWidgetOpen = $state(false);
	let helpButton: HTMLButtonElement | null = $state(null);


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

	async function addSepoliaNetwork() {
		if (typeof window !== 'undefined' && window.ethereum) {
			try {
				await window.ethereum.request({
					method: 'wallet_addEthereumChain',
					params: [{
						chainId: '0xAA36A7', // 11155111 in hex
						chainName: 'Sepolia Test Network',
						nativeCurrency: {
							name: 'SepoliaETH',
							symbol: 'ETH',
							decimals: 18
						},
						rpcUrls: ['https://sepolia.infura.io/v3/'],
						blockExplorerUrls: ['https://sepolia.etherscan.io/']
					}]
				});
			} catch (error) {
				console.error('Failed to add Sepolia network:', error);
			}
		} else {
			alert('MetaMask is not installed. Please install MetaMask first!');
		}
	}
	function scrollToGuide() {
		const footer = document.querySelector('[data-guide]');
		if (footer) {
			footer.scrollIntoView({ 
				behavior: 'smooth',
				block: 'start'
			});
		}
		helpWidgetOpen = false; 
	}

	function toggleHelpWidget() {
		helpWidgetOpen = !helpWidgetOpen;
	}

	async function handleConnectWallet() {
		await connectWallet();
		helpWidgetOpen = false; // Close widget after connecting
	}


</script>

<svelte:head>
	<title>PropChain - Decentralized Real Estate Platform</title>
	<meta
		name="description"
		content="Buy, sell and review real estate properties on the blockchain. Secure, transparent, and decentralized."
	/>
</svelte:head>

<Home {handleConnectWallet} />
<div class="fixed bottom-6 right-6 z-40">
	<div class="relative">
		<!-- Floating Button -->
		<button 
			bind:this={helpButton}
			onclick={toggleHelpWidget}
			class="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group"
		>
			<svg class="w-6 h-6 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
			</svg>
			
			<!-- Pulse Effect -->
			<div class="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
		</button>
		
		<!-- ✅ Reactive Widget - Shows/hides based on state -->
		{#if helpWidgetOpen}
			<div class="absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-80 animate-in slide-in-from-bottom-2 duration-200">
				<div class="flex items-center justify-between mb-3">
					<h4 class="font-bold text-slate-800">🚀 New to PropChain?</h4>
					<button 
						onclick={() => helpWidgetOpen = false}
						class="text-slate-400 hover:text-slate-600 transition-colors"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>
				
				<p class="text-sm text-slate-600 mb-4">Follow our 3-step guide to get started!</p>
				
				<div class="space-y-2">
					<button 
						onclick={scrollToGuide}
						class="w-full text-left p-3 rounded-lg hover:bg-slate-50 text-sm transition-colors flex items-center space-x-3"
					>
						<span class="text-lg">📱</span>
						<span>View Getting Started Guide</span>
					</button>
					<button 
						onclick={handleConnectWallet}
						class="w-full text-left p-3 rounded-lg hover:bg-emerald-50 text-sm transition-colors flex items-center space-x-3"
					>
						<span class="text-lg">🔗</span>
						<span>Connect Wallet Now</span>
					</button>
					<button 
						onclick={addSepoliaNetwork}
						class="w-full text-left p-3 rounded-lg hover:bg-blue-50 text-sm transition-colors flex items-center space-x-3"
					>
						<span class="text-lg">🌐</span>
						<span>Add Sepolia Network</span>
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
<div class="bg-slate-50 border-t border-slate-200" data-guide>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
		
		<!-- Getting Started Guide -->
		<div class="mb-8">
			<h3 class="text-lg font-bold text-slate-800 mb-4 text-center">
				🚀 Getting Started with PropChain
			</h3>
			<p class="text-center text-slate-600 mb-6 max-w-2xl mx-auto">
				New to Web3? Follow these simple steps to start exploring blockchain properties!
			</p>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<!-- Step 1: MetaMask -->
				<div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
					<div class="flex items-center mb-4">
						<div class="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
							1
						</div>
						<h4 class="text-lg font-bold text-slate-800">Install MetaMask</h4>
					</div>
					<p class="text-slate-600 mb-4 leading-relaxed">
						Download and install MetaMask browser extension to connect your wallet to Web3 applications.
					</p>
					<a 
						href="https://metamask.io/download/" 
						target="_blank" 
						rel="noopener noreferrer"
						class="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
					>
						<span>Download MetaMask</span>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
						</svg>
					</a>
				</div>

				<!-- Step 2: Add Sepolia -->
				<div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
					<div class="flex items-center mb-4">
						<div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
							2
						</div>
						<h4 class="text-lg font-bold text-slate-800">Add Sepolia Network</h4>
					</div>
					<p class="text-slate-600 mb-4 leading-relaxed">
						Add Sepolia testnet to your MetaMask to interact with our smart contracts safely.
					</p>
					<button 
						onclick={addSepoliaNetwork}
						class="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
					>
						<span>Add Sepolia Network</span>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
						</svg>
					</button>
				</div>

				<!-- Step 3: Get Test ETH -->
				<div class="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
					<div class="flex items-center mb-4">
						<div class="w-12 h-12 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
							3
						</div>
						<h4 class="text-lg font-bold text-slate-800">Get Test ETH</h4>
					</div>
					<p class="text-slate-600 mb-4 leading-relaxed">
						Get free test ETH from Sepolia faucet to interact with properties and make transactions.
					</p>
					<div class="space-y-2">
						<a 
							href="https://sepoliafaucet.com/" 
							target="_blank" 
							rel="noopener noreferrer"
							class="block text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
						>
							🔗 Sepolia Faucet (Alchemy)
						</a>
						<a 
							href="https://www.infura.io/faucet/sepolia" 
							target="_blank" 
							rel="noopener noreferrer"
							class="block text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
						>
							🔗 Infura Faucet
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="border-t border-slate-200 pt-6">
			<div class="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
				<p class="text-sm text-slate-500">© 2025 PropChain. All rights reserved.</p>
			</div>
		</div>
	</div>
</div>