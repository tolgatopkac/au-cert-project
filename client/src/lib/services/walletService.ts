import { ethers } from 'ethers';
import { walletState } from '../stores/walletStore.svelte.js';
import { NETWORKS } from '../utils/constants.js';

export class WalletService {
	// === CONNECTION ===
	static async connect() {
		try {
			walletState.loading = true;
			walletState.error = null;

			if (typeof window.ethereum === 'undefined') {
				throw new Error('MetaMask not found. Please install MetaMask.');
			}

			console.log('🔗 MetaMask found, connecting...');

			const accounts = await window.ethereum.request({
				method: 'eth_requestAccounts'
			});

			if (accounts.length === 0) {
				throw new Error('No accounts found');
			}

			const provider = new ethers.BrowserProvider(window.ethereum);
			const network = await provider.getNetwork();

			walletState.address = accounts[0];
			walletState.network = Number(network.chainId);
			walletState.isConnected = true;

			console.log('✅ Wallet connected:', {
				address: walletState.address,
				network: walletState.network
			});

			this.setupEventListeners();
			return accounts[0];
		} catch (error) {
			walletState.error = error instanceof Error ? error.message : 'Connection failed';
			throw error;
		} finally {
			walletState.loading = false;
		}
	}

	// === DISCONNECT ===
	static disconnect() {
		walletState.address = null;
		walletState.isConnected = false;
		walletState.network = null;
		walletState.error = null;
		console.log('🔌 Wallet disconnected');
	}

	// === AUTO CHECK ===
	static async checkConnection() {
		if (typeof window.ethereum === 'undefined') {
			console.log('❌ MetaMask not found');
			return false;
		}

		try {
			console.log('🔍 Checking existing connection...');

			const accounts = await window.ethereum.request({ method: 'eth_accounts' });

			if (accounts.length > 0) {
				const provider = new ethers.BrowserProvider(window.ethereum);
				const network = await provider.getNetwork();

				walletState.address = accounts[0];
				walletState.network = Number(network.chainId);
				walletState.isConnected = true;

				console.log('✅ Existing connection found');
				this.setupEventListeners();
				return true;
			} else {
				console.log('ℹ️ No existing connection found');
				this.setupEventListeners(); // Still setup listeners
				return false;
			}
		} catch (error) {
			console.error('❌ Failed to check connection:', error);
			return false;
		}
	}

	// === EVENT LISTENERS ===
	private static setupEventListeners() {
		if (typeof window.ethereum === 'undefined') return;

		console.log('🎧 Setting up event listeners...');

		// Account change
		window.ethereum.on('accountsChanged', (accounts: string[]) => {
			console.log('👤 Account changed:', accounts);
			if (accounts.length === 0) {
				this.disconnect();
			} else {
				walletState.address = accounts[0];
			}
		});

		// Network change
		window.ethereum.on('chainChanged', (chainId: string) => {
			const networkId = parseInt(chainId, 16);
			console.log('🌐 Network changed to:', networkId);
			walletState.network = networkId;

			if (networkId === NETWORKS.SEPOLIA) {
				walletState.error = null;
			} else {
				walletState.error = `Wrong network. Please switch to Sepolia (current: ${networkId})`;
			}
		});

		// Disconnect
		window.ethereum.on('disconnect', () => {
			console.log('🔌 Wallet disconnected');
			this.disconnect();
		});
	}

	// === UTILITIES ===
	static async getProvider() {
		if (typeof window.ethereum === 'undefined') {
			throw new Error('MetaMask not found');
		}
		return new ethers.BrowserProvider(window.ethereum);
	}

	static async getSigner() {
		const provider = await this.getProvider();
		return await provider.getSigner();
	}

	// === GET USER PROPERTIES ===
	static async getUserProperties(userAddress?: string) {
		try {
			const address = userAddress || walletState.address;
			if (!address) throw new Error('No address provided');

			console.log('👤 Fetching properties for user:', address);

			// Get contract with signer
			const signer = await WalletService.getSigner();
			const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

			const result = await contract.getUserProperties(address);
			console.log('📊 Raw user properties data:', result);

			// Format user properties (same structure as getAllProperties)
			const formattedProperties = result.map((property, index) => ({
				owner: property[1] || property.owner || address, // address owner
				title: property[3] || property.propertyTitle || 'Untitled Property', // string propertyTitle
				description: property[7] || property.description || '', // string description
				category: property[4] || property.category || 'General', // string category
				price: property[2] ? ethers.formatEther(property[2]) : '0', // uint256 price
				productId: property[0] ? Number(property[0]) : index, // uint256 productId
				reviewers: property[8] || property.reviewers || [], // address[] reviewers
				reviews: property[9] || property.reviews || [], // string[] reviews
				image: property[5] || property.images || '', // string images
				address: property[6] || property.propertyAddress || '', // string propertyAddress
				id: property[0]?.toString() || index.toString(),
				shortOwner: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown',

				// Additional user property specific fields
				isOwned: true, // Always true for user properties
				reviewCount: property[9]?.length || 0,
				averageRating: 0 // Will calculate below if needed
			}));

			// Get reviews for each property to calculate average ratings
			const propertiesWithReviews = await Promise.all(
				formattedProperties.map(async (property) => {
					try {
						const reviewsData = await this.getPropertyReviews(property.productId);
						return {
							...property,
							averageRating: reviewsData.averageRating,
							totalReviews: reviewsData.totalReviews,
							reviewsData: reviewsData.reviews
						};
					} catch (reviewError) {
						console.warn(
							`Failed to fetch reviews for property ${property.productId}:`,
							reviewError
						);
						return {
							...property,
							averageRating: 0,
							totalReviews: 0,
							reviewsData: []
						};
					}
				})
			);

			console.log(`✅ Fetched ${formattedProperties.length} properties for user ${address}`);

			// Calculate user statistics
			const totalValue = propertiesWithReviews.reduce(
				(sum, prop) => sum + parseFloat(prop.price),
				0
			);

			const totalReviews = propertiesWithReviews.reduce((sum, prop) => sum + prop.totalReviews, 0);

			const averagePropertyRating =
				propertiesWithReviews.length > 0
					? propertiesWithReviews.reduce((sum, prop) => sum + prop.averageRating, 0) /
						propertiesWithReviews.length
					: 0;

			return {
				properties: propertiesWithReviews,
				userStats: {
					totalProperties: formattedProperties.length,
					totalValue: totalValue.toFixed(4) + ' ETH',
					totalValueUSD: (totalValue * 2000).toFixed(2) + ' USD',
					totalReviews: totalReviews,
					averageRating: averagePropertyRating.toFixed(1),
					userAddress: address,
					shortAddress: `${address.slice(0, 6)}...${address.slice(-4)}`
				},
				success: true
			};
		} catch (error) {
			console.error('❌ Failed to fetch user properties:', error);
			throw error;
		}
	}

	// === GET CURRENT USER PROPERTIES (shorthand) ===
	static async getMyProperties() {
		if (!walletState.address) {
			throw new Error('Wallet not connected');
		}
		return this.getUserProperties(walletState.address);
	}

	// === USER PROPERTY STATISTICS ===
	static async getUserStats(userAddress?: string) {
		try {
			const userPropertiesData = await this.getUserProperties(userAddress);
			return userPropertiesData.userStats;
		} catch (error) {
			console.error('❌ Failed to fetch user stats:', error);
			throw error;
		}
	}
}
