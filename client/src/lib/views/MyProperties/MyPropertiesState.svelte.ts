/* let loading = $state(true);
let viewMode = $state('grid'); // 'grid' or 'list'
let activeTab = $state('all'); // 'all', 'active', 'recent', 'reviewed'
let error = $state(null); */

import { PropertyService } from '$lib/services/propertyService';
import { PropertySchema, type Property } from '$lib/shared/types';
import { walletState } from '$lib/web3.svelte';
import z from 'zod/v4';

export const PageSchema = z.object({
	loading: z.boolean().default(true),
	viewMode: z.enum(['grid', 'list']).default('grid'),
	activeTab: z.enum(['all', 'active', 'recent', 'reviewed']).default('all'),
	error: z.nullable(z.string()).default(null)
});

export type PageState = z.infer<typeof PageSchema>;

export const myPropertiesPageState: PageState = $state({
	loading: true,
	viewMode: 'grid',
	activeTab: 'all',
	error: null
});

export const userStatsSchema = z.object({
	totalProperties: z.number().nonnegative(),
	totalValue: z.number().nonnegative(),
	activeListings: z.number().nonnegative(),
	recentActivity: z.number().nonnegative(),
	properties: z.array(PropertySchema)
});
export type UserStats = z.infer<typeof userStatsSchema>;
export const userStats: UserStats = $state({
	totalProperties: 0,
	totalValue: 0,
	activeListings: 0,
	recentActivity: 0,
	properties: []
});

export async function loadMyProperties() {
	try {
		myPropertiesPageState.loading = true;
		myPropertiesPageState.error = null;

		if (!walletState.isConnected || !walletState.address) {
			console.log('⚠️ Wallet not connected, skipping load');
			clearMyProperties();
			return;
		}

		console.log('📊 Loading properties for address:', walletState.address);

		// Get all properties and filter by current user
		const allProperties = await PropertyService.getAllProperties();
		const userAddress = walletState.address.toLowerCase();
		const userProperties: Property[] = allProperties.filter(
			(property: Property) => property.owner?.toLowerCase() === userAddress
		);

		// Update state
		// use
		userStats.properties = userProperties;
		userStats.totalProperties = userProperties.length;
		userStats.totalValue = userProperties.reduce((sum, p) => sum + parseFloat(p.price || '0'), 0);
		userStats.activeListings = userProperties.filter((p) => parseFloat(p.price || '0') > 0).length;
		userStats.recentActivity = 3; // Mock for now

		console.log('✅ My Properties loaded:', {
			address: walletState.address,
			total: userStats.totalProperties,
			value: userStats.totalValue.toFixed(3),
			active: userStats.activeListings
		});
	} catch (error) {
		console.error('❌ Failed to load my properties:', error);
		myPropertiesPageState.error = 'Failed to load your properties. Please try again.';
	} finally {
		myPropertiesPageState.loading = false;
	}
}
export function clearMyProperties() {
	userStats.totalProperties = 0;
	userStats.totalValue = 0;
	userStats.activeListings = 0;
	userStats.recentActivity = 0;
	userStats.properties = [];

	myPropertiesPageState.loading = false;
	myPropertiesPageState.error = null;

	console.log('🧹 My Properties data cleared');
}
