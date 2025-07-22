<script>
	import { connectWallet } from '$lib/web3.svelte';
	import { AlertCircle } from '@lucide/svelte';


</script>

<div class="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
	<AlertCircle class="mx-auto mb-4 h-16 w-16 text-amber-500" />
	<h2 class="mb-2 text-xl font-bold text-slate-800">Wallet Required</h2>
	<p class="mb-6 text-slate-600">Please connect your wallet to view your properties.</p>
	<button
		onclick={connectWallet}
		class="w-full rounded-lg bg-emerald-600 px-6 py-3 text-white transition-colors hover:bg-emerald-700"
	>
		Connect Wallet
	</button>
</div>
