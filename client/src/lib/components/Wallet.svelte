<script lang="ts">
	import { isWalletReady, networkName, shortAddress, walletState } from '$lib/stores/walletStore.svelte';
	import { connectWallet, disconnectWallet } from '$lib/web3.svelte';
</script>

<div class="min-h-screen bg-gray-100 py-8">
	<div class="container mx-auto max-w-2xl p-6">
		
		<!-- Debug Panel -->
		<div class="bg-white rounded-lg shadow-md p-6 mb-6">
			<h2 class="text-xl font-semibold mb-4">🐛 Debug Info</h2>
			<div class="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded">
				<p><strong>Connected:</strong> {walletState.isConnected}</p>
				<p><strong>Loading:</strong> {walletState.loading}</p>
				<p><strong>Address:</strong> {walletState.address || 'None'}</p>
				<p><strong>Network:</strong> {walletState.network || 'None'}</p>
				<p><strong>Network Name:</strong> {networkName()}</p>
				<p><strong>Wallet Ready:</strong> {isWalletReady()}</p>
				<p><strong>Short Address:</strong> {shortAddress() || 'None'}</p>
				<p><strong>Error:</strong> {walletState.error || 'None'}</p>
			</div>
		</div>

		<!-- Wallet Section -->
		<div class="bg-white rounded-lg shadow-md p-6">
			{#if !walletState.isConnected}
				<div class="text-center">
					<div class="text-6xl mb-4">🦊</div>
					<h3 class="text-xl font-semibold mb-2">Wallet Not Connected</h3>
					<p class="text-gray-600 mb-6">Connect your MetaMask wallet to continue</p>
					
					<button
						onclick={connectWallet}
						disabled={walletState.loading}
						class="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50"
					>
						{#if walletState.loading}
							<div class="flex items-center justify-center">
								<div class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
								Connecting...
							</div>
						{:else}
							🔗 Connect MetaMask
						{/if}
					</button>
				</div>
			{:else}
				<div class="text-center">
					<div class="text-6xl mb-4">✅</div>
					<h3 class="text-xl font-semibold mb-2 text-green-700">Wallet Connected!</h3>
					
					<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
						<div class="space-y-2">
							<p class="font-semibold">Address: {shortAddress()}</p>
							<p class="text-sm text-gray-600">Network: {networkName()}</p>
							<p class="text-sm">
								Status: 
								{#if isWalletReady()}
									<span class="text-green-600 font-semibold">Ready ✅</span>
								{:else}
									<span class="text-orange-600 font-semibold">Wrong Network ⚠️</span>
								{/if}
							</p>
						</div>
					</div>

					<!-- Network Warning -->
					{#if !isWalletReady()}
						<div class="bg-orange-100 border border-orange-200 rounded-lg p-4 mb-4">
							<p class="font-semibold text-orange-800">⚠️ Wrong Network</p>
							<p class="text-orange-700 text-sm">Please switch to Sepolia testnet</p>
						</div>
					{/if}

					<div class="space-y-2">
						<button
							onclick={() => console.log('Wallet State:', walletState)}
							class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
						>
							📊 Log State
						</button>
						
						<br>
						
						<button
							onclick={disconnectWallet}
							class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
						>
							🔌 Disconnect
						</button>
					</div>
				</div>
			{/if}

			<!-- Error Display -->
			{#if walletState.error}
				<div class="mt-4 p-4 bg-red-100 border border-red-200 rounded-lg">
					<div class="flex items-start">
						<span class="text-red-500 text-xl mr-2">❌</span>
						<div class="flex-1">
							<p class="font-semibold text-red-800">Error</p>
							<p class="text-red-700 text-sm">{walletState.error}</p>
							<button
								onclick={() => { walletState.error = null; }}
								class="mt-2 text-red-600 text-sm underline"
							>
								Dismiss
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>