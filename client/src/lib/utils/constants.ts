export const CONTRACT_ADDRESS = '0xa75650BD4A021dBDB9aEb82Ac6Adc917712067e6';

export const CONTRACT_ABI = [
	// Property functions
	'function listProperty(address,uint256,string,string,string,string,string) external returns (uint256)',
	'function getAllProperties() public view returns (tuple(uint256,address,uint256,string,string,string,string,string,address[],string[])[])',
	'function buyProperty(uint256,address) external payable',
	'function getUserProperties(address) external view returns (tuple(uint256,address,uint256,string,string,string,string,string,address[],string[])[])',
	'function getProperty(uint256) external view returns (uint256,address,uint256,string,string,string,string,string)',
	'function updateProperty(address,uint256,string,string,string,string,string) external returns (uint256)',
	'function updatePrice(address,uint256,uint256) external returns (string)',

	// Review functions
	'function addReview(uint256,uint256,string,address) external',
	'function getProductReviews(uint256) external view returns (tuple(address,uint256,uint256,string,uint256)[])',
	'function getUserReviews(address) external view returns (tuple(address,uint256,uint256,string,uint256)[])',
	'function likeReview(uint256,uint256,address) external',
	'function getHighestRatedProduct() external view returns (uint256)',

	// NEW: Total reviews function
	'function getTotalReviews() external view returns (uint256)',

	// Public variables
	'function propertyIndex() external view returns (uint256)',
	'function reviewsCounter() external view returns (uint256)'
];
export const NETWORKS = {
	SEPOLIA: 11155111,
	MAINNET: 1,
	LOCALHOST: 31337
};

export const SUPPORTED_NETWORKS = [NETWORKS.SEPOLIA];

/* const TRANSACTION_STEPS = {
	PREPARING: 'Preparing transaction...',
	PENDING: 'Transaction submitted to blockchain...',
	CONFIRMING: 'Waiting for confirmation...',
	SUCCESS: 'Property listed successfully!'
};
 */

// Export the detection utility
export { checkMetaMask, getMetaMaskInstallUrl } from './metamask.js';
