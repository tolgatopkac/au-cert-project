<script lang="ts">
	import { walletState } from '$lib/web3.svelte.js';
	import {
		Home,
		MapPin,
		DollarSign,
		Tag,
		FileText,
		Image as ImageIcon,
		AlertCircle,
		Loader2,
		Upload
	} from '@lucide/svelte';
	import {
		createPropertyFormReset,
		createPropertyFormSubmit,
		formData,
		formUI
	} from './CreateFormState.svelte';
	import { CategorySchema } from '$lib/shared/types';

	function getFieldError(fieldName: string): string | null {
		if (!formUI.error || typeof formUI.error === 'string') return null;
		return formUI.error.properties?.[fieldName]?.errors?.[0] || null;
	}

	// Genel hata mesajlarını almak için
	function getGeneralErrors(): string[] {
		if (!formUI.error) return [];
		if (typeof formUI.error === 'string') return [formUI.error];
		return formUI.error.errors || [];
	}
	function clearFieldError(fieldName: string) {
		if (!formUI.error || typeof formUI.error === 'string') return;

		if (formUI.error.properties?.[fieldName]) {
			delete formUI.error.properties[fieldName];

			const hasFieldErrors =
				formUI.error.properties && Object.keys(formUI.error.properties).length > 0;
			const hasGeneralErrors = formUI.error.errors && formUI.error.errors.length > 0;

			if (!hasFieldErrors && !hasGeneralErrors) {
				formUI.error = null;
			}
		}
	}

	$effect(() => {});
</script>

<svelte:head>
	<title>List Property - PropChain</title>
	<meta
		name="description"
		content="List your property on the blockchain with PropChain's decentralized real estate platform."
	/>
</svelte:head>

<main class="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Page Header -->
		<div class="mb-8 text-center">
			<h1 class="mb-4 text-3xl font-bold text-slate-800 lg:text-4xl">List Your Property</h1>
			<p class="mx-auto max-w-2xl text-lg text-slate-600">
				Create a blockchain-verified listing for your real estate property
			</p>
		</div>

		<!-- Wallet Connection Check -->
		{#if !walletState.isConnected}
			<div class="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
				<AlertCircle class="mx-auto mb-4 h-16 w-16 text-amber-500" />
				<h2 class="mb-2 text-xl font-bold text-slate-800">Wallet Required</h2>
				<p class="mb-6 text-slate-600">
					Please connect your wallet to list a property on the blockchain.
				</p>
				<button
					class="w-full rounded-lg bg-emerald-600 px-6 py-3 text-white transition-colors hover:bg-emerald-700"
				>
					Connect Wallet
				</button>
			</div>
		{:else}
			<!-- Split Screen Layout -->
			<div class="grid gap-8 lg:grid-cols-2">
				<!-- LEFT SIDE - FORM -->
				<div class="rounded-2xl bg-white p-6 shadow-lg lg:p-8">
					<div class="mb-6 flex items-center space-x-2">
						<FileText class="h-6 w-6 text-emerald-600" />
						<h2 class="text-xl font-bold text-slate-800">Property Details</h2>
					</div>

					<form class="space-y-6">
						<!-- Property Title -->
						<div>
							<label for="title" class="mb-2 block text-sm font-semibold text-slate-700">
								Property Title *
							</label>
							<div class="relative">
								<Home
									class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400"
								/>
								<input
									id="title"
									type="text"
									bind:value={formData.propertyTitle}
									onfocus={() => clearFieldError('propertyTitle')}
									placeholder="e.g., Modern Downtown Apartment"
									class="w-full rounded-lg border border-slate-300 py-3 pr-4 pl-12 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
								/>
							</div>

							{#if getFieldError('propertyTitle')}
								<p class="mt-1 text-sm text-red-500">{getFieldError('propertyTitle')}</p>
							{/if}
						</div>

						<!-- Description -->
						<div>
							<label for="description" class="mb-2 block text-sm font-semibold text-slate-700">
								Description *
							</label>
							<textarea
								id="description"
								bind:value={formData.description}
								placeholder="Describe your property's features, amenities, and highlights..."
								rows="4"
								class="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
							></textarea>

							{#if getFieldError('description')}
								<p class="mt-1 text-sm text-red-500">{getFieldError('description')}</p>
							{/if}
						</div>

						<!-- Category & Price Row -->
						<div class="grid gap-4 md:grid-cols-2">
							<!-- Category -->
							<div>
								<label for="category" class="mb-2 block text-sm font-semibold text-slate-700">
									Category
								</label>
								<div class="relative">
									<Tag
										class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400"
									/>
									<select
										id="category"
										bind:value={formData.category}
										class="w-full appearance-none rounded-lg border border-slate-300 bg-white py-3 pr-4 pl-12 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
									>
										{#each CategorySchema.options as category}
											<option value={category}>{category}</option>
										{/each}
									</select>
								</div>
							</div>

							<!-- Price -->
							<div>
								<label for="price" class="mb-2 block text-sm font-semibold text-slate-700">
									Price (ETH) *
								</label>
								<div class="relative">
									<!-- 	<DollarSign
										class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400"
									/> -->
									<input
										id="price"
										type="number"
										step="0.01"
										min="0"
										bind:value={formData.price}
										placeholder="0.00"
										class="w-full rounded-lg border border-slate-300 py-3 pr-12 pl-8 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
									/>
									<!-- class:border-red-500={validationErrors.price} -->

									<span
										class="absolute top-1/2 right-3 -translate-y-1/2 transform font-medium text-slate-500"
										>ETH</span
									>
								</div>
								{#if getFieldError('price')}
									<p class="mt-1 text-sm text-red-500">{getFieldError('price')}</p>
								{/if}
							</div>
						</div>

						<!-- Property Address -->
						<div>
							<label for="address" class="mb-2 block text-sm font-semibold text-slate-700">
								Property Address *
							</label>
							<div class="relative">
								<MapPin
									class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400"
								/>
								<input
									id="address"
									type="text"
									bind:value={formData.propertyAddress}
									placeholder="e.g., 123 Main St, New York, NY"
									class="w-full rounded-lg border border-slate-300 py-3 pr-4 pl-12 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
								/>
							</div>

							{#if getFieldError('propertyAddress')}
								<p class="mt-1 text-sm text-red-500">{getFieldError('propertyAddress')}</p>
							{/if}
						</div>

						<!-- Image URL -->
						<div>
							<label for="images" class="mb-2 block text-sm font-semibold text-slate-700">
								Property Image URL
							</label>
							<div class="relative">
								<ImageIcon
									class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400"
								/>
								<input
									id="images"
									type="url"
									bind:value={formData.images}
									placeholder="https://example.com/property-image.jpg"
									class="w-full rounded-lg border border-slate-300 py-3 pr-4 pl-12 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
								/>
							</div>
							<!-- class:border-red-500={validationErrors.images} -->

							{#if getFieldError('images')}
								<p class="mt-1 text-sm text-red-500">{getFieldError('images')}</p>
							{/if}
						</div>

						<!-- Form Actions -->
						<div class="flex space-x-4 pt-4">
							<!--       disabled={createFormState.loading} -->
							<button
								type="button"
								onclick={createPropertyFormReset}
								class=" flex-1 rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
							>
								Reset Form
							</button>

							<button
								onclick={createPropertyFormSubmit}
								class="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
								type="button"
							>
								{#if formUI.loading}
									<Loader2 class="h-5 w-5 animate-spin" />
									<span>Creating...</span>
								{:else}
									<Upload class="h-5 w-5" />
									<span>List Property</span>
								{/if}
							</button>
						</div>

						<!-- Form Status Messages -->
						<!-- 	{#if formState.error}
							<div
								class="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-4"
							>
								<AlertCircle class="h-5 w-5 flex-shrink-0 text-red-500" />
								<p class="text-red-700">{formState.error}</p>
							</div>
						{/if}
 --><!-- 
						{#if formState.success}
							<div
								class="flex items-center space-x-2 rounded-lg border border-green-200 bg-green-50 p-4"
							>
								<CheckCircle class="h-5 w-5 flex-shrink-0 text-green-500" />
								<div>
									<p class="font-medium text-green-700">Property listed successfully!</p>
									{#if formState.txHash}
										<p class="text-sm text-green-600">
											Transaction: {formState.txHash.slice(0, 20)}...
										</p>
									{/if}
									<p class="text-sm text-green-600">Redirecting to My Properties...</p>
								</div>
							</div>
						{/if} -->
					</form>
				</div>

				<!-- RIGHT SIDE - PREVIEW -->
				<!-- 	<div class="rounded-2xl bg-white p-6 shadow-lg lg:p-8">
					<div class="mb-6 flex items-center space-x-2">
						<Eye class="h-6 w-6 text-emerald-600" />
						<h2 class="text-xl font-bold text-slate-800">Live Preview</h2>
					</div>

					<div
						class="overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50"
					>
						<div
							class="relative h-48 overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100"
						>
							{#if previewProperty.image && isValidURL(previewProperty.image)}
								<img
									src={previewProperty.image}
									alt={previewProperty.title}
									class="h-full w-full object-cover"
									loading="lazy"
								/>
							{:else}
								<div class="flex h-full w-full items-center justify-center">
									<div class="text-center">
										<ImageIcon class="mx-auto mb-2 h-12 w-12 text-slate-400" />
										<p class="text-sm text-slate-500">Property Image Preview</p>
									</div>
								</div>
							{/if}

							<div
								class="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm"
							>
								<span class="font-bold text-emerald-600">{previewProperty.price} ETH</span>
							</div>
						</div>

						<div class="p-6">
							<h3 class="mb-2 text-xl font-bold text-slate-800">
								{previewProperty.title}
							</h3>

							<p class="mb-4 line-clamp-3 text-slate-600">
								{previewProperty.description}
							</p>

							<div class="mb-4 flex items-center justify-between text-sm text-slate-500">
								<span class="flex items-center space-x-1">
									<MapPin class="h-4 w-4" />
									<span>{previewProperty.address}</span>
								</span>
								<span class="flex items-center space-x-1">
									<Tag class="h-4 w-4" />
									<span>{previewProperty.category}</span>
								</span>
							</div>

							<div class="flex items-center justify-between">
								<span class="text-sm text-slate-500">
									Owner: {previewProperty.shortOwner}
								</span>
								<button
									class="rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
								>
									View Details
								</button>
							</div>
						</div>
					</div>

					<div class="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
						<h4 class="mb-2 font-semibold text-blue-800">Preview Information</h4>
						<ul class="space-y-1 text-sm text-blue-700">
							<li>• This is how your property will appear to other users</li>
							<li>• Fill out the form to see changes in real-time</li>
							<li>• All fields marked with * are required</li>
							<li>• Transaction will be processed on Sepolia testnet</li>
						</ul>
					</div>
				</div> -->
			</div>
		{/if}
	</div>
</main>
