<script lang="ts">
	import { userStats } from './MyPropertiesState.svelte';
	import { Home, DollarSign, TrendingUp, Activity } from '@lucide/svelte';

    $effect(() => {
		console.log('🎯 DashboardStat - userStats changed:', {
			totalProperties: userStats.totalProperties,
			totalValue: userStats.totalValue,
			activeListings: userStats.activeListings,
			propertiesCount: userStats.properties.length
		});
	});
</script>

<div class="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
    <!-- Total Properties -->
    <div class="rounded-2xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-slate-600">Total Properties</p>
                <p class="mt-1 text-3xl font-bold text-slate-800">{userStats.totalProperties}</p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <Home class="h-6 w-6 text-emerald-600" />
            </div>
        </div>
    </div>

    <!-- Total Value -->
    <div class="rounded-2xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-slate-600">Portfolio Value</p>
                <p class="mt-1 text-3xl font-bold text-slate-800">
                    {userStats.totalValue.toFixed(2)} ETH
                </p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <DollarSign class="h-6 w-6 text-blue-600" />
            </div>
        </div>
    </div>

    <!-- Active Listings -->
    <div class="rounded-2xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-slate-600">Active Listings</p>
                <p class="mt-1 text-3xl font-bold text-slate-800">{userStats.activeListings}</p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <TrendingUp class="h-6 w-6 text-purple-600" />
            </div>
        </div>
    </div>

    <!-- Recent Activity -->
  <!--   <div class="rounded-2xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-slate-600">Recent Activity</p>
                <p class="mt-1 text-3xl font-bold text-slate-800">{userStats.recentActivity}</p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                <Activity class="h-6 w-6 text-orange-600" />
            </div>
        </div>
    </div> -->
</div>