<script lang="ts">
	import { PropertyService } from '$lib/services/propertyService.js';
	import { updatePrice, walletState } from '$lib/web3.svelte.js';
	import { DollarSign, X, Loader2, CheckCircle, AlertCircle } from '@lucide/svelte';
	import type { Property } from '$lib/shared/types';

	// Props
	const {
		isOpen = $bindable(),
		property = $bindable(),
		onClose,
		onSuccess
	}: {
		isOpen: boolean;
		property: Property | null;
		onClose: () => void;
		onSuccess: () => void;
	} = $props();

	// Modal state
	const modalState = $state({
		newPrice: '',
		loading: false,
		success: false,
		error: null as string | null,
		txHash: null as string | null
	});

	// Reset modal when opened
    $effect(() => {
		if (isOpen && property) {
			modalState.newPrice = property.price || '';
			modalState.loading = false;
			modalState.success = false;
			modalState.error = null;
			modalState.txHash = null;
		}
	});

    async function handleUpdatePrice() {
		if (!property) return;

		try {
			modalState.loading = true;
			modalState.error = null;

			// Validation
			const price = parseFloat(modalState.newPrice);
			if (isNaN(price) || price <= 0) {
				throw new Error('Please enter a valid price greater than 0');
			}

			if (price === parseFloat(property.price)) {
				throw new Error('New price must be different from current price');
			}

			console.log('💰 Updating price:', {
				propertyId: property.productId,
				oldPrice: property.price,
				newPrice: modalState.newPrice
			});

			const result = await updatePrice(property.productId, modalState.newPrice);

			modalState.success = true;
			modalState.txHash = result.txHash;

			setTimeout(() => {
				onSuccess();
				handleClose();
			}, 2000);

		} catch (error) {
			console.error('❌ Failed to update price:', error);
			modalState.error = error instanceof Error ? error.message : 'Failed to update price';
		} finally {
			modalState.loading = false;
		}
	}

	function handleClose() {
		modalState.newPrice = '';
		modalState.loading = false;
		modalState.success = false;
		modalState.error = null;
		modalState.txHash = null;
		onClose();
	}

	// Close on Escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen && property}
	<!-- Modal Backdrop -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<!-- Modal Content -->
		<div
			class="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all"
		>
			<!-- Header -->
			<div class="mb-6 flex items-center justify-between">
				<div class="flex items-center space-x-2">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
						<DollarSign class="h-5 w-5 text-blue-600" />
					</div>
					<div>
						<h3 class="text-xl font-bold text-slate-800">Update Price</h3>
						<p class="text-sm text-slate-600">{property.title}</p>
					</div>
				</div>
				<button
					onclick={handleClose}
					class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			{#if modalState.success}
				<!-- Success State -->
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
					>
						<CheckCircle class="h-8 w-8 text-green-600" />
					</div>
					<h4 class="mb-2 text-lg font-bold text-slate-800">Price Updated!</h4>
					<p class="mb-4 text-slate-600">Your property price has been successfully updated.</p>
					{#if modalState.txHash}
						<p class="text-xs text-slate-500">
							Transaction: {modalState.txHash.slice(0, 10)}...
						</p>
					{/if}
				</div>
			{:else}
				<!-- Form -->
				<div class="space-y-4">
					<!-- Current vs New Price -->
					<div class="rounded-lg bg-slate-50 p-4">
						<div class="flex justify-between text-sm">
							<span class="text-slate-600">Current Price:</span>
							<span class="font-semibold text-slate-800">{property.price} ETH</span>
						</div>
					</div>

					<!-- New Price Input -->
					<div>
						<label for="newPrice" class="mb-2 block text-sm font-semibold text-slate-700">
							New Price (ETH) *
						</label>
						<div class="relative">
							<input
								id="newPrice"
								type="number"
								step="0.01"
								min="0"
								bind:value={modalState.newPrice}
								placeholder="0.00"
								class="w-full rounded-lg border border-slate-300 py-3 pr-12 pl-4 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								disabled={modalState.loading}
							/>
							<span
								class="absolute top-1/2 right-3 -translate-y-1/2 transform font-medium text-slate-500"
							>
								ETH
							</span>
						</div>
					</div>

					<!-- Error Message -->
					{#if modalState.error}
						<div class="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-3">
							<AlertCircle class="h-4 w-4 flex-shrink-0 text-red-500" />
							<p class="text-sm text-red-700">{modalState.error}</p>
						</div>
					{/if}

					<!-- Actions -->
					<div class="flex space-x-3 pt-2">
						<button
							onclick={handleClose}
							disabled={modalState.loading}
							class="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							onclick={handleUpdatePrice}
							disabled={modalState.loading || !modalState.newPrice}
							class="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#if modalState.loading}
								<Loader2 class="h-4 w-4 animate-spin" />
								<span>Updating...</span>
							{:else}
								<DollarSign class="h-4 w-4" />
								<span>Update Price</span>
							{/if}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
