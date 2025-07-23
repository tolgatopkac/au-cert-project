<script lang="ts">
	import { PropertyService } from '$lib/services/propertyService.js';
	import {
		Search,
		Grid3X3,
		List,
		MapPin,
		Tag,
		SlidersHorizontal,
		Home,
		AlertCircle,
		ChevronRight,
		X
	} from '@lucide/svelte';
	import type { Property } from '$lib/shared/types';

	// ✅ State management - Svelte 5 (MyProperties pattern'ı)
	const pageState = $state({
		loading: true,
		allProperties: [] as Property[],
		error: null as string | null
	});

	// ✅ Filter and search state
	const filterState = $state({
		searchQuery: '',
		selectedCategory: 'All',
		priceRange: { min: 0, max: 100 },
		sortBy: 'newest',
		viewMode: 'grid',
		showFilters: false
	});

	// Categories for filter
	const categories = [
		'All', 'Apartment', 'House', 'Villa', 'Penthouse', 
		'Loft', 'Cabin', 'Condo', 'Townhouse'
	];

	const sortOptions = [
		{ value: 'newest', label: 'Newest First' },
		{ value: 'oldest', label: 'Oldest First' },
		{ value: 'price-low', label: 'Price: Low to High' },
		{ value: 'price-high', label: 'Price: High to Low' }
	];

	// ✅ Filtered and sorted properties - $derived
	const filteredProperties = $derived(() => {
		let filtered = pageState.allProperties;

		// Search filter
		if (filterState.searchQuery.trim()) {
			const query = filterState.searchQuery.toLowerCase();
			filtered = filtered.filter(
				(property) =>
					property.title.toLowerCase().includes(query) ||
					property.description.toLowerCase().includes(query) ||
					property.address.toLowerCase().includes(query)
			);
		}

		// Category filter
		if (filterState.selectedCategory !== 'All') {
			filtered = filtered.filter((property) => property.category === filterState.selectedCategory);
		}

		// Price range filter
		filtered = filtered.filter((property) => {
			const price = parseFloat(property.price);
			return price >= filterState.priceRange.min && price <= filterState.priceRange.max;
		});

		// Sort
		filtered = [...filtered].sort((a, b) => {
			switch (filterState.sortBy) {
				case 'newest':
					return b.productId - a.productId;
				case 'oldest':
					return a.productId - b.productId;
				case 'price-low':
					return parseFloat(a.price) - parseFloat(b.price);
				case 'price-high':
					return parseFloat(b.price) - parseFloat(a.price);
				default:
					return 0;
			}
		});

		return filtered;
	});

	// ✅ Enhanced stats with more details
	const stats = $derived(() => {
		const filtered = filteredProperties();
		const total = pageState.allProperties.length;
		
		return {
			total,
			filtered: filtered.length,
			avgPrice: filtered.length > 0 
				? (filtered.reduce((sum, p) => sum + parseFloat(p.price), 0) / filtered.length).toFixed(3)
				: '0',
			maxPrice: filtered.length > 0 
				? Math.max(...filtered.map(p => parseFloat(p.price))).toFixed(2)
				: '0',
			minPrice: filtered.length > 0 
				? Math.min(...filtered.map(p => parseFloat(p.price))).toFixed(2)
				: '0',
			categories: [...new Set(filtered.map(p => p.category))].length
		};
	});

	// ✅ Enhanced image error handling
	function handleImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		img.style.display = 'none';
		const fallback = img.nextElementSibling as HTMLElement;
		if (fallback) fallback.style.display = 'flex';
	}

	// ✅ MyProperties pattern'ını kullan - $effect yerine manuel çağrı
	$effect(() => {
		console.log('🏠 Explore page mounted, loading properties...');
		loadAllProperties();
	});

	// ✅ MyProperties'tekinin aynısı - async function
	async function loadAllProperties() {
		try {
			pageState.loading = true;
			pageState.error = null;

			console.log('🏠 Loading ALL properties for explore page...');
			
			// MyProperties'teki gibi getAllProperties çağır
			const allProperties = await PropertyService.getAllProperties();
			
			// State'i direkt assign et (MyProperties pattern'ı)
			pageState.allProperties = allProperties;
			
			console.log('✅ ALL Properties loaded for explore:', {
				total: allProperties.length,
				first: allProperties[0]?.title || 'No properties'
			});

			// Calculate max price for slider
			if (allProperties.length > 0) {
				const maxPrice = Math.max(...allProperties.map((p) => parseFloat(p.price)));
				filterState.priceRange.max = Math.ceil(maxPrice) || 100;
				console.log('📊 Max price calculated:', filterState.priceRange.max);
			}

		} catch (error) {
			console.error('❌ Failed to load ALL properties:', error);
			pageState.error = 'Failed to load properties. Please try again.';
		} finally {
			pageState.loading = false;
		}
	}

	function clearFilters() {
		filterState.searchQuery = '';
		filterState.selectedCategory = 'All';
		filterState.priceRange.min = 0;
		filterState.sortBy = 'newest';
	}

	function toggleFilters() {
		filterState.showFilters = !filterState.showFilters;
	}

	// ✅ Debug için reactive değerleri log'la
	$effect(() => {
		console.log('🔍 Explore DEBUG:', {
			loading: pageState.loading,
			totalProperties: pageState.allProperties.length,
			filteredProperties: filteredProperties.length,
			error: pageState.error
		});
	});
</script>

<svelte:head>
	<title>Explore Properties - PropChain</title>
	<meta
		name="description"
		content="Discover and explore blockchain-verified real estate properties on PropChain's decentralized marketplace."
	/>
</svelte:head>

<!-- Enhanced Template with Better UI/UX -->
<main class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		
		<!-- ✅ Enhanced Page Header with Stats -->
		<div class="mb-8">
			<div class="text-center mb-6">
				<h1 class="mb-4 text-4xl font-bold bg-gradient-to-r from-slate-800 to-emerald-700 bg-clip-text text-transparent lg:text-5xl">
					Explore Properties
				</h1>
				<p class="mx-auto max-w-2xl text-lg text-slate-600">
					Discover blockchain-verified real estate properties from around the world
				</p>
			</div>
			
			<!-- ✅ Quick Stats Bar -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
					<p class="text-2xl font-bold text-emerald-600">{stats().total}</p>
					<p class="text-sm text-slate-500">Total Properties</p>
				</div>
				<div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
					<p class="text-2xl font-bold text-blue-600">{stats().categories}</p>
					<p class="text-sm text-slate-500">Categories</p>
				</div>
				<div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
					<p class="text-2xl font-bold text-purple-600">{stats().avgPrice}</p>
					<p class="text-sm text-slate-500">Avg Price (ETH)</p>
				</div>
				<div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
					<p class="text-2xl font-bold text-orange-600">{stats().filtered}</p>
					<p class="text-sm text-slate-500">Showing</p>
				</div>
			</div>
		</div>

		<!-- ✅ Enhanced Search and Filter Bar -->
		<div class="mb-6 rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
			<div class="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
				
				<!-- ✅ Enhanced Search Bar -->
				<div class="relative flex-1">
					<Search class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
					<input
						type="text"
						bind:value={filterState.searchQuery}
						placeholder="Search by title, description, location, or owner..."
						class="w-full rounded-xl border-2 border-slate-200 py-3 pr-4 pl-12 transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-slate-300"
					/>
					{#if filterState.searchQuery}
						<button
							onclick={() => filterState.searchQuery = ''}
							class="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
						>
							<X class="h-5 w-5" />
						</button>
					{/if}
				</div>

				<!-- ✅ Enhanced Filter and View Controls -->
				<div class="flex items-center space-x-3">
					<!-- Mobile Filter Toggle -->
					<button
						onclick={toggleFilters}
						class="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-3 text-slate-700 transition-all hover:from-slate-200 hover:to-slate-300 lg:hidden"
					>
						<SlidersHorizontal class="h-5 w-5" />
						<span>Filters</span>
						{#if filterState.selectedCategory !== 'All' || filterState.searchQuery || filterState.priceRange.min > 0}
							<span class="rounded-full bg-emerald-500 px-2 py-1 text-xs text-white">•</span>
						{/if}
					</button>

					<!-- ✅ Enhanced View Mode Toggle -->
					<div class="flex space-x-1 rounded-xl bg-slate-100 p-1">
						<button
							onclick={() => (filterState.viewMode = 'grid')}
							class="rounded-lg p-2 transition-all {filterState.viewMode === 'grid'
								? 'bg-white text-slate-800 shadow-md'
								: 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}"
						>
							<Grid3X3 class="h-5 w-5" />
						</button>
						<button
							onclick={() => (filterState.viewMode = 'list')}
							class="rounded-lg p-2 transition-all {filterState.viewMode === 'list'
								? 'bg-white text-slate-800 shadow-md'
								: 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}"
						>
							<List class="h-5 w-5" />
						</button>
					</div>

					<!-- ✅ Enhanced Results Count -->
					<div class="hidden rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 text-sm font-medium text-emerald-700 sm:block border border-emerald-200">
						{filteredProperties().length} of {pageState.allProperties.length}
					</div>
				</div>
			</div>
		</div>

		<!-- Desktop Filters + Results Layout -->
		<div class="grid gap-6 lg:grid-cols-4">
			
			<!-- ✅ Enhanced Left Sidebar - Filters (Desktop) -->
			<div class="hidden lg:col-span-1 lg:block">
				<div class="sticky top-8 rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
					<div class="mb-6 flex items-center justify-between">
						<h3 class="text-lg font-bold text-slate-800">Filters</h3>
						<button
							onclick={clearFilters}
							class="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1 rounded-lg transition-colors"
						>
							Clear All
						</button>
					</div>

					<div class="space-y-6">
						<!-- ✅ Enhanced Category Filter -->
						<div>
							<label class="mb-3 block text-sm font-semibold text-slate-700">Category</label>
							<select
								bind:value={filterState.selectedCategory}
								class="w-full rounded-xl border-2 border-slate-200 px-3 py-2 transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
							>
								{#each categories as category}
									<option value={category}>{category}</option>
								{/each}
							</select>
						</div>

						<div >
							<label class="mb-3 block text-sm font-semibold text-slate-700">
								Price Range (ETH)
							</label>
							<div class="space-y-3">
								<div class="flex items-center space-x-2">
									<input
										type="number"
										bind:value={filterState.priceRange.min}
										min="0"
										step="0.01"
										placeholder="Min"
										class="w-full rounded-xl border-2 border-slate-200 px-3 py-2 transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
									/>
									<span class="text-slate-500 font-medium">to</span>
									<input
										type="number"
										bind:value={filterState.priceRange.max}
										min="0"
										step="0.01"
										placeholder="Max"
										class="w-full rounded-xl border-2 border-slate-200 px-3 py-2 transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
									/>
								</div>
								<div class="text-xs text-slate-500">
									Range: {stats().minPrice} - {stats().maxPrice} ETH
								</div>
							</div>
						</div>

						<!-- ✅ Enhanced Sort By -->
						<div>
							<label class="mb-3 block text-sm font-semibold text-slate-700">Sort By</label>
							<select
								bind:value={filterState.sortBy}
								class="w-full rounded-xl border-2 border-slate-200 px-3 py-2 transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
							>
								{#each sortOptions as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</div>

						<!-- ✅ Enhanced Stats -->
						<div class="border-t border-slate-200 pt-6">
							<h4 class="mb-3 text-sm font-semibold text-slate-700">Quick Stats</h4>
							<div class="space-y-3 text-sm">
								<div class="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
									<span class="text-slate-600">Total Properties:</span>
									<span class="font-bold text-slate-800">{stats().total}</span>
								</div>
								<div class="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
									<span class="text-emerald-600">Showing:</span>
									<span class="font-bold text-emerald-800">{stats().filtered}</span>
								</div>
								<div class="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
									<span class="text-blue-600">Categories:</span>
									<span class="font-bold text-blue-800">{stats().categories}</span>
								</div>
								<div class="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
									<span class="text-purple-600">Avg. Price:</span>
									<span class="font-bold text-purple-800">{stats().avgPrice} ETH</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Main Content Area with Enhanced Properties Display -->
			<div class="lg:col-span-3">
				{#if pageState.loading}
					<!-- ✅ Enhanced Loading State -->
					<div class="grid grid-cols-1 {filterState.viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : ''} gap-6">
						{#each Array(6) as _}
							<div class="animate-pulse overflow-hidden rounded-2xl bg-white shadow-lg border border-slate-200">
								<div class="h-48 bg-gradient-to-br from-slate-200 to-slate-300"></div>
								<div class="p-6 space-y-3">
									<div class="h-5 rounded-lg bg-slate-200"></div>
									<div class="h-4 w-3/4 rounded-lg bg-slate-200"></div>
									<div class="h-4 w-1/2 rounded-lg bg-slate-200"></div>
									<div class="flex justify-between pt-2">
										<div class="h-3 w-16 rounded bg-slate-200"></div>
										<div class="h-8 w-20 rounded-lg bg-slate-200"></div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else if pageState.error}
					<!-- Enhanced Error State stays the same -->
				{:else if filteredProperties().length === 0}
					<!-- ✅ Enhanced Empty State -->
					<div class="rounded-2xl bg-white p-12 text-center shadow-xl border border-slate-200">
						<div class="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
							<Home class="h-12 w-12 text-slate-400" />
						</div>
						<h3 class="mb-3 text-2xl font-bold text-slate-800">No Properties Found</h3>
						<p class="mb-8 text-slate-600 max-w-md mx-auto">
							We couldn't find any properties matching your criteria. Try adjusting your filters or search terms.
						</p>
						<div class="flex flex-col sm:flex-row gap-3 justify-center">
							<button
								onclick={clearFilters}
								class="rounded-xl bg-emerald-600 px-6 py-3 text-white font-medium transition-all hover:bg-emerald-700 hover:shadow-lg"
							>
								Clear All Filters
							</button>
							<button
								onclick={() => filterState.searchQuery = ''}
								class="rounded-xl border-2 border-slate-300 px-6 py-3 text-slate-700 font-medium transition-all hover:bg-slate-50"
							>
								Clear Search
							</button>
						</div>
					</div>
				{:else}
					<!-- ✅ Enhanced Properties Display -->
					{#if filterState.viewMode === 'grid'}
						<!-- Enhanced Grid View -->
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
							{#each filteredProperties() as property}
								<div class="group overflow-hidden rounded-2xl bg-white shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-emerald-200">
									
									<!-- ✅ Enhanced Property Image -->
									<div class="relative h-52 overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100">
										{#if property.image}
											<img
												src={property.image}
												alt={property.title}
												class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
											/>
											<!-- Fallback for broken images -->
											<div class="hidden h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
												<Home class="h-16 w-16 text-emerald-400" />
											</div>
										{:else}
											<div class="flex h-full w-full items-center justify-center">
												<Home class="h-16 w-16 text-emerald-400" />
											</div>
										{/if}

										<!-- ✅ Enhanced Price Badge -->
										<div class="absolute top-4 right-4 rounded-full bg-white/95 px-4 py-2 backdrop-blur-sm shadow-lg border border-white/20">
											<span class="font-bold text-emerald-600 text-lg">{property.price} ETH</span>
										</div>

										<!-- ✅ Category Badge -->
										<div class="absolute top-4 left-4 rounded-full bg-slate-900/80 px-3 py-1 backdrop-blur-sm">
											<span class="text-xs font-medium text-white">{property.category}</span>
										</div>
									</div>

									<!-- ✅ Enhanced Property Details -->
									<div class="p-6">
										<h3 class="mb-3 line-clamp-1 text-xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
											{property.title}
										</h3>

										<p class="mb-4 line-clamp-2 text-slate-600 leading-relaxed">
											{property.description || 'No description available'}
										</p>

										<div class="mb-6 space-y-2">
											<div class="flex items-center text-sm text-slate-500">
												<MapPin class="h-4 w-4 mr-2 text-slate-400" />
												<span class="truncate">{property.address || 'Location not specified'}</span>
											</div>
											<div class="flex items-center text-sm text-slate-500">
												<span class="text-xs bg-slate-100 px-2 py-1 rounded-full">
													Owner: {property.shortOwner}
												</span>
											</div>
										</div>

										<a
											href="/property/{property.id}"
											class="w-full inline-flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-white font-medium transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg transform hover:scale-105"
										>
											<span>View Details</span>
											<ChevronRight class="h-4 w-4" />
										</a>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<!-- Enhanced List View would go here -->

						<div class="overflow-hidden rounded-2xl bg-white shadow-lg">
							<div class="overflow-x-auto">
								<table class="min-w-full">
									<thead class="border-b border-slate-200 bg-slate-50">
										<tr>
											<th class="px-6 py-4 text-left text-sm font-semibold text-slate-600">
												Property
											</th>
											<th class="px-6 py-4 text-left text-sm font-semibold text-slate-600">
												Category
											</th>
											<th class="px-6 py-4 text-left text-sm font-semibold text-slate-600">
												Price
											</th>
											<th class="px-6 py-4 text-left text-sm font-semibold text-slate-600">
												Owner
											</th>
											<th class="px-6 py-4 text-left text-sm font-semibold text-slate-600">
												Actions
											</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-slate-200">
										{#each filteredProperties() as property}
											<tr class="transition-colors hover:bg-slate-50">
												<td class="px-6 py-4">
													<div class="flex items-center space-x-3">
														<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
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
												<td class="px-6 py-4 font-mono text-sm text-slate-600">{property.shortOwner}</td>
												<td class="px-6 py-4">
													<a
														href="/property/{property.id}"
														class="inline-flex items-center space-x-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white transition-colors hover:bg-emerald-700"
													>
														<span>View</span>
														<ChevronRight class="h-4 w-4" />
													</a>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>

					{/if}
				{/if}
			</div>
		</div>
	</div>
</main>

<!-- Mobile Filter Modal -->
{#if filterState.showFilters}
	<div class="fixed inset-0 z-50 lg:hidden">
		<div class="bg-opacity-75 fixed inset-0 bg-slate-500" onclick={toggleFilters}></div>
		<div class="fixed inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-6">
			<!-- Header -->
			<div class="mb-6 flex items-center justify-between">
				<h3 class="text-lg font-bold text-slate-800">Filters</h3>
				<button
					onclick={toggleFilters}
					class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
				>
					<X class="h-5 w-5" />
				</button>
			</div>

			<!-- Mobile Filter Content (same as desktop) -->
			<div class="space-y-6">
				<!-- Category Filter -->
				<div>
					<label class="mb-3 block text-sm font-semibold text-slate-700">Category</label>
					<select
						bind:value={filterState.selectedCategory}
						class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
					>
						{#each categories as category}
							<option value={category}>{category}</option>
						{/each}
					</select>
				</div>

				<!-- Price Range -->
				<div >
					<label for="priceRange" class="mb-3 block text-sm font-semibold text-slate-700"> Price Range (ETH) </label>
					<div class="flex items-center space-x-2 ">
						<input
							type="number"
							bind:value={filterState.priceRange.min}
							min="0"
							step="0.1"
							placeholder="Min"
							class=" rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
						/>
						<span class="text-slate-500">to</span>
						<input
							type="number"
							bind:value={filterState.priceRange.max}
							min="0"
							step="0.1"
							placeholder="Max"
							class=" rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
						/>
					</div>
				</div>

				<!-- Sort By -->
				<div>
					<label class="mb-3 block text-sm font-semibold text-slate-700">Sort By</label>
					<select
						bind:value={filterState.sortBy}
						class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
					>
						{#each sortOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<!-- Apply Filters Button -->
				<div class="flex space-x-3 pt-4">
					<button
						onclick={clearFilters}
						class="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
					>
						Clear All
					</button>
					<button
						onclick={toggleFilters}
						class="flex-1 rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700"
					>
						Apply Filters
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
