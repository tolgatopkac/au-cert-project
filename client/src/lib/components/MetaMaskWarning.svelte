<script lang="ts">
	import { checkMetaMask, getMetaMaskInstallUrl } from '$lib/utils/metamask.js';
	
	const metamaskStatus = checkMetaMask();
	const installUrl = getMetaMaskInstallUrl();
	
	let dismissed = $state(false);
	
	function dismiss() {
		dismissed = true;
		localStorage.setItem('metamask-warning-dismissed', 'true');
	}
	
	// Check if user previously dismissed
	$effect(() => {
		if (typeof window !== 'undefined') {
			dismissed = localStorage.getItem('metamask-warning-dismissed') === 'true';
		}
	});
</script>

{#if !metamaskStatus.isAvailable && !dismissed}
	<div class="fixed top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 p-4 z-50">
		<div class="max-w-7xl mx-auto flex items-center justify-between">
			<div class="flex items-center space-x-3">
				<div class="flex-shrink-0">
					<svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
					</svg>
				</div>
				<div class="flex-1">
					<h3 class="text-sm font-medium text-amber-800">
						MetaMask Required for Full Functionality
					</h3>
					<p class="text-sm text-amber-700 mt-1">
						Install MetaMask to connect your wallet and interact with smart contracts. 
						<span class="text-amber-600">Currently showing demo data.</span>
					</p>
				</div>
			</div>
			
			<div class="flex items-center space-x-3">
				<a 
					href={installUrl} 
					target="_blank" 
					rel="noopener noreferrer"
					class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
				>
					Install MetaMask
				</a>
				<button 
					onclick={dismiss}
					class="text-amber-600 hover:text-amber-800 p-1"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
		</div>
	</div>
{/if} 