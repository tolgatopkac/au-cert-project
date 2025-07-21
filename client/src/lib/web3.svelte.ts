import { PropertyService } from './services/propertyService.js';
import { WalletService } from './web3.svelte.js';

// Re-exports for easy importing
export { walletState, isWalletReady, shortAddress } from './stores/walletStore.svelte.js';
export { WalletService } from './services/walletService.js';
export { CONTRACT_ADDRESS, CONTRACT_ABI, NETWORKS } from './utils/constants.js';

// Convenience exports
export const connectWallet = () => WalletService.connect();
export const disconnectWallet = () => WalletService.disconnect();
export const checkWalletConnection = () => WalletService.checkConnection();

export const createProperty = (formData: any) => PropertyService.createProperty(formData);
export const getAllProperties = () => PropertyService.getAllProperties();
export const updateProperty = (propertyId: number, formData: any) =>
	PropertyService.updateProperty(propertyId, formData);
export const updatePrice = (propertyId: number, newPrice: string) =>
	PropertyService.updatePrice(propertyId, newPrice);
export const buyProperty = (propertyId: number, propertyPrice: string) =>
	PropertyService.buyProperty(propertyId, propertyPrice);

// Review functions
export const addReview = (propertyId: number, rating: number, comment: string) =>
	PropertyService.addReview(propertyId, rating, comment);

export const likeReview = (propertyId: number, reviewIndex: number) =>
	PropertyService.likeReview(propertyId, reviewIndex);

export const getHighestRatedProduct = () => PropertyService.getHighestRatedProduct();
export const getPropertyReviews = (propertyId: number) =>
	PropertyService.getPropertyReviews(propertyId);

export const getProperty = (propertyId: number) => PropertyService.getProperty(propertyId);
export const propertyExists = (propertyId: number) => PropertyService.propertyExists(propertyId);

// User-specific functions
export const getUserProperties = (address?: string) => PropertyService.getUserProperties(address);
export const getMyProperties = () => PropertyService.getMyProperties();
export const getUserStats = (address?: string) => PropertyService.getUserStats(address);

// Review functions
export const getUserReviews = (userAddress?: string) => PropertyService.getUserReviews(userAddress);
export const getMyReviews = () => PropertyService.getMyReviews();
export const getUserReviewStats = (userAddress?: string) =>
	PropertyService.getUserReviewStats(userAddress);
export const hasUserReviewedProperty = (propertyId: number, userAddress?: string) =>
	PropertyService.hasUserReviewedProperty(propertyId, userAddress);
