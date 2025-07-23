<script lang="ts">
	import { walletState } from '$lib/web3.svelte.js';
	import {
		Home,
		DollarSign,
		Edit,
		Eye,
		Star,
		Plus,
		MapPin,
		Tag,
		AlertCircle
	} from '@lucide/svelte';
	import WalletConnectionPrompt from '$lib/components/WalletConnectionPrompt.svelte';
	import PageHeader from './PageHeader.svelte';
	import PageLoadingState from './PageLoadingState.svelte';
	import {
		clearMyProperties,
		loadMyProperties,
		myPropertiesPageState,
		userStats
	} from './MyPropertiesState.svelte';
	import DashboardStat from './DashboardStat.svelte';
	import ContentHeader from './ContentHeader.svelte';
	import ErrorState from './ErrorState.svelte';
	import EmptyState from './EmptyState.svelte';
	import { goto } from '$app/navigation';
	import type { Property } from '$lib/shared/types';
	import UpdatePriceModal from './UpdatePriceModal.svelte';
	import EditPropertyModal from './EditPropertyModal.svelte';

	// Mock recent activities for now


	// Filtered properties based on active tab
	let filteredProperties = $derived(() => {
		const allProps = userStats.properties;

		switch (myPropertiesPageState.activeTab) {
			case 'all':
				return allProps;
			case 'active':
				return allProps.filter((p: Property) => parseFloat(p.price || '0') > 0);
			case 'recent':
				return allProps.slice().sort((a: Property, b: Property) => b.productId - a.productId);
			case 'reviewed':
				return allProps.filter((p: Property) => p.reviews && p.reviews.length > 0);
			default:
				return allProps;
		}
	});
	$effect(() => {
		// Address değiştiğinde veya connection durumu değiştiğinde yeniden yükle
		if (walletState.isConnected && walletState.address) {
			console.log('🔄 Loading properties for address:', walletState.address);
			loadMyProperties();
		} else {
			console.log('👛 Wallet disconnected, clearing data');
			clearMyProperties();
		}

		return () => {
			console.log('🧹 MyProperties effect cleanup');
		};
	});

	$effect(() => {
		console.log('🔄 filteredProperties:', filteredProperties());
	});

	// ✅ Edit handler
	function handleEditProperty(property: Property) {
		console.log('Opening edit modal for:', property.title);
		modalState.editModal.selectedProperty = property;
		modalState.editModal.isOpen = true;
	}

	function handleEditModalClose() {
		modalState.editModal.isOpen = false;
		modalState.editModal.selectedProperty = null;
	}

	function handleEditSuccess() {
		console.log('✅ Property updated successfully, refreshing...');
		loadMyProperties();
	}


	function handleViewProperty(propertyId: string) {
		goto(`/property/${propertyId}`);
	}

	function handleViewReviews(propertyId: string) {
		goto(`/property/${propertyId}/reviews`);
	}

	/* PRICE!! */

	// Modal state
	const modalState = $state({
		priceModal: { isOpen: false, selectedProperty: null as Property | null },
		editModal: { isOpen: false, selectedProperty: null as Property | null }
	});

	// ✅ Update handleUpdatePrice
	function handleUpdatePrice(property: Property) {
		console.log('Opening price update modal for:', property.title);
		modalState.priceModal.selectedProperty = property;
		modalState.priceModal.isOpen = true;
	}

	function handleModalClose() {
		modalState.priceModal.isOpen = false;
		modalState.priceModal.selectedProperty = null;
	}

	function handlePriceUpdateSuccess() {
		console.log('✅ Price updated successfully, refreshing data...');
		loadMyProperties(); // Refresh properties
	}
</script>

<svelte:head>
	<title>My Properties - PropChain</title>
	<meta
		name="description"
		content="Manage your blockchain properties and track your real estate portfolio on PropChain."
	/>
</svelte:head>

<main class="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Page Header -->

		{#if !walletState.isConnected}
			<WalletConnectionPrompt />
		{:else if myPropertiesPageState.loading}
			<PageLoadingState />
		{:else}
			<PageHeader />
			<DashboardStat />
			<ContentHeader />

			{#if myPropertiesPageState.error}
				<!-- Error State -->
				<ErrorState />
			{:else if filteredProperties().length === 0}
				<EmptyState />
			{:else}
				<!-- Properties Grid/List -->
				{#if myPropertiesPageState.viewMode === 'grid'}
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each filteredProperties() as property}
							<div
								class="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl"
							>
								<!-- Property Image -->
								<div
									class="relative h-48 overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100"
								>
									{#if property.image}
										<img
											src={property.image}
											alt={property.title}
											class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
										/>
									{:else}
										<div class="flex h-full w-full items-center justify-center">
											<Home class="h-12 w-12 text-emerald-400" />
										</div>
									{/if}

									<!-- Price Badge -->
									<div
										class="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm"
									>
										<span class="font-bold text-emerald-600">{property.price} ETH</span>
									</div>

									<!-- Status Badge -->
									<div
										class="absolute top-4 left-4 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white"
									>
										Active
									</div>
								</div>

								<!-- Property Details -->
								<div class="p-6">
									<h3 class="mb-2 line-clamp-1 text-xl font-bold text-slate-800">
										{property.title}
									</h3>

									<p class="mb-4 line-clamp-2 text-slate-600">
										{property.description || 'No description provided'}
									</p>

									<div class="mb-4 flex items-center justify-between text-sm text-slate-500">
										<span class="flex items-center space-x-1">
											<MapPin class="h-4 w-4" />
											<span>{property.address || 'Location not specified'}</span>
										</span>
										<span class="flex items-center space-x-1">
											<Tag class="h-4 w-4" />
											<span>{property.category}</span>
										</span>
									</div>

									<!-- Action Buttons -->
									<div class="grid grid-cols-2 gap-2">
										<button
											onclick={() => handleEditProperty(property)}
											class="flex items-center justify-center space-x-1 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-200"
										>
											<Edit class="h-4 w-4" />
											<span>Edit</span>
										</button>
										<button
											onclick={() => handleViewProperty(property.id)}
											class="flex items-center justify-center space-x-1 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700 transition-colors hover:bg-emerald-200"
										>
											<Eye class="h-4 w-4" />
											<span>View</span>
										</button>
									</div>

									<div class="mt-2 grid grid-cols-2 gap-2">
										<button
											onclick={() => handleUpdatePrice(property)}
											class="flex items-center justify-center space-x-1 rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-700 transition-colors hover:bg-blue-200"
										>
											<DollarSign class="h-4 w-4" />
											<span>Price</span>
										</button>
									<!-- 	<button
											onclick={() => handleViewReviews(property.id)}
											class="flex items-center justify-center space-x-1 rounded-lg bg-yellow-100 px-3 py-2 text-sm text-yellow-700 transition-colors hover:bg-yellow-200"
										>
											<Star class="h-4 w-4" />
											<span>Reviews</span>
										</button> -->
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<!-- List View -->
					<div class="overflow-hidden rounded-2xl bg-white shadow-lg">
						<div class="overflow-x-auto">
							<table class="min-w-full">
								<thead class="border-b border-slate-200 bg-slate-50">
									<tr>
										<th class="px-6 py-4 text-left text-sm font-semibold text-slate-600"
											>Property</th
										>
										<th class="px-6 py-4 text-left text-sm font-semibold text-slate-600"
											>Category</th
										>
										<th class="px-6 py-4 text-left text-sm font-semibold text-slate-600">Price</th>
										<th class="px-6 py-4 text-left text-sm font-semibold text-slate-600">Status</th>
										<th class="px-6 py-4 text-left text-sm font-semibold text-slate-600">Actions</th
										>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-200">
									{#each filteredProperties() as property}
										<tr class="transition-colors hover:bg-slate-50">
											<td class="px-6 py-4">
												<div class="flex items-center space-x-3">
													<div
														class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100"
													>
														<Home class="h-6 w-6 text-emerald-600" />
													</div>
													<div>
														<p class="font-semibold text-slate-800">{property.title}</p>
														<p class="text-sm text-slate-500">{property.address}</p>
													</div>
												</div>
											</td>
											<td class="px-6 py-4 text-slate-600">{property.category}</td>
											<td class="px-6 py-4 font-semibold text-slate-800">{property.price} ETH</td>
											<td class="px-6 py-4">
												<span
													class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
												>
													Active
												</span>
											</td>
											<td class="px-6 py-4">
												<div class="flex items-center space-x-2">
													<button
														onclick={() => handleViewProperty(property.id)}
														class="p-2 text-slate-400 transition-colors hover:text-emerald-600"
														title="View Property"
													>
														<Eye class="h-4 w-4" />
													</button>
													<button
														onclick={() => handleEditProperty(property)}
														class="p-2 text-slate-400 transition-colors hover:text-blue-600"
														title="Edit Property"
													>
														<Edit class="h-4 w-4" />
													</button>
													<button
														onclick={() => handleUpdatePrice(property)}
														class="p-2 text-slate-400 transition-colors hover:text-purple-600"
														title="Update Price"
													>
														<DollarSign class="h-4 w-4" />
													</button>
												<!-- 	<button
														onclick={() => handleViewReviews(property.id)}
														class="p-2 text-slate-400 transition-colors hover:text-yellow-600"
														title="View Reviews"
													>
														<Star class="h-4 w-4" />
													</button> -->
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}
			{/if}

			<!-- Recent Activities Sidebar (Optional - for larger screens) -->
			<!-- 	<div class="fixed top-24 right-8 hidden w-80 xl:block">
				<div class="rounded-2xl bg-white p-6 shadow-lg">
					<h3 class="mb-4 flex items-center space-x-2 text-lg font-bold text-slate-800">
						<Activity class="h-5 w-5" />
						<span>Recent Activity</span>
					</h3>

					<div class="space-y-3">
						{#each recentActivities as activity}
							<div class="flex items-center space-x-3 rounded-lg bg-slate-50 p-3">
								<div
									class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100"
								>
									<svelte:component this={activity.icon} class="h-4 w-4 text-emerald-600" />
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium text-slate-800">{activity.property}</p>
									<p class="text-xs text-slate-500">{activity.timestamp}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div> -->
		{/if}
	</div>
</main>

<UpdatePriceModal
	bind:isOpen={modalState.priceModal.isOpen}
	bind:property={modalState.priceModal.selectedProperty}
	onClose={handleModalClose}
	onSuccess={handlePriceUpdateSuccess}
/>

<EditPropertyModal
	bind:isOpen={modalState.editModal.isOpen}
	bind:property={modalState.editModal.selectedProperty}
	onClose={handleEditModalClose}
	onSuccess={handleEditSuccess}
/>