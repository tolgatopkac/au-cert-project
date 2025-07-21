import { ethers } from 'ethers';

// === PROPERTY STATE ===
export const propertyState = $state({
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	items: [] as any[],
	loading: false,
	error: null as string | null,
	lastFetch: 0
});

// === CREATE PROPERTY STATE ===
export const createPropertyState = $state({
	loading: false,
	error: null as string | null,
	success: false,
	txHash: null as string | null
});

// === USER PROPERTIES STATE ===
export const userPropertiesState = $state({
	properties: [] as any[],
	stats: null as any,
	loading: false,
	error: null as string | null,
	lastFetch: 0
});

// === USER REVIEWS STATE ===
export const userReviewsState = $state({
	reviews: [] as any[],
	stats: null as any,
	loading: false,
	error: null as string | null,
	lastFetch: 0
});

// === HELPER FUNCTIONS ===
export const getPropertiesCount = () => propertyState.items.length;

export const getFormattedProperties = () => propertyState.items;

export const resetCreateState = () => {
	createPropertyState.loading = false;
	createPropertyState.error = null;
	createPropertyState.success = false;
	createPropertyState.txHash = null;
};

export const getUserPropertiesCount = () => userPropertiesState.properties.length;

export const resetUserPropertiesState = () => {
	userPropertiesState.properties = [];
	userPropertiesState.stats = null;
	userPropertiesState.loading = false;
	userPropertiesState.error = null;
	userPropertiesState.lastFetch = 0;
};

export const getUserReviewsCount = () => userReviewsState.reviews.length;

export const resetUserReviewsState = () => {
	userReviewsState.reviews = [];
	userReviewsState.stats = null;
	userReviewsState.loading = false;
	userReviewsState.error = null;
	userReviewsState.lastFetch = 0;
};
