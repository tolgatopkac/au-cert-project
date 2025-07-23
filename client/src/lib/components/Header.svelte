<script>
	import {
		walletState,
		connectWallet,
		disconnectWallet,
		isWalletReady,
		shortAddress
	} from '$lib/web3.svelte.js';
	import {
		Home,
		Search,
		Plus,
		Building,
		Star,
		Activity,
		Menu,
		X,
		Link,
		LogOut,
		User,
		ChevronDown
	} from '@lucide/svelte';

	let mobileMenuOpen = $state(false);
	let myAccountDropdownOpen = $state(false);

	// Navigation items - shown to everyone
	const guestNavItems = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/explore', label: 'Explore', icon: Search }
	];

	// Account-specific items shown in dropdown when wallet is connected
	const myAccountItems = [
		{ href: '/create', label: 'List Property', icon: Plus },
		{ href: '/my-properties', label: 'My Properties', icon: Building },
	/* 	{ href: '/my-reviews', label: 'My Reviews', icon: Star },
		{ href: '/activity', label: 'Activity', icon: Activity } */
	];

	let navItems = $state(guestNavItems);

	$effect(() => {
		navItems = guestNavItems;
	});

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
</script>

<header class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo Section -->
			<div class="flex items-center space-x-3">
				<a href="/" class="group flex items-center space-x-2">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg transition-shadow group-hover:shadow-xl"
					>
						<span class="text-lg font-bold text-white">P</span>
					</div>
					<div class="flex flex-col">
						<h1
							class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-bold text-transparent"
						>
							PropChain
						</h1>
						<span class="-mt-1 text-xs text-slate-500">Decentralized Real Estate</span>
					</div>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<nav class="hidden items-center space-x-1 lg:flex">
				{#each navItems as item}
					<a
						href={item.href}
						class="group flex items-center space-x-2 rounded-lg px-4 py-2 text-slate-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600"
					>
						<svelte:component
							this={item.icon}
							class="h-5 w-5 transition-transform group-hover:scale-110"
						/>
						<span class="font-medium">{item.label}</span>
					</a>
				{/each}

				<!-- My Account Dropdown (only when wallet connected) -->
				{#if walletState.isConnected}
					<div class="relative">
						<button
							onmouseenter={() => (myAccountDropdownOpen = true)}
							onmouseleave={() => (myAccountDropdownOpen = false)}
							class="group flex items-center space-x-2 rounded-lg px-4 py-2 text-slate-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600"
						>
							<User class="h-5 w-5 transition-transform group-hover:scale-110" />
							<span class="font-medium">My Account</span>
							<ChevronDown
								class="h-4 w-4 transition-transform {myAccountDropdownOpen ? 'rotate-180' : ''}"
							/>
						</button>

						<!-- Dropdown Menu -->
						{#if myAccountDropdownOpen}
							<button
								class="absolute top-8 right-0 mt-1 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg"
								onmouseenter={() => (myAccountDropdownOpen = true)}
								onmouseleave={() => (myAccountDropdownOpen = false)}
							>
								{#each myAccountItems as item}
									<a
										href={item.href}
										class="flex items-center space-x-3 px-4 py-3 text-slate-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600"
									>
										<svelte:component this={item.icon} class="h-5 w-5" />
										<span class="font-medium">{item.label}</span>
									</a>
								{/each}
							</button>
						{/if}
					</div>
				{/if}
			</nav>

			<!-- Wallet & Mobile Menu Section -->
			<div class="flex items-center space-x-3">
				<!-- Wallet Section -->
				{#if walletState.isConnected}
					<div class="flex items-center space-x-3">
						<!-- Network Status -->
						<div class="flex items-center space-x-2 rounded-lg bg-slate-50 px-3 py-1.5">
							{#if isWalletReady()}
								<div class="flex items-center space-x-1.5">
									<div class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
									<span class="text-sm font-medium text-emerald-600">Sepolia</span>
								</div>
							{:else}
								<div class="flex items-center space-x-1.5">
									<div class="h-2 w-2 rounded-full bg-red-500"></div>
									<span class="text-sm font-medium text-red-600">Wrong Network</span>
								</div>
							{/if}
						</div>

						<!-- Address Display -->
						<div
							class="flex items-center space-x-2 rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1.5"
						>
							<div class="h-2 w-2 rounded-full bg-emerald-500"></div>
							<span class="font-mono text-sm font-medium text-slate-700">
								{shortAddress()}
							</span>
						</div>

						<!-- Disconnect Button -->
						<button
							onclick={disconnectWallet}
							class="rounded-lg p-2 text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
							title="Disconnect Wallet"
						>
							<LogOut class="h-5 w-5" />
						</button>
					</div>
				{:else}
					<!-- Connect Wallet Button -->
					<button
						onclick={connectWallet}
						disabled={walletState.loading}
						class="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 font-medium text-white shadow-lg transition-all duration-200 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if walletState.loading}
							<div
								class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
							<span>Connecting...</span>
						{:else}
							<Link class="h-5 w-5" />
							<span>Connect Wallet</span>
						{/if}
					</button>
				{/if}

				<!-- Mobile Menu Button -->
				<button
					onclick={toggleMobileMenu}
					class="rounded-lg p-2 text-slate-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600 lg:hidden"
					aria-label="Toggle mobile menu"
				>
					{#if mobileMenuOpen}
						<X class="h-6 w-6" />
					{:else}
						<Menu class="h-6 w-6" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile Navigation Menu -->
		{#if mobileMenuOpen}
			<div class="border-t border-slate-200 bg-white lg:hidden">
				<div class="space-y-1 px-2 pt-2 pb-3">
					{#each navItems as item}
						<a
							href={item.href}
							class="flex items-center space-x-3 rounded-lg px-3 py-3 text-slate-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600"
							onclick={() => (mobileMenuOpen = false)}
						>
							<svelte:component this={item.icon} class="h-5 w-5" />
							<span class="font-medium">{item.label}</span>
						</a>
					{/each}

					<!-- Mobile Account Section (when wallet connected) -->
					{#if walletState.isConnected}
						<div class="mt-3 border-t border-slate-200 pt-3">
							<div class="px-3 py-2">
								<span class="text-sm font-semibold tracking-wider text-slate-500 uppercase"
									>My Account</span
								>
							</div>
							{#each myAccountItems as item}
								<a
									href={item.href}
									class="flex items-center space-x-3 rounded-lg px-3 py-3 text-slate-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600"
									onclick={() => (mobileMenuOpen = false)}
								>
									<svelte:component this={item.icon} class="h-5 w-5" />
									<span class="font-medium">{item.label}</span>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</header>
