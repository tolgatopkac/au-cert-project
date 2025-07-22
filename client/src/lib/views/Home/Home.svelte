<script lang="ts">
	import {
		Home,
		Search,
		Plus,
		Users,
		DollarSign,
		TrendingUp,
		Shield,
		Eye,
		Star,
		MapPin,
		Tag,
		ArrowRight,
		Link,
		Briefcase,
		Lock,
		ChartColumnIncreasing,
		CheckCircle,
		Clock,
		Rocket,
		FileText,
		Building,
		ChevronRight
	} from '@lucide/svelte';
	import { homePageState } from './HomeState.svelte';
	import { formatEthDisplay } from '$lib/utils/formatters';


	const {
		handleConnectWallet
	}: {
		handleConnectWallet: () => void;
	} = $props();
</script>

<main class="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
	<!-- 1. HERO SECTION -->
	<section
		class="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900"
	>
		<div class="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
			<div class="text-center">
				<!-- Main Headlines -->
				<h1 class="mb-6 text-4xl font-bold text-white lg:text-6xl">
					<span class="block">Blockchain-Powered</span>
					<span
						class="block bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent"
					>
						Real Estate Revolution
					</span>
				</h1>

				<p class="mx-auto mb-8 max-w-3xl text-xl text-emerald-100 lg:text-2xl">
					Secure, transparent, and decentralized property transactions. Peer-to-peer deals with
					authentic reviews.
				</p>

				<!-- CTA Buttons -->
				<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<a
						href="/explore"
						class="inline-flex items-center space-x-2 rounded-xl bg-white px-8 py-4 font-semibold text-emerald-800 shadow-lg transition-all duration-200 hover:bg-emerald-50 hover:shadow-xl"
					>
						<Search class="h-5 w-5" />
						<span>Explore Properties</span>
					</a>

					<button
						onclick={handleConnectWallet}
						class="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
					>
						<Plus class="h-5 w-5" />
						<span>List Property</span>
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- 2. STATS SECTION -->
	<section class="bg-white py-16">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-2 gap-8 lg:grid-cols-4">
				<!-- Total Properties -->
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600"
					>
						<Home class="h-8 w-8 text-white" />
					</div>
					<div class="mb-2 text-3xl font-bold text-slate-800">
						{homePageState.stats.totalProperties}
					</div>
					<div class="text-slate-600">Total Properties</div>
				</div>

				<!-- Total Volume -->
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600"
					>
						<DollarSign class="h-8 w-8 text-white" />
					</div>
					<div class="mb-2 text-3xl font-bold text-slate-800">
						{formatEthDisplay(homePageState.stats.totalVolume)} ETH
					</div>
					<div class="text-slate-600">Total Volume</div>
				</div>

				<!-- Active Users -->
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600"
					>
						<Users class="h-8 w-8 text-white" />
					</div>
					<div class="mb-2 text-3xl font-bold text-slate-800">
						{homePageState.stats.activeUsers}
					</div>
					<div class="text-slate-600">Active Users</div>
				</div>

				<!-- Recent Activities -->
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600"
					>
						<TrendingUp class="h-8 w-8 text-white" />
					</div>
					<div class="mb-2 text-3xl font-bold text-slate-800">
						<!-- TODO: Add recent activities -->
						{homePageState.recentActivities.length}
					</div>
					<div class="text-slate-600">Recent Activities</div>
				</div>
			</div>
		</div>
	</section>

	<!-- 3. FEATURED PROPERTIES -->
	<section class="bg-slate-50 py-16">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<!-- Section Header -->
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold text-slate-800 lg:text-4xl">Featured Properties</h2>
				<p class="mx-auto max-w-2xl text-lg text-slate-600">
					Discover the most popular and recently listed properties on our platform
				</p>
			</div>

			<!-- Properties Grid -->
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each homePageState.properties as property}
					<div
						class="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl"
					>
						<!-- Property Image -->
						<div
							class="relative h-48 overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100"
						>
							<img
								src={property.image}
								alt={property.title}
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
							/>

							<!-- Price Badge -->
							<div
								class="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm"
							>
								<span class="font-bold text-emerald-600">{property.price} ETH</span>
							</div>
						</div>

						<!-- Property Details -->
						<div class="p-6">
							<h3 class="mb-2 line-clamp-1 text-xl font-bold text-slate-800">
								{property.title}
							</h3>

							<p class="mb-4 line-clamp-2 text-slate-600">
								{property.description}
							</p>

							<div class="mb-4 flex items-center justify-between text-sm text-slate-500">
								<span class="flex items-center space-x-1">
									<MapPin class="h-4 w-4" />
									<span>{property.address}</span>
								</span>
								<span class="flex items-center space-x-1">
									<Tag class="h-4 w-4" />
									<span>{property.category}</span>
								</span>
							</div>

							<div class="flex items-center justify-between">
								<span class="text-sm text-slate-500">
									Owner: {property.shortOwner}
								</span>
								<a
									href="/property/{property.id}"
									class="inline-flex items-center space-x-1 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
								>
									<span>View Details</span>
									<ChevronRight class="h-4 w-4" />
								</a>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- View All Button -->
			<div class="mt-12 text-center">
				<a
					href="/explore"
					class="inline-flex items-center space-x-2 rounded-xl bg-emerald-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-emerald-700 hover:shadow-xl"
				>
					<span>View All Properties</span>
					<ArrowRight class="h-5 w-5" />
				</a>
			</div>
		</div>
	</section>

	<!-- 4. HOW IT WORKS -->
	<section class="bg-white py-16">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<!-- Section Header -->
			<div class="mb-16 text-center">
				<h2 class="mb-4 text-3xl font-bold text-slate-800 lg:text-4xl">How It Works</h2>
				<p class="mx-auto max-w-2xl text-lg text-slate-600">
					Complete your real estate transactions in 3 simple steps with PropChain
				</p>
			</div>

			<!-- Steps -->
			<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
				<!-- Step 1 -->
				<div class="text-center">
					<div class="relative">
						<div
							class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600"
						>
							<Link class="h-10 w-10 text-white" />
						</div>
						<div
							class="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white"
						>
							1
						</div>
					</div>
					<h3 class="mb-4 text-xl font-bold text-slate-800">Connect Your Wallet</h3>
					<p class="text-slate-600">
						Connect your MetaMask wallet and switch to the Sepolia test network to get started
					</p>
				</div>

				<!-- Step 2 -->
				<div class="text-center">
					<div class="relative">
						<div
							class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600"
						>
							<Search class="h-10 w-10 text-white" />
						</div>
						<div
							class="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white"
						>
							2
						</div>
					</div>
					<h3 class="mb-4 text-xl font-bold text-slate-800">Explore Properties</h3>
					<p class="text-slate-600">
						Browse through listed properties, read reviews, and find your perfect property
					</p>
				</div>

				<!-- Step 3 -->
				<div class="text-center">
					<div class="relative">
						<div
							class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600"
						>
							<Briefcase class="h-10 w-10 text-white" />
						</div>
						<div
							class="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white"
						>
							3
						</div>
					</div>
					<h3 class="mb-4 text-xl font-bold text-slate-800">Buy/Sell/Review</h3>
					<p class="text-slate-600">
						Execute secure blockchain transactions to buy, sell properties or share your experiences
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- 5. FEATURES -->
	<section class="bg-gradient-to-br from-emerald-50 to-teal-50 py-16">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<!-- Section Header -->
			<div class="mb-16 text-center">
				<h2 class="mb-4 text-3xl font-bold text-slate-800 lg:text-4xl">Why Choose PropChain?</h2>
				<p class="mx-auto max-w-2xl text-lg text-slate-600">
					Experience the advantages of blockchain technology in real estate transactions
				</p>
			</div>

			<!-- Features Grid -->
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
				<div class="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
						<Shield class="h-6 w-6 text-emerald-600" />
					</div>
					<h3 class="mb-2 text-lg font-bold text-slate-800">Secure Transactions</h3>
					<p class="text-slate-600">
						100% secure and immutable records powered by blockchain technology
					</p>
				</div>

				<div class="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
						<Users class="h-6 w-6 text-emerald-600" />
					</div>
					<h3 class="mb-2 text-lg font-bold text-slate-800">Peer-to-Peer</h3>
					<p class="text-slate-600">
						Direct buyer-seller transactions without intermediary commissions
					</p>
				</div>

				<div class="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
						<ChartColumnIncreasing class="h-6 w-6 text-emerald-600" />
					</div>
					<h3 class="mb-2 text-lg font-bold text-slate-800">Transparent Pricing</h3>
					<p class="text-slate-600">
						All prices and transaction history openly available on blockchain
					</p>
				</div>

				<div class="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
						<CheckCircle class="h-6 w-6 text-emerald-600" />
					</div>
					<h3 class="mb-2 text-lg font-bold text-slate-800">Authentic Reviews</h3>
					<p class="text-slate-600">Verified user reviews that cannot be faked or manipulated</p>
				</div>
			</div>
		</div>
	</section>

	<!-- 6. RECENT ACTIVITIES -->
	<section class="bg-white py-16">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<!-- Section Header -->
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold text-slate-800 lg:text-4xl">Recent Platform Activity</h2>
				<p class="text-lg text-slate-600">
					Stay updated with the latest transactions and activities on PropChain
				</p>
			</div>

			<!-- Activities List -->
			<div class="space-y-4">
				{#each homePageState.recentActivities as activity}
					<div class="flex items-center justify-between rounded-xl bg-slate-50 p-6">
						<div class="flex items-center space-x-4">
							<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
								<FileText class="h-6 w-6 text-emerald-600" />
							</div>
							<div>
								<h3 class="font-semibold text-slate-800">
									{activity.title}
								</h3>
								<p class="text-sm text-slate-600">
									{activity.description}
								</p>
							</div>
						</div>
						<div class="flex items-center space-x-2 text-sm text-slate-500">
							<Clock class="h-4 w-4" />
							<span>{activity.timestamp}</span>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-8 text-center">
				<a
					href="/activity"
					class="inline-flex items-center space-x-2 px-6 py-3 font-medium text-emerald-600 transition-colors hover:text-emerald-700"
				>
					<span>View All Activities</span>
					<ArrowRight class="h-4 w-4" />
				</a>
			</div>
		</div>
	</section>

	<!-- 7. CTA SECTION -->
	<section class="bg-gradient-to-br from-emerald-900 to-teal-900 py-16">
		<div class="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
			<h2 class="mb-4 text-3xl font-bold text-white lg:text-4xl">
				Join the Blockchain Real Estate Revolution
			</h2>
			<p class="mb-8 text-xl text-emerald-100">
				The future of secure, transparent, and fair real estate transactions starts here
			</p>

			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<button
					onclick={handleConnectWallet}
					class="inline-flex items-center space-x-2 rounded-xl bg-white px-8 py-4 font-semibold text-emerald-800 shadow-lg transition-all duration-200 hover:bg-emerald-50 hover:shadow-xl"
				>
					<Rocket class="h-5 w-5" />
					<span>Get Started Now</span>
				</button>

				<a
					href="/explore"
					class="inline-flex items-center space-x-2 rounded-xl border-2 border-white px-8 py-4 font-semibold text-white transition-all duration-200 hover:bg-white hover:text-emerald-800"
				>
					<Eye class="h-5 w-5" />
					<span>Explore Properties</span>
				</a>
			</div>
		</div>
	</section>
</main>
