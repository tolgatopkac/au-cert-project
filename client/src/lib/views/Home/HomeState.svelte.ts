import { PropertyService } from '$lib/services/propertyService';
import { SvelteSet } from 'svelte/reactivity';
import { z } from 'zod';

export const HomePageStateSchema = z.object({
	properties: z.array(z.any()),
	stats: z.object({
		totalProperties: z.number(),
		totalVolume: z.number(),
		activeUsers: z.number(),
		totalReviews: z.number()
	}),
	recentActivities: z.array(z.any()),
	loading: z.boolean(),
	error: z.string().nullable()
});

export const homePageState = $state<HomePageState>({
	properties: [],
	stats: {
		totalProperties: 0,
		totalVolume: 0,
		activeUsers: 0,
		totalReviews: 0
	},
	recentActivities: [],
	loading: true,
	error: null
});

export type HomePageState = z.infer<typeof HomePageStateSchema>;

export async function homePageStateLoad() {
	try {
		homePageState.loading = true;
		homePageState.error = null;

		// 1. Sadece temel verileri yükle (events olmadan)
		const [propertiesResult, reviewsResult] = await Promise.all([
			PropertyService.getAllProperties(),
			PropertyService.getTotalReviews().catch(() => ({ totalReviews: 0 }))
		]);

		// 2. Set Properties
		homePageState.properties = propertiesResult || [];

		// 3. Calculate Stats
		const properties = homePageState.properties;
		const totalVolume = properties.reduce((sum, prop) => sum + parseFloat(prop.price || 0), 0);
		const uniqueOwners = [...new SvelteSet(properties.map((p) => p.owner.toLowerCase()))];

		homePageState.stats = {
			totalProperties: properties.length,
			totalVolume: totalVolume,
			activeUsers: uniqueOwners.length,
			totalReviews: reviewsResult.totalReviews || 0
		};

		// 4. Geçici mock activities (events çalışana kadar)
		homePageState.recentActivities =
			properties.length > 0
				? [
						{
							id: 1,
							type: 'PropertyListed',
							title: 'Properties Available',
							description: `${properties.length} properties currently listed on platform`,
							timestamp: 'Recently',
							icon: 'FileText'
						},
						{
							id: 2,
							type: 'PlatformActive',
							title: 'Platform Stats',
							description: `Total volume: ${totalVolume.toFixed(2)} ETH across ${uniqueOwners.length} users`,
							timestamp: 'Live',
							icon: 'TrendingUp'
						}
					]
				: [
						{
							id: 1,
							type: 'PlatformReady',
							title: 'Platform Ready',
							description: 'PropChain is ready for your first property listing',
							timestamp: 'Now',
							icon: 'Rocket'
						}
					];

		console.log('✅ Dynamic data loaded:', {
			properties: homePageState.properties.length,
			stats: homePageState.stats,
			activities: homePageState.recentActivities.length
		});
	} catch (error) {
		console.error('❌ Failed to load dynamic data:', error);
		homePageState.error = error instanceof Error ? error.message : 'An unknown error occurred';

		// Fallback to empty data
		homePageState.properties = [];
		homePageState.stats = { totalProperties: 0, totalVolume: 0, activeUsers: 0, totalReviews: 0 };
		homePageState.recentActivities = [];
	} finally {
		homePageState.loading = false;
	}
}
