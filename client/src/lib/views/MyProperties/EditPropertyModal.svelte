<script lang="ts">
	import { updateProperty } from '$lib/web3.svelte.js';
	import { CategorySchema } from '$lib/shared/types';
	import { Edit, X, Loader2, CheckCircle, AlertCircle, Home, FileText, MapPin, Tag, Image as ImageIcon } from '@lucide/svelte';
	import type { Property } from '$lib/shared/types';

	// Props
	const { isOpen = $bindable(), property = $bindable(), onClose, onSuccess }: { isOpen: boolean, property: Property | null, onClose: () => void, onSuccess: () => void } = $props();

	// Form state
	const formState = $state({
		propertyTitle: '',
		description: '',
		category: '',
		images: '',
		propertyAddress: '',
		loading: false,
		success: false,
		error: null as string | null,
		txHash: null as string | null
	});

	// Reset form when opened
	$effect(() => {
		if (isOpen && property) {
			formState.propertyTitle = property.title || '';
			formState.description = property.description || '';
			formState.category = property.category || '';
			formState.images = property.image || '';
			formState.propertyAddress = property.address || '';
			formState.loading = false;
			formState.success = false;
			formState.error = null;
			formState.txHash = null;
		}
	});

	async function handleUpdateProperty() {
		if (!property) return;

		try {
			formState.loading = true;
			formState.error = null;

			// Validation
			if (!formState.propertyTitle.trim()) {
				throw new Error('Property title is required');
			}
			if (!formState.description.trim()) {
				throw new Error('Description is required');
			}
			if (!formState.propertyAddress.trim()) {
				throw new Error('Property address is required');
			}

			console.log('✏️ Updating property:', {
				propertyId: property.productId,
				formData: formState
			});

			const result = await updateProperty(property.productId, {
				propertyTitle: formState.propertyTitle,
				description: formState.description,
				category: formState.category,
				images: formState.images,
				propertyAddress: formState.propertyAddress
			});

			formState.success = true;
			formState.txHash = result.txHash;

			setTimeout(() => {
				onSuccess();
				handleClose();
			}, 2000);

		} catch (error) {
			console.error('❌ Failed to update property:', error);
			formState.error = error instanceof Error ? error.message : 'Failed to update property';
		} finally {
			formState.loading = false;
		}
	}

	function handleClose() {
		Object.assign(formState, {
			propertyTitle: '',
			description: '',
			category: '',
			images: '',
			propertyAddress: '',
			loading: false,
			success: false,
			error: null,
			txHash: null
		});
		onClose();
	}
</script>

{#if isOpen && property}
	<!-- Modal Backdrop -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" >
		<!-- Modal Content - Larger for form -->
		<div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto transform rounded-2xl bg-white p-6 shadow-xl" >
			
			{#if formState.success}
				<!-- Success State -->
				<div class="text-center">
					<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
						<CheckCircle class="h-8 w-8 text-green-600" />
					</div>
					<h4 class="mb-2 text-lg font-bold text-slate-800">Property Updated!</h4>
					<p class="mb-4 text-slate-600">Your property has been successfully updated.</p>
					{#if formState.txHash}
						<p class="text-xs text-slate-500">Transaction: {formState.txHash.slice(0, 10)}...</p>
					{/if}
				</div>
			{:else}
				<!-- Header -->
				<div class="mb-6 flex items-center justify-between">
					<div class="flex items-center space-x-2">
						<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
							<Edit class="h-5 w-5 text-slate-600" />
						</div>
						<div>
							<h3 class="text-xl font-bold text-slate-800">Edit Property</h3>
							<p class="text-sm text-slate-600">{property.title}</p>
						</div>
					</div>
					<button onclick={handleClose} class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100">
						<X class="h-5 w-5" />
					</button>
				</div>

				<!-- Form -->
				<div class="space-y-4">
					<!-- Title -->
					<div>
						<label for="propertyTitle" class="mb-2 block text-sm font-semibold text-slate-700">Property Title *</label>
						<div class="relative">
							<Home class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
							<input
								type="text"
								bind:value={formState.propertyTitle}
								placeholder="e.g., Modern Downtown Apartment"
								class="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 focus:border-slate-500"
								disabled={formState.loading}
							/>
						</div>
					</div>

					<!-- Description -->
					<div>
						<label for="description" class="mb-2 block text-sm font-semibold text-slate-700">Description *</label>
						<textarea
							bind:value={formState.description}
							placeholder="Property description..."
							rows="3"
							class="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500"
							disabled={formState.loading}
						></textarea>
					</div>

					<!-- Category & Address -->
					<div class="grid gap-4 md:grid-cols-2">
						<div>
							<label for="category" class="mb-2 block text-sm font-semibold text-slate-700">Category</label>
							<div class="relative">
								<Tag class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
								<select
									bind:value={formState.category}
									class="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2 pr-4 pl-10 focus:border-slate-500"
									disabled={formState.loading}
								>
									{#each CategorySchema.options as category}
										<option value={category}>{category}</option>
									{/each}
								</select>
							</div>
						</div>

						<div>
							<label for="propertyAddress" class="mb-2 block text-sm font-semibold text-slate-700">Address *</label>
							<div class="relative">
								<MapPin class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
								<input
									type="text"
									bind:value={formState.propertyAddress}
									placeholder="Property address"
									class="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 focus:border-slate-500"
									disabled={formState.loading}
								/>
							</div>
						</div>
					</div>

					<!-- Image URL -->
					<div>
						<label for="images" class="mb-2 block text-sm font-semibold text-slate-700">Image URL</label>
						<div class="relative">
							<ImageIcon class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
							<input
								type="url"
								bind:value={formState.images}
								placeholder="https://example.com/image.jpg"
								class="w-full rounded-lg border border-slate-300 py-2 pr-4 pl-10 focus:border-slate-500"
								disabled={formState.loading}
							/>
						</div>
					</div>

					<!-- Error -->
					{#if formState.error}
						<div class="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-3">
							<AlertCircle class="h-4 w-4 text-red-500" />
							<p class="text-sm text-red-700">{formState.error}</p>
						</div>
					{/if}

					<!-- Actions -->
					<div class="flex space-x-3 pt-4">
						<button
							onclick={handleClose}
							disabled={formState.loading}
							class="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							onclick={handleUpdateProperty}
							disabled={formState.loading}
							class="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-slate-600 px-4 py-3 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
						>
							{#if formState.loading}
								<Loader2 class="h-4 w-4 animate-spin" />
								<span>Updating...</span>
							{:else}
								<Edit class="h-4 w-4" />
								<span>Update Property</span>
							{/if}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}