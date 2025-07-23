<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { PropertyService } from '$lib/services/propertyService.js';
	import { walletState, connectWallet } from '$lib/web3.svelte.js';
	import {
		MapPin,
		Tag,
		Home,
		Star,
		Share2,
		Edit,
		DollarSign,
		User,
		MessageSquare,
		ThumbsUp,
		AlertCircle,
		Loader2,
		ArrowLeft,
		ExternalLink,
		Shield
	} from '@lucide/svelte';
	import { propertyPageState } from './PropertyPage.svelte';

	// Review form state
	const reviewForm = $state({
		visible: false,
		rating: 5,
		comment: '',
		loading: false,
		error: null
	});

	// Buy property state
	const buyState = $state({
		loading: false,
		error: null,
		showConfirmation: false
	});

	// ✅ Svelte 5: $derived instead of $:
	const propertyId = $derived($page.params.id);
	const isOwner = $derived(
		propertyPageState.property &&
			walletState.isConnected &&
			propertyPageState.property.owner.toLowerCase() === walletState.address?.toLowerCase()
	);

	// ✅ Svelte 5: $effect instead of onMount
	$effect(() => {
		if (propertyId) {
			loadPropertyData();
		}
	});

	async function loadPropertyData() {
		try {
			propertyPageState.loading = true;
			propertyPageState.error = null;

			// Get property details
			const propertyResult = await PropertyService.getProperty(parseInt(propertyId));

			if (!propertyResult.success) {
				propertyPageState.error = propertyResult.error || 'Property not found';
				return;
			}

			propertyPageState.property = propertyResult.property;

			// Get property reviews
			try {
				const reviewsResult = await PropertyService.getPropertyReviews(parseInt(propertyId));
				propertyPageState.reviews = reviewsResult.reviews;
				propertyPageState.reviewStats = {
					averageRating: reviewsResult.averageRating,
					totalReviews: reviewsResult.totalReviews
				};
			} catch (reviewError) {
				console.warn('Failed to load reviews:', reviewError);
				propertyPageState.reviews = [];
				propertyPageState.reviewStats = { averageRating: 0, totalReviews: 0 };
			}

			// Check if user has already reviewed (if wallet connected)
			if (walletState.isConnected) {
				try {
					propertyPageState.userHasReviewed = await PropertyService.hasUserReviewedProperty(
						parseInt(propertyId),
						walletState.address || ''
					);
				} catch (err) {
					propertyPageState.userHasReviewed = false;
				}
			}
		} catch (err) {
			console.error('❌ Failed to load property:', err);
			propertyPageState.error = 'Failed to load property details';
		} finally {
			propertyPageState.loading = false;
		}
	}

	// Generate star rating display
	function getStarRating(rating: number) {
		return Array.from({ length: 5 }, (_, i) => i < rating);
	}

	// Handle buy property
	async function handleBuyProperty() {
		if (!walletState.isConnected) {
			await connectWallet();
			return;
		}

		if (isOwner) {
			buyState.error = 'You cannot buy your own property';
			return;
		}

		buyState.showConfirmation = true;
	}

	async function confirmBuyProperty() {
		try {
			buyState.loading = true;
			buyState.error = null;

			console.log('💰 Buying property:', {
				propertyId: propertyPageState.property?.productId,
				price: propertyPageState.property?.price
			});

			await PropertyService.buyProperty(
				propertyPageState.property?.productId,
				propertyPageState.property?.price
			);

			// Reload property data to show new owner
			await loadPropertyData();
			buyState.showConfirmation = false;

			console.log('✅ Property purchased successfully');
		} catch (error) {
			console.error('❌ Failed to buy property:', error);
			buyState.error = error.message || 'Failed to buy property';
		} finally {
			buyState.loading = false;
		}
	}

	// Handle add review
	async function handleAddReview() {
		if (!walletState.isConnected) {
			await connectWallet();
			return;
		}

		if (isOwner) {
			reviewForm.error = 'You cannot review your own property';
			return;
		}

		if (propertyPageState.userHasReviewed) {
			reviewForm.error = 'You have already reviewed this property';
			return;
		}

		try {
			reviewForm.loading = true;
			reviewForm.error = null;

			await PropertyService.addReview(
				propertyPageState.property?.productId || 0,
				reviewForm.rating,
				reviewForm.comment
			);

			// Reset form and reload reviews
			reviewForm.rating = 5;
			reviewForm.comment = '';
			reviewForm.loading = false;
			reviewForm.error = null;
			reviewForm.visible = false;

			await loadPropertyData();

			console.log('✅ Review added successfully');
		} catch (error) {
			console.error('❌ Failed to add review:', error);
			reviewForm.error = error.message || 'Failed to add review';
		} finally {
			reviewForm.loading = false;
		}
	}

	// Handle like review
	async function handleLikeReview(reviewIndex) {
		if (!walletState.isConnected) {
			await connectWallet();
			return;
		}

		try {
			console.log('👍 Liking review:', {
				propertyId: propertyPageState.property.productId,
				reviewIndex
			});

			await PropertyService.likeReview(propertyPageState.property.productId, reviewIndex);
			// Reload reviews to show updated like count
			await loadPropertyData();
		} catch (error) {
			console.error('❌ Failed to like review:', error);
		}
	}

	// Handle share property
	function handleShare() {
		if (navigator.share) {
			navigator.share({
				title: propertyPageState.property.title,
				text: propertyPageState.property.description,
				url: window.location.href
			});
		} else {
			// Fallback: copy to clipboard
			navigator.clipboard.writeText(window.location.href);
			alert('Property link copied to clipboard!');
		}
	}

	// Navigate functions - temporary alerts since routes may not exist yet
	function handleEdit() {
		alert(`Edit property ${propertyId} - Route not implemented yet`);
		// goto(`/property/${propertyId}/edit`);
	}

	function handleUpdatePrice() {
		alert(`Update price for property ${propertyId} - Route not implemented yet`);
		// goto(`/property/${propertyId}/update-price`);
	}
</script>

<svelte:head>
	<title
		>{propertyPageState.property ? propertyPageState.property.title : 'Property'} - PropChain</title
	>
	<meta
		name="description"
		content={propertyPageState.property
			? propertyPageState.property.description
			: 'View property details on PropChain'}
	/>
</svelte:head>

<main class="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-12">
	{#if propertyPageState.loading}
		<!-- Loading State -->
		<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div class="animate-pulse">
				<!-- Header skeleton -->
				<div class="mb-6 h-6 w-48 rounded bg-slate-200"></div>

				<!-- Content skeleton -->
				<div class="grid gap-6 lg:grid-cols-4">
					<!-- Image skeleton - smaller -->
					<div class="lg:col-span-1">
						<div class="h-64 rounded-xl bg-slate-200"></div>
					</div>
					<!-- Content skeleton -->
					<div class="space-y-4 lg:col-span-2">
						<div class="h-8 w-3/4 rounded bg-slate-200"></div>
						<div class="h-4 w-full rounded bg-slate-200"></div>
						<div class="h-4 w-2/3 rounded bg-slate-200"></div>
					</div>
					<!-- Sidebar skeleton -->
					<div class="lg:col-span-1">
						<div class="h-80 rounded-xl bg-slate-200"></div>
					</div>
				</div>
			</div>
		</div>
	{:else if propertyPageState.error}
		<!-- Error State -->
		<div class="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
			<AlertCircle class="mx-auto mb-4 h-16 w-16 text-red-500" />
			<h1 class="mb-2 text-2xl font-bold text-slate-800">Property Not Found</h1>
			<p class="mb-6 text-slate-600">{propertyPageState.error}</p>
			<button
				onclick={() => goto('/explore')}
				class="rounded-lg bg-emerald-600 px-6 py-3 text-white transition-colors hover:bg-emerald-700"
			>
				Back to Explore
			</button>
		</div>
	{:else if propertyPageState.property}
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<!-- Breadcrumb & Back Button -->
			<div class="mb-6 flex items-center justify-between">
				<nav class="flex items-center space-x-2 text-sm text-slate-600">
					<a href="/explore" class="transition-colors hover:text-emerald-600">Explore</a>
					<span>/</span>
					<span class="text-slate-800">{propertyPageState.property.title}</span>
				</nav>

				<button
					onclick={() => goto('/explore')}
					class="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600 transition-colors hover:bg-slate-50"
				>
					<ArrowLeft class="h-4 w-4" />
					<span class="hidden sm:inline">Back</span>
				</button>
			</div>

			<!-- Main Layout - 2 Column Grid -->
			<div class="grid gap-8 lg:grid-cols-2">
				<!-- Left Side - Property Image -->
				<div class="space-y-6">
					<div
						class="relative h-96 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 lg:h-[500px]"
					>
						{#if propertyPageState.property.image}
							<img
								src={propertyPageState.property.image}
								alt={propertyPageState.property.title}
								class="h-full w-full object-cover"
							/>
						{:else}
							<div class="flex h-full w-full items-center justify-center">
								<Home class="h-24 w-24 text-emerald-400" />
							</div>
						{/if}

						<!-- Price Badge -->
						<div
							class="absolute top-4 right-4 rounded-xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm"
						>
							<span class="text-2xl font-bold text-emerald-600"
								>{propertyPageState.property.price} ETH</span
							>
						</div>
					</div>
				</div>

				<!-- Right Side - All Details -->
				<div class="space-y-6">
					<!-- Property Header -->
					<div class="rounded-xl bg-white p-6 shadow-lg">
						<div class="mb-4 flex items-start justify-between">
							<div class="flex-1">
								<h1 class="mb-3 text-2xl font-bold text-slate-800 lg:text-3xl">
									{propertyPageState.property.title}
								</h1>
								<div class="mb-4 flex flex-wrap items-center gap-4 text-slate-600">
									<span class="flex items-center space-x-2">
										<MapPin class="h-5 w-5" />
										<span>{propertyPageState.property.address}</span>
									</span>
									<span class="flex items-center space-x-2">
										<Tag class="h-5 w-5" />
										<span>{propertyPageState.property.category}</span>
									</span>
								</div>
							</div>

							<!-- Share Button -->
							<button
								onclick={handleShare}
								class="rounded-lg p-3 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
								title="Share Property"
							>
								<Share2 class="h-5 w-5" />
							</button>
						</div>

						<!-- Property Stats -->
						<div class="flex justify-between gap-4 border-t border-slate-200 pt-4">
							<div class="text-center">
								<div
									class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100"
								>
									<Star class="h-6 w-6 text-emerald-600" />
								</div>
								<div class="text-xl font-bold text-slate-800">
									{propertyPageState.reviewStats.averageRating.toFixed(1)}
								</div>
								<div class="text-sm text-slate-600">Rating</div>
							</div>
							<div class="text-center">
								<div
									class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100"
								>
									<MessageSquare class="h-6 w-6 text-blue-600" />
								</div>
								<div class="text-xl font-bold text-slate-800">
									{propertyPageState.reviewStats.totalReviews}
								</div>
								<div class="text-sm text-slate-600">Reviews</div>
							</div>
							<div class="text-center">
								<div
									class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100"
								>
									<Home class="h-6 w-6 text-purple-600" />
								</div>
								<div class="text-xl font-bold text-slate-800">
									#{propertyPageState.property.productId}
								</div>
								<div class="text-sm text-slate-600">Property ID</div>
							</div>
							<div class="text-center">
								<div
									class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100"
								>
									<Shield class="h-6 w-6 text-orange-600" />
								</div>
								<div class="text-xl font-bold text-slate-800">✓</div>
								<div class="text-sm text-slate-600">Verified</div>
							</div>
						</div>
					</div>
					<!-- Owner & Purchase Section -->
					<div class="rounded-xl bg-white p-6 shadow-lg">
						<div class="mb-6 flex items-center justify-between">
							<h3 class="text-lg font-semibold text-slate-800">Property Owner</h3>
							<a
								href="https://sepolia.etherscan.io/address/{propertyPageState.property.owner}"
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center space-x-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
							>
								<ExternalLink class="h-4 w-4" />
								<span>View on Etherscan</span>
							</a>
						</div>

						<div class="mb-6 flex items-center space-x-4">
							<div class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
								<User class="h-6 w-6 text-emerald-600" />
							</div>
							<div>
								<p class="font-medium text-slate-800">Owner</p>
								<p class="font-mono text-sm text-slate-500">
									{propertyPageState.property.shortOwner}
								</p>
							</div>
						</div>

						<!-- Property Details -->
						<div class="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
							<div class="text-center">
								<p class="text-sm text-slate-600">Property ID</p>
								<p class="font-semibold text-slate-800">#{propertyPageState.property.productId}</p>
							</div>
							<div class="text-center">
								<p class="text-sm text-slate-600">Category</p>
								<p class="font-semibold text-slate-800">{propertyPageState.property.category}</p>
							</div>
							<div class="text-center">
								<p class="text-sm text-slate-600">Network</p>
								<p class="font-semibold text-slate-800">Sepolia</p>
							</div>
							<div class="text-center">
								<p class="text-sm text-slate-600">Status</p>
								<span
									class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
								>
									Active
								</span>
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="space-y-3">
							{#if isOwner}
								<!-- Owner Actions -->
							<!-- 	<button
									onclick={handleEdit}
									class="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-4 font-medium text-white transition-colors hover:bg-blue-700"
								>
									<Edit class="h-5 w-5" />
									<span>Edit Property</span>
								</button>
								<button
									onclick={handleUpdatePrice}
									class="flex w-full items-center justify-center space-x-2 rounded-lg bg-purple-600 px-6 py-4 font-medium text-white transition-colors hover:bg-purple-700"
								>
									<DollarSign class="h-5 w-5" />
									<span>Update Price</span>
								</button> -->
							{:else}
								<!-- Buy Button -->
								<button
									onclick={handleBuyProperty}
									disabled={buyState.loading}
									class="flex w-full items-center justify-center space-x-2 rounded-lg bg-emerald-600 px-6 py-4 text-lg font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{#if buyState.loading}
										<Loader2 class="h-5 w-5 animate-spin" />
										<span>Processing Purchase...</span>
									{:else}
										<DollarSign class="h-5 w-5" />
										<span>Buy for {propertyPageState.property.price} ETH</span>
									{/if}
								</button>
							{/if}
						</div>

						{#if buyState.error}
							<div class="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
								<p class="text-sm text-red-700">{buyState.error}</p>
							</div>
						{/if}
					</div>
					<!-- Description -->
					<div class="rounded-xl bg-white p-6 shadow-lg">
						<h3 class="mb-3 text-lg font-semibold text-slate-800">Description</h3>
						<p class="leading-relaxed text-slate-600">
							{propertyPageState.property.description ||
								'No description provided for this property.'}
						</p>
					</div>

					<!-- Reviews Section -->
					<div class="rounded-xl bg-white p-6 shadow-lg">
						<div class="mb-6 flex items-center justify-between">
							<h2 class="text-xl font-bold text-slate-800">
								Reviews ({propertyPageState.reviewStats.totalReviews})
							</h2>

							<!-- Add Review Button -->
							{#if walletState.isConnected && !isOwner && !propertyPageState.userHasReviewed}
								<button
									onclick={() => (reviewForm.visible = !reviewForm.visible)}
									class="flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
								>
									<Star class="h-4 w-4" />
									<span>Add Review</span>
								</button>
							{:else if !walletState.isConnected}
								<button
									onclick={connectWallet}
									class="flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
								>
									<Star class="h-4 w-4" />
									<span>Connect to Review</span>
								</button>
							{:else if propertyPageState.userHasReviewed}
								<span class="text-sm font-medium text-emerald-600"
									>✓ You've reviewed this property</span
								>
							{:else if isOwner}
								<span class="text-sm text-slate-500">You own this property</span>
							{/if}
						</div>

						<!-- Add Review Form -->
						{#if reviewForm.visible}
							<div class="mb-6 rounded-lg bg-slate-50 p-4">
								<h3 class="mb-4 text-lg font-semibold text-slate-800">Add Your Review</h3>

								<!-- Star Rating -->
								<div class="mb-4">
									<label class="mb-2 block text-sm font-medium text-slate-700">Rating</label>
									<div class="flex items-center space-x-1">
										{#each Array(5) as _, i}
											<button
												onclick={() => (reviewForm.rating = i + 1)}
												class="p-1 transition-colors"
											>
												<Star
													class="h-6 w-6 {i < reviewForm.rating
														? 'fill-current text-yellow-400'
														: 'text-slate-300'}"
												/>
											</button>
										{/each}
									</div>
								</div>

								<!-- Comment -->
								<div class="mb-4">
									<label class="mb-2 block text-sm font-medium text-slate-700">Comment</label>
									<textarea
										bind:value={reviewForm.comment}
										placeholder="Share your experience with this property..."
										rows="3"
										class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
									></textarea>
								</div>

								{#if reviewForm.error}
									<div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
										<p class="text-sm text-red-700">{reviewForm.error}</p>
									</div>
								{/if}

								<!-- Form Actions -->
								<div class="flex space-x-3">
									<button
										onclick={() => (reviewForm.visible = false)}
										class="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-50"
									>
										Cancel
									</button>
									<button
										onclick={handleAddReview}
										class="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
									>
										{#if reviewForm.loading}
											<Loader2 class="h-4 w-4 animate-spin" />
											<span>Submitting...</span>
										{:else}
											<span>Submit Review</span>
										{/if}
									</button>
								</div>
							</div>
						{/if}

						<!-- Reviews List -->
						{#if propertyPageState.reviews.length > 0}
							<div class="max-h-80 space-y-4 overflow-y-auto">
								{#each propertyPageState.reviews as review, index}
									<div class="rounded-lg border border-slate-200 p-4">
										<div class="mb-3 flex items-start justify-between">
											<div class="flex items-center space-x-3">
												<div
													class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100"
												>
													<User class="h-5 w-5 text-emerald-600" />
												</div>
												<div>
													<p class="font-medium text-slate-800">{review.shortReviewer}</p>
													<div class="flex items-center space-x-1">
														{#each getStarRating(review.rating) as filled}
															<Star
																class="h-4 w-4 {filled
																	? 'fill-current text-yellow-400'
																	: 'text-slate-300'}"
															/>
														{/each}
													</div>
												</div>
											</div>

											<!-- Like Button -->
											{#if walletState.isConnected && review.reviewer.toLowerCase() !== walletState.address?.toLowerCase()}
												<button
													onclick={() => handleLikeReview(index)}
													class="flex items-center space-x-1 rounded-lg px-3 py-1 text-slate-500 transition-all hover:bg-emerald-50 hover:text-emerald-600"
												>
													<ThumbsUp class="h-4 w-4" />
													<span class="text-sm">{review.likes}</span>
												</button>
											{:else}
												<div class="flex items-center space-x-1 text-slate-500">
													<ThumbsUp class="h-4 w-4" />
													<span class="text-sm">{review.likes}</span>
												</div>
											{/if}
										</div>

										<p class="text-slate-600">{review.comment}</p>
									</div>
								{/each}
							</div>
						{:else}
							<div class="py-8 text-center">
								<MessageSquare class="mx-auto mb-3 h-12 w-12 text-slate-300" />
								<p class="text-slate-500">No reviews yet. Be the first to review!</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</main>

<!-- Buy Confirmation Modal -->
{#if buyState.showConfirmation}
	<div class="fixed inset-0 z-50 overflow-y-auto">
		<div class="flex min-h-screen items-center justify-center p-4">
			<div
				class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
				onclick={() => (buyState.showConfirmation = false)}
			></div>

			<div class="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
				<h3 class="mb-4 text-lg font-bold text-slate-800">Confirm Purchase</h3>

				<div class="mb-6">
					<p class="mb-4 text-slate-600">
						Are you sure you want to buy this property for <strong
							>{propertyPageState.property?.price} ETH</strong
						>?
					</p>
					<div class="rounded-lg bg-slate-50 p-4 text-sm">
						<div class="mb-2 flex justify-between">
							<span>Property:</span>
							<span class="font-medium">{propertyPageState.property?.title}</span>
						</div>
						<div class="mb-2 flex justify-between">
							<span>Price:</span>
							<span class="font-medium">{propertyPageState.property?.price} ETH</span>
						</div>
						<div class="flex justify-between">
							<span>Network:</span>
							<span class="font-medium">Sepolia Testnet</span>
						</div>
					</div>
				</div>

				<div class="flex space-x-3">
					<button
						onclick={() => (buyState.showConfirmation = false)}
						class="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-50"
					>
						Cancel
					</button>
					<button
						onclick={confirmBuyProperty}
						disabled={buyState.loading}
						class="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if buyState.loading}
							<Loader2 class="h-4 w-4 animate-spin" />
							<span>Buying...</span>
						{:else}
							<span>Confirm Purchase</span>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
