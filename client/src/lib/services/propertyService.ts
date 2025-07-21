import { ethers } from 'ethers';
import { walletState } from '../stores/walletStore.svelte.js';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants.js';
import { WalletService } from './walletService.js';
import { createPropertyState, propertyState } from '$lib/stores/propertyStore.svelte.js';

export class PropertyService {
	// === GET ALL PROPERTIES ===
	static async getAllProperties() {
		try {
			propertyState.loading = true;
			propertyState.error = null;

			console.log('📊 Fetching all properties...');

			// Contract instance
			let contract;
			if (walletState.isConnected) {
				const signer = await WalletService.getSigner();
				contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
			} else {
				if (typeof window.ethereum !== 'undefined') {
					const provider = new ethers.BrowserProvider(window.ethereum);
					contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
				} else {
					throw new Error('No provider available');
				}
			}

			const result = await contract.getAllProperties();
			console.log('✅ Raw contract data:', result);

			// Parse properties with correct field names
			const parsedProperties = result.map((property, index) => ({
				owner: property[1] || property.owner || '', // address owner
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
				shortOwner: property[1]
					? `${property[1].slice(0, 6)}...${property[1].slice(-4)}`
					: 'Unknown'
			}));

			propertyState.items = parsedProperties;
			propertyState.lastFetch = Date.now();

			console.log(`✅ Fetched ${parsedProperties.length} formatted properties:`, parsedProperties);
			return parsedProperties;
		} catch (error) {
			propertyState.error = error instanceof Error ? error.message : 'Failed to fetch properties';
			console.error('❌ Failed to fetch properties:', error);
			throw error;
		} finally {
			propertyState.loading = false;
		}
	}

	// === CREATE PROPERTY ===
	static async createProperty(formData: {
		propertyTitle: string;
		description: string;
		category: string;
		price: string;
		images?: string;
		propertyAddress: string;
	}) {
		try {
			createPropertyState.loading = true;
			createPropertyState.error = null;
			createPropertyState.success = false;
			createPropertyState.txHash = null;

			// Validation
			if (!walletState.isConnected || !walletState.address) {
				throw new Error('Wallet not connected');
			}

			if (walletState.network !== 11155111) {
				throw new Error('Please switch to Sepolia network');
			}

			console.log('🏠 Creating property:', formData);

			// Validate form data
			if (!formData.propertyTitle?.trim()) {
				throw new Error('Property title is required');
			}
			if (!formData.description?.trim()) {
				throw new Error('Description is required');
			}
			if (!formData.propertyAddress?.trim()) {
				throw new Error('Property address is required');
			}
			if (!formData.price?.trim() || parseFloat(formData.price) <= 0) {
				throw new Error('Valid price is required');
			}

			// Prepare parameters
			const owner = walletState.address;
			const priceInWei = ethers.parseEther(formData.price.toString());
			const title = formData.propertyTitle.trim();
			const category = formData.category || 'General';
			const images = formData.images?.trim() || '';
			const address = formData.propertyAddress.trim();
			const description = formData.description.trim();

			console.log('🔧 Prepared parameters:', {
				owner,
				priceWei: priceInWei.toString(),
				priceEth: formData.price,
				title,
				category,
				images,
				address,
				description
			});

			// Get contract with signer
			const signer = await WalletService.getSigner();
			const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

			// Call contract function
			console.log('📡 Calling contract.listProperty...');
			const tx = await contract.listProperty(
				owner, // address _owner
				priceInWei, // uint256 _price
				title, // string _propertyTitle
				category, // string _category
				images, // string _images
				address, // string _propertyAddress
				description // string _description
			);

			console.log('⏳ Transaction submitted:', {
				hash: tx.hash,
				from: tx.from,
				to: tx.to,
				value: tx.value?.toString(),
				gasLimit: tx.gasLimit?.toString(),
				gasPrice: tx.gasPrice?.toString(),
				nonce: tx.nonce
			});

			createPropertyState.txHash = tx.hash;

			// Wait for confirmation
			console.log('⏳ Waiting for confirmation...');
			const receipt = await tx.wait();

			// === DETAILED RECEIPT LOGGING ===
			console.log('🎉 Property created successfully!');
			console.log('📋 Transaction Receipt:', {
				blockHash: receipt.blockHash,
				blockNumber: receipt.blockNumber,
				confirmations: receipt.confirmations || 'N/A',
				from: receipt.from,
				to: receipt.to,
				contractAddress: receipt.contractAddress,
				transactionHash: receipt.hash,
				transactionIndex: receipt.index,
				gasUsed: receipt.gasUsed?.toString(),
				gasPrice: receipt.gasPrice?.toString(),
				effectiveGasPrice: receipt.fee?.toString() || 'N/A',
				status: receipt.status === 1 ? 'SUCCESS ✅' : 'FAILED ❌',
				type: receipt.type || 'N/A'
			});

			// Parse Events
			if (receipt.logs && receipt.logs.length > 0) {
				console.log('📝 Event Logs:');

				receipt.logs.forEach((log, index) => {
					try {
						// Try to parse the log if it's from our contract
						if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
							const parsedLog = contract.interface.parseLog(log);
							console.log(`   Event ${index + 1}: ${parsedLog.name}`, {
								args: parsedLog.args,
								data: parsedLog.args
									.map((arg, i) => `${parsedLog.fragment.inputs[i].name}: ${arg.toString()}`)
									.join(', ')
							});
						} else {
							console.log(`   Log ${index + 1}:`, {
								address: log.address,
								topics: log.topics,
								data: log.data
							});
						}
					} catch (error) {
						console.log(`   Raw Log ${index + 1}:`, {
							address: log.address,
							topics: log.topics,
							data: log.data
						});
					}
				});
			}

			// Gas Analysis
			if (receipt.gasUsed && tx.gasLimit) {
				const gasUsed = receipt.gasUsed;
				const gasLimit = tx.gasLimit;
				const gasEfficiency = (Number(gasUsed) / Number(gasLimit)) * 100;

				console.log('⛽ Gas Analysis:', {
					gasUsed: gasUsed.toString(),
					gasLimit: gasLimit.toString(),
					gasEfficiency: `${gasEfficiency.toFixed(2)}%`,
					gasSaved: (Number(gasLimit) - Number(gasUsed)).toString()
				});
			}

			// Calculate costs
			if (receipt.gasUsed && receipt.gasPrice) {
				const totalCost = receipt.gasUsed * receipt.gasPrice;
				const costInEth = ethers.formatEther(totalCost);
				console.log('💰 Transaction Cost:', {
					totalGasUsed: receipt.gasUsed.toString(),
					gasPrice: receipt.gasPrice.toString() + ' wei',
					totalCost: totalCost.toString() + ' wei',
					costInETH: costInEth + ' ETH',
					estimatedUSD: (parseFloat(costInEth) * 2000).toFixed(4) + ' USD'
				});
			}

			// Network info
			console.log('🌐 Network Info:', {
				chainId: walletState.network,
				networkName: 'Sepolia Testnet',
				explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`
			});

			createPropertyState.success = true;

			// Refresh properties list after 2 seconds
			setTimeout(() => {
				/* 	this.getAllProperties(); */
			}, 2000);

			return { success: true, txHash: tx.hash, receipt };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create property';
			createPropertyState.error = errorMessage;
			console.error('❌ Failed to create property:', error);

			// Detailed error logging
			if (error.code) {
				console.error('Error Code:', error.code);
			}
			if (error.reason) {
				console.error('Error Reason:', error.reason);
			}
			if (error.transaction) {
				console.error('Failed Transaction:', error.transaction);
			}

			throw error;
		} finally {
			createPropertyState.loading = false;
		}
	}

	// === GET USER PROPERTIES ===
	/* 	static async getUserProperties(userAddress?: string) {
		try {
			const address = userAddress || walletState.address;
			if (!address) throw new Error('No address provided');

			const signer = await WalletService.getSigner();
			const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

			const result = await contract.getUserProperties(address);
			console.log(`📊 Fetched ${result.length} properties for ${address}`);

			return result;
		} catch (error) {
			console.error('❌ Failed to fetch user properties:', error);
			throw error;
		}
	} */
}

// getAllProperties
