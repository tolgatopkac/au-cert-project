<script>
	import Wallet from '$lib/components/Wallet.svelte';
	import { PropertyService } from '$lib/services/propertyService';
	import { propertyState } from '$lib/stores/propertyStore.svelte';
	import {
		checkWalletConnection,
		connectWallet,
		createProperty,
		disconnectWallet,
		getAllProperties,
		shortAddress,
		walletState
	} from '$lib/web3.svelte';
	import { onMount } from 'svelte';

	onMount(async () => {
		console.log('🚀 Page loaded, checking wallet...');
		await checkWalletConnection();
	});

	const formData = $state({
		propertyTitle: '',
		description: '',
		category: 'Apartment',
		price: '',
		image: '',
		propertyAddress: ''
	});

	const handleSubmit = async (e) => {
		e.preventDefault();

		console.log('🚀 Form submit:', formData);

		/* 	if (!isFormValid() || !isWalletReady()) {
			console.log('❌ Form validation failed');
			return;
		} */

		try {
			await createProperty(formData);

			// Success - wait then reset form
			/* 	setTimeout(() => {
				resetForm();
				resetCreateState();
			}, 3000); */
		} catch (error) {
			console.error('Create property failed:', error);
		}
	};

	/* --- get all properties --- */

	let refreshInterval;
	const startAutoRefresh = async () => {
		// İlk yükleme
		const result = await getAllProperties();
		console.log('🔄 Refreshed:', result);
		console.log('📊 Properties loaded:', result.length, 'items');

		// Her 30 saniyede bir güncelle
		refreshInterval = setInterval(async () => {
			if (!propertyState.loading) {
				const refreshResult = await getAllProperties();
				console.log('🔄 Refreshed:', refreshResult);
				console.log('🔄 Refreshed:', refreshResult.length, 'properties');
			}
		}, 30000);
	};

	const stopAutoRefresh = () => {
		if (refreshInterval) {
			clearInterval(refreshInterval);
			refreshInterval = null;
		}
	};

	$effect(() => {
		if (walletState.isConnected) {
			startAutoRefresh();
		} else {
			stopAutoRefresh();
		}
	});

	onMount(async () => {
		const events = await PropertyService.getContractEvents('PropertyListed');
		console.log('🔄 Events:', events);
	});
</script>

<svelte:head>
	<title>PropChain</title>
</svelte:head>

{#if walletState.isConnected}
	<!-- 	<div class="flex flex-col items-center gap-2">
		<input type="text" placeholder="Property Title" bind:value={formData.propertyTitle}>
		<input type="text" placeholder="Property Description" bind:value={formData.description}>
		<input type="text" placeholder="Property Price" bind:value={formData.price}>
		<input type="text" placeholder="Property Image" bind:value={formData.image}>
		<input type="text" placeholder="Property Address" bind:value={formData.propertyAddress}>
		<button onclick={handleSubmit}>Create Property</button>
	</div> -->
{:else}
	<main class="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
		<!-- 1. HERO SECTION -->
		<section
			class="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900"
		>
			<!-- Background Pattern -->
			<div class="absolute inset-0 opacity-10">
				<!-- 	<div class="absolute inset-0" style="background-image: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.1"><rect width="11" height="11" rx="2"/><rect x="20" y="20" width="11" height="11" rx="2"/><rect x="40" y="40" width="11" height="11" rx="2"/></g></g></svg>')"></div> -->
			</div>

			<div class="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
				<div class="text-center">
					<!-- Main Headlines -->
					<h1 class="mb-6 text-4xl font-bold text-white lg:text-6xl">
						<span class="block">Blockchain Üzerinde</span>
						<span
							class="block bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent"
						>
							Gayrimenkul Devri
						</span>
					</h1>

					<p class="mx-auto mb-8 max-w-3xl text-xl text-emerald-100 lg:text-2xl">
						Güvenli, şeffaf ve merkezi olmayan emlak alım-satımı. Peer-to-peer işlemler, gerçek
						değerlendirmeler.
					</p>

					<!-- CTA Buttons -->
					<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<a
							href="/explore"
							class="inline-flex items-center space-x-2 rounded-xl bg-white px-8 py-4 font-semibold text-emerald-800 shadow-lg transition-all duration-200 hover:bg-emerald-50 hover:shadow-xl"
						>
							<span>🔍</span>
							<span>Mülkleri Keşfet</span>
						</a>

						<button
							class="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
						>
							<span>➕</span>
							<span>Mülk İlanı Ver</span>
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
							<span class="text-2xl text-white">🏠</span>
						</div>
						<div class="mb-2 text-3xl font-bold text-slate-800">
							<!-- 	{loading ? '...' : stats.totalProperties} -->
						</div>
						<div class="text-slate-600">Toplam Mülk</div>
					</div>

					<!-- Total Volume -->
					<div class="text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600"
						>
							<span class="text-2xl text-white">💰</span>
						</div>
						<div class="mb-2 text-3xl font-bold text-slate-800">
							<!-- {loading ? '...' : stats.totalVolume.toFixed(1)}  -->ETH
						</div>
						<div class="text-slate-600">Toplam Hacim</div>
					</div>

					<!-- Highest Rated -->
					<div class="text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600"
						>
							<span class="text-2xl text-white">⭐</span>
						</div>
						<div class="mb-2 text-3xl font-bold text-slate-800">
							<!-- 	{loading ? '...' : stats.highestRated ? '⭐' : '-'} -->
						</div>
						<div class="text-slate-600">En Yüksek Puanlı</div>
					</div>

					<!-- Recent Activities -->
					<div class="text-center">
						<div
							class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600"
						>
							<span class="text-2xl text-white">📊</span>
						</div>
						<div class="mb-2 text-3xl font-bold text-slate-800">
							<!-- 	{loading ? '...' : stats.recentActivities.length} -->
						</div>
						<div class="text-slate-600">Son Aktivite</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 3. FEATURED PROPERTIES -->
		<section class="bg-slate-50 py-16">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<!-- Section Header -->
				<div class="mb-12 text-center">
					<h2 class="mb-4 text-3xl font-bold text-slate-800 lg:text-4xl">Öne Çıkan Mülkler</h2>
					<p class="mx-auto max-w-2xl text-lg text-slate-600">
						Platformumuzda listelenen en güncel ve popüler gayrimenkul ilanları
					</p>
				</div>

				<!-- Properties Grid -->
				{#if true}
					<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						{#each Array(6) as _}
							<div class="animate-pulse overflow-hidden rounded-2xl bg-white shadow-lg">
								<div class="h-48 bg-slate-200"></div>
								<div class="p-6">
									<div class="mb-4 h-4 rounded bg-slate-200"></div>
									<div class="mb-2 h-4 w-3/4 rounded bg-slate-200"></div>
									<div class="h-4 w-1/2 rounded bg-slate-200"></div>
								</div>
							</div>
						{/each}
					</div>
				{:else if properties.length > 0}
					<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						{#each properties as property}
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
											<span class="text-6xl text-emerald-400">🏠</span>
										</div>
									{/if}

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
										{property.description || 'Açıklama bulunmuyor'}
									</p>

									<div class="mb-4 flex items-center justify-between text-sm text-slate-500">
										<span class="flex items-center space-x-1">
											<span>📍</span>
											<span>{property.address || 'Konum belirtilmemiş'}</span>
										</span>
										<span class="flex items-center space-x-1">
											<span>🏷️</span>
											<span>{property.category}</span>
										</span>
									</div>

									<div class="flex items-center justify-between">
										<span class="text-sm text-slate-500">
											Sahip: {property.shortOwner}
										</span>
										<a
											href="/property/{property.id}"
											class="rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
										>
											Detaylar
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
							<span>Tümünü Gör</span>
							<span>→</span>
						</a>
					</div>
				{:else}
					<div class="py-12 text-center">
						<div class="mb-4 text-6xl">🏠</div>
						<h3 class="mb-2 text-xl font-semibold text-slate-800">Henüz Mülk Bulunmuyor</h3>
						<p class="mb-6 text-slate-600">İlk mülkü listeleyen siz olun!</p>
						<button
							on:click={handleConnectWallet}
							class="rounded-lg bg-emerald-600 px-6 py-3 text-white transition-colors hover:bg-emerald-700"
						>
							Mülk Listele
						</button>
					</div>
				{/if}
			</div>
		</section>

		<!-- 4. HOW IT WORKS -->
		<section class="bg-white py-16">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<!-- Section Header -->
				<div class="mb-16 text-center">
					<h2 class="mb-4 text-3xl font-bold text-slate-800 lg:text-4xl">Nasıl Çalışır?</h2>
					<p class="mx-auto max-w-2xl text-lg text-slate-600">
						PropChain ile gayrimenkul işlemlerinizi 3 basit adımda gerçekleştirin
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
								<span class="text-3xl text-white">🔗</span>
							</div>
							<div
								class="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white"
							>
								1
							</div>
						</div>
						<h3 class="mb-4 text-xl font-bold text-slate-800">Cüzdanını Bağla</h3>
						<p class="text-slate-600">MetaMask cüzdanınızı bağlayın ve Sepolia test ağına geçin</p>
					</div>

					<!-- Step 2 -->
					<div class="text-center">
						<div class="relative">
							<div
								class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600"
							>
								<span class="text-3xl text-white">🔍</span>
							</div>
							<div
								class="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white"
							>
								2
							</div>
						</div>
						<h3 class="mb-4 text-xl font-bold text-slate-800">Mülk Keşfet</h3>
						<p class="text-slate-600">
							Listelenen mülkleri inceleyin, değerlendirmeleri okuyun ve favori mülkünüzü bulun
						</p>
					</div>

					<!-- Step 3 -->
					<div class="text-center">
						<div class="relative">
							<div
								class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600"
							>
								<span class="text-3xl text-white">💼</span>
							</div>
							<div
								class="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white"
							>
								3
							</div>
						</div>
						<h3 class="mb-4 text-xl font-bold text-slate-800">Al/Sat/Değerlendir</h3>
						<p class="text-slate-600">
							Güvenli blockchain işlemleri ile mülk alın, satın veya deneyimlerinizi paylaşın
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
					<h2 class="mb-4 text-3xl font-bold text-slate-800 lg:text-4xl">Neden PropChain?</h2>
					<p class="mx-auto max-w-2xl text-lg text-slate-600">
						Geleneksel emlak işlemlerinden farklı olarak size sunduğumuz avantajlar
					</p>
				</div>

				<!-- Features Grid -->
				<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
					<div
						class="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
					>
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
							<span class="text-2xl">🔒</span>
						</div>
						<h3 class="mb-2 text-lg font-bold text-slate-800">Güvenli İşlemler</h3>
						<p class="text-slate-600">
							Blockchain teknolojisi ile %100 güvenli ve değiştirilemez kayıtlar
						</p>
					</div>

					<div
						class="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
					>
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
							<span class="text-2xl">👥</span>
						</div>
						<h3 class="mb-2 text-lg font-bold text-slate-800">Peer-to-Peer</h3>
						<p class="text-slate-600">Aracı komisyonları olmadan doğrudan alıcı-satıcı işlemleri</p>
					</div>

					<div
						class="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
					>
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
							<span class="text-2xl">📊</span>
						</div>
						<h3 class="mb-2 text-lg font-bold text-slate-800">Şeffaf Fiyatlar</h3>
						<p class="text-slate-600">Tüm fiyatlar ve işlem geçmişi blockchain üzerinde açık</p>
					</div>

					<div
						class="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
					>
						<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
							<span class="text-2xl">⭐</span>
						</div>
						<h3 class="mb-2 text-lg font-bold text-slate-800">Gerçek Değerlendirmeler</h3>
						<p class="text-slate-600">
							Sahte olmayan, blockchain ile doğrulanmış kullanıcı yorumları
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- 6. RECENT ACTIVITIES -->
		{#if stats.recentActivities.length > 0}
			<section class="bg-white py-16">
				<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<!-- Section Header -->
					<div class="mb-12 text-center">
						<h2 class="mb-4 text-3xl font-bold text-slate-800 lg:text-4xl">Son Aktiviteler</h2>
						<p class="text-lg text-slate-600">Platformdaki en güncel işlemler ve etkinlikler</p>
					</div>

					<!-- Activities List -->
					<div class="space-y-4">
						{#each stats.recentActivities as activity}
							<div class="flex items-center justify-between rounded-xl bg-slate-50 p-6">
								<div class="flex items-center space-x-4">
									<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
										{#if activity.eventName === 'PropertyListed'}
											<span class="text-xl">📝</span>
										{:else if activity.eventName === 'PropertySold'}
											<span class="text-xl">💰</span>
										{:else if activity.eventName === 'ReviewAdded'}
											<span class="text-xl">⭐</span>
										{:else}
											<span class="text-xl">📊</span>
										{/if}
									</div>
									<div>
										<h3 class="font-semibold text-slate-800">
											{activity.eventName === 'PropertyListed'
												? 'Yeni Mülk Listelendi'
												: activity.eventName === 'PropertySold'
													? 'Mülk Satıldı'
													: activity.eventName === 'ReviewAdded'
														? 'Yeni Değerlendirme'
														: 'Blockchain Aktivitesi'}
										</h3>
										<p class="text-sm text-slate-600">
											Block #{activity.blockNumber}
										</p>
									</div>
								</div>
								<a
									href={activity.explorerUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="text-sm font-medium text-emerald-600 hover:text-emerald-700"
								>
									Detaylar →
								</a>
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		<!-- 7. CTA SECTION -->
		<section class="bg-gradient-to-br from-emerald-900 to-teal-900 py-16">
			<div class="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
				<h2 class="mb-4 text-3xl font-bold text-white lg:text-4xl">
					Blockchain Emlak Devrimine Katılın
				</h2>
				<p class="mb-8 text-xl text-emerald-100">
					Güvenli, şeffaf ve adil emlak işlemlerinin geleceği burada başlıyor
				</p>

				<div class="flex flex-col justify-center gap-4 sm:flex-row">
					<button
						on:click={handleConnectWallet}
						class="inline-flex items-center space-x-2 rounded-xl bg-white px-8 py-4 font-semibold text-emerald-800 shadow-lg transition-all duration-200 hover:bg-emerald-50 hover:shadow-xl"
					>
						<span>🚀</span>
						<span>Hemen Başla</span>
					</button>

					<a
						href="/explore"
						class="inline-flex items-center space-x-2 rounded-xl border-2 border-white px-8 py-4 font-semibold text-white transition-all duration-200 hover:bg-white hover:text-emerald-800"
					>
						<span>👁️</span>
						<span>Mülkleri İncele</span>
					</a>
				</div>
			</div>
		</section>
	</main>
{/if}
