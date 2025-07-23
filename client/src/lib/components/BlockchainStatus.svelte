<script lang="ts">
	import { propertyState } from '$lib/stores/propertyStore.svelte.js';
	import { walletState, connectWallet } from '$lib/web3.svelte.js';
	
	let isVisible = $state(true);
	
	function dismiss() {
		isVisible = false;
	}
</script>

{#if propertyState.error && isVisible}
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
		<div class="flex items-start justify-between">
			<div class="flex items-start space-x-3">
				<div class="flex-shrink-0">
					<svg class="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
				</div>
				<div>
					<h3 class="text-sm font-medium text-blue-800">Demo Mode Active</h3>
					<p class="text-sm text-blue-700 mt-1">
						{propertyState.error} Connect your wallet to interact with real blockchain data.
					</p>
					{#if !walletState.isConnected}
						<button 
							onclick={connectWallet}
							class="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
						>
							Connect Wallet
						</button>
					{/if}
				</div>
			</div>
			<button 
				onclick={dismiss}
				class="text-blue-400 hover:text-blue-600"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
		</div>
	</div>
{/if} 