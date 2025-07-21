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

// === HELPER FUNCTIONS ===
export const getPropertiesCount = () => propertyState.items.length;

export const getFormattedProperties = () => propertyState.items;

export const resetCreateState = () => {
	createPropertyState.loading = false;
	createPropertyState.error = null;
	createPropertyState.success = false;
	createPropertyState.txHash = null;
};
