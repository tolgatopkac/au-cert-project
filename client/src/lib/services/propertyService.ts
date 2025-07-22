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
		price: string | number;
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
			// ✅ Price validation - number veya string
			const priceValue =
				typeof formData.price === 'string' ? parseFloat(formData.price.trim()) : formData.price;

			if (!priceValue || priceValue <= 0) {
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

	// === Update property ===
	static async updateProperty(
		propertyId: number,
		formData: {
			propertyTitle: string;
			description: string;
			category: string;
			images?: string;
			propertyAddress: string;
		}
	) {
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

			console.log('✏️ Updating property:', { propertyId, formData });

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

			// Prepare parameters
			const owner = walletState.address;
			const title = formData.propertyTitle.trim();
			const category = formData.category || 'General';
			const images = formData.images?.trim() || '';
			const address = formData.propertyAddress.trim();
			const description = formData.description.trim();

			// Get contract with signer
			const signer = await WalletService.getSigner();
			const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

			// Call updateProperty function
			const tx = await contract.updateProperty(
				owner, // address _owner
				propertyId, // uint256 _productId
				title, // string _propertyTitle
				category, // string _category
				images, // string _images
				address, // string _propertyAddress
				description // string _description
			);

			console.log('⏳ Update transaction submitted:', tx.hash);
			createPropertyState.txHash = tx.hash;

			// Wait for confirmation
			const receipt = await tx.wait();
			console.log('✅ Property updated successfully!', receipt);

			createPropertyState.success = true;

			// Refresh properties
			setTimeout(() => {
				this.getAllProperties();
			}, 2000);

			return { success: true, txHash: tx.hash, receipt };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update property';
			createPropertyState.error = errorMessage;
			console.error('❌ Failed to update property:', error);
			throw error;
		} finally {
			createPropertyState.loading = false;
		}
	}

	// === Update price ===

	static async updatePrice(propertyId: number, newPrice: string) {
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

			if (!newPrice?.trim() || parseFloat(newPrice) <= 0) {
				throw new Error('Valid price is required');
			}

			console.log('💰 Updating price:', { propertyId, newPrice });

			// Prepare parameters
			const owner = walletState.address;
			const priceInWei = ethers.parseEther(newPrice.toString());

			// Get contract with signer
			const signer = await WalletService.getSigner();
			const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

			// Call updatePrice function
			const tx = await contract.updatePrice(
				owner, // address _owner
				propertyId, // uint256 _productId
				priceInWei // uint256 _price
			);

			console.log('⏳ Price update transaction submitted:', tx.hash);
			createPropertyState.txHash = tx.hash;

			// Wait for confirmation
			const receipt = await tx.wait();
			console.log('✅ Price updated successfully!', receipt);

			createPropertyState.success = true;

			// Refresh properties
			setTimeout(() => {
				this.getAllProperties();
			}, 2000);

			return { success: true, txHash: tx.hash, receipt };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to update price';
			createPropertyState.error = errorMessage;
			console.error('❌ Failed to update price:', error);
			throw error;
		} finally {
			createPropertyState.loading = false;
		}
	}

	// Buy Property

	// === BUY PROPERTY ===
	// === BUY PROPERTY ===
	static async buyProperty(propertyId: number, propertyPrice: string) {
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

			console.log('💸 Buying property:', { propertyId, propertyPrice });

			// Validate price
			if (!propertyPrice || parseFloat(propertyPrice) <= 0) {
				throw new Error('Invalid property price');
			}

			// Get current property to double-check ownership
			const currentProperties = propertyState.items;
			const property = currentProperties.find((p) => p.productId === propertyId);

			if (!property) {
				throw new Error('Property not found');
			}

			if (property.owner.toLowerCase() === walletState.address.toLowerCase()) {
				throw new Error('You cannot buy your own property');
			}

			// Prepare parameters
			const buyer = walletState.address;
			const priceInWei = ethers.parseEther(propertyPrice);

			console.log('🔧 Purchase parameters:', {
				propertyId,
				buyer,
				priceWei: priceInWei.toString(),
				priceEth: propertyPrice,
				currentOwner: property.owner
			});

			// Get contract with signer
			const signer = await WalletService.getSigner();
			const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

			// Call buyProperty function - PAYABLE!
			const tx = await contract.buyProperty(
				propertyId, // uint256 _id
				buyer, // address _buyer
				{
					value: priceInWei // msg.value - ETH amount to send
				}
			);

			console.log('⏳ Purchase transaction submitted:', {
				hash: tx.hash,
				value: ethers.formatEther(tx.value),
				to: tx.to,
				from: tx.from
			});

			createPropertyState.txHash = tx.hash;

			// Wait for confirmation
			const receipt = await tx.wait();

			// === DETAILED PURCHASE LOGGING ===
			console.log('🎉 Property purchased successfully!');
			console.log('📋 Purchase Receipt:', {
				transactionHash: receipt.hash,
				blockNumber: receipt.blockNumber,
				gasUsed: receipt.gasUsed?.toString(),
				status: receipt.status === 1 ? 'SUCCESS ✅' : 'FAILED ❌'
			});

			// Parse Purchase Events
			if (receipt.logs && receipt.logs.length > 0) {
				console.log('📝 Purchase Events:');

				receipt.logs.forEach((log, index) => {
					try {
						if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
							const parsedLog = contract.interface.parseLog(log);
							console.log(`   Event ${index + 1}: ${parsedLog.name}`, {
								propertyId: parsedLog.args.productId?.toString(),
								oldOwner: parsedLog.args.oldOwner,
								newOwner: parsedLog.args.newOwner,
								price: ethers.formatEther(parsedLog.args.price) + ' ETH'
							});
						}
					} catch (error) {
						console.log(`   Raw Log ${index + 1}:`, log);
					}
				});
			}

			// Calculate purchase costs
			if (receipt.gasUsed && receipt.gasPrice) {
				const gasCost = receipt.gasUsed * receipt.gasPrice;
				const gasCostEth = ethers.formatEther(gasCost);
				const totalCost = parseFloat(propertyPrice) + parseFloat(gasCostEth);

				console.log('💰 Purchase Costs:', {
					propertyPrice: propertyPrice + ' ETH',
					gasCost: gasCostEth + ' ETH',
					totalCost: totalCost.toFixed(6) + ' ETH',
					estimatedUSD: (totalCost * 2000).toFixed(2) + ' USD'
				});
			}

			createPropertyState.success = true;

			// Refresh properties to show new ownership
			setTimeout(() => {
				this.getAllProperties();
			}, 2000);

			return { success: true, txHash: tx.hash, receipt, newOwner: buyer };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to buy property';
			createPropertyState.error = errorMessage;
			console.error('❌ Failed to buy property:', error);

			// Specific error handling
			if (error.reason?.includes('Insufficient funds')) {
				createPropertyState.error = 'Insufficient funds. Check your ETH balance.';
			} else if (error.reason?.includes('Buyer cannot be the owner')) {
				createPropertyState.error = 'You cannot buy your own property.';
			} else if (error.reason?.includes('Property does not exist')) {
				createPropertyState.error = 'Property not found or has been removed.';
			}

			throw error;
		} finally {
			createPropertyState.loading = false;
		}
	}

	// === REVIEW Functino ===
	// add review
	// Add Review
	static async addReview(propertyId: number, rating: number, comment: string) {
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

			// Validate review data
			if (rating < 1 || rating > 5) {
				throw new Error('Rating must be between 1 and 5');
			}

			if (!comment?.trim()) {
				throw new Error('Review comment is required');
			}

			console.log('📝 Adding review:', { propertyId, rating, comment });

			// Get contract with signer
			const signer = await WalletService.getSigner();
			const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

			// Call addReview function
			const tx = await contract.addReview(
				propertyId, // uint256 productId
				rating, // uint256 rating
				comment.trim(), // string comment
				walletState.address // address user
			);

			console.log('⏳ Review transaction submitted:', tx.hash);
			createPropertyState.txHash = tx.hash;

			// Wait for confirmation
			const receipt = await tx.wait();
			console.log('✅ Review added successfully!', receipt);

			// Parse Review Events
			if (receipt.logs && receipt.logs.length > 0) {
				receipt.logs.forEach((log, index) => {
					try {
						if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
							const parsedLog = contract.interface.parseLog(log);
							if (parsedLog.name === 'ReviewAdded') {
								console.log('📝 Review Event:', {
									productId: parsedLog.args.productId?.toString(),
									reviewer: parsedLog.args.reviewer,
									rating: parsedLog.args.rating?.toString(),
									comment: parsedLog.args.comment
								});
							}
						}
					} catch (error) {
						console.log(`   Raw Log ${index + 1}:`, log);
					}
				});
			}

			createPropertyState.success = true;

			// Refresh properties to show new review
			setTimeout(() => {
				this.getAllProperties();
			}, 2000);

			return { success: true, txHash: tx.hash, receipt };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to add review';
			createPropertyState.error = errorMessage;
			console.error('❌ Failed to add review:', error);
			throw error;
		} finally {
			createPropertyState.loading = false;
		}
	}

	// like review
	static async likeReview(propertyId: number, reviewIndex: number) {
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

			console.log('👍 Liking review:', { propertyId, reviewIndex });

			// Get contract with signer
			const signer = await WalletService.getSigner();
			const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

			// Call likeReview function
			const tx = await contract.likeReview(
				propertyId, // uint256 productId
				reviewIndex, // uint256 reviewIndex
				walletState.address // address liker
			);

			console.log('⏳ Like transaction submitted:', tx.hash);
			createPropertyState.txHash = tx.hash;

			// Wait for confirmation
			const receipt = await tx.wait();
			console.log('✅ Review liked successfully!', receipt);

			// Parse Like Events
			if (receipt.logs && receipt.logs.length > 0) {
				receipt.logs.forEach((log, index) => {
					try {
						if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
							const parsedLog = contract.interface.parseLog(log);
							if (parsedLog.name === 'ReviewLiked') {
								console.log('👍 Like Event:', {
									productId: parsedLog.args.productId?.toString(),
									reviewIndex: parsedLog.args.reviewIndex?.toString(),
									liker: parsedLog.args.liker,
									totalLikes: parsedLog.args.likes?.toString()
								});
							}
						}
					} catch (error) {
						console.log(`   Raw Log ${index + 1}:`, log);
					}
				});
			}

			createPropertyState.success = true;

			return { success: true, txHash: tx.hash, receipt };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to like review';
			createPropertyState.error = errorMessage;
			console.error('❌ Failed to like review:', error);

			// Specific error handling
			if (error.reason?.includes('Reviewer cannot like their own review')) {
				createPropertyState.error = 'You cannot like your own review';
			}

			throw error;
		} finally {
			createPropertyState.loading = false;
		}
	}

	// get highest rated product
	static async getHighestRatedProduct() {
		try {
			console.log('🏆 Fetching highest rated property...');

			// Get contract (read-only or with signer)
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

			// Call contract function
			const highestRatedProductId = await contract.getHighestRatedProduct();
			const productId = Number(highestRatedProductId);

			console.log('🎯 Highest rated product ID:', productId);

			// If we have a valid product ID, get the full property details
			if (productId >= 0) {
				// Find the property in our current state
				const property = propertyState.items.find((p) => p.productId === productId);

				if (property) {
					console.log('🏆 Highest rated property found:', {
						id: property.id,
						title: property.title,
						price: property.price,
						owner: property.shortOwner,
						reviews: property.reviews?.length || 0
					});

					return {
						productId,
						property,
						success: true
					};
				} else {
					// Property not in current state, fetch single property details
					try {
						const propertyDetails = await contract.getProperty(productId);

						const formattedProperty = {
							owner: propertyDetails[1],
							title: propertyDetails[3] || 'Highest Rated Property',
							description: propertyDetails[7] || '',
							category: propertyDetails[4] || 'General',
							price: ethers.formatEther(propertyDetails[2]),
							productId: Number(propertyDetails[0]),
							image: propertyDetails[5] || '',
							address: propertyDetails[6] || '',
							id: propertyDetails[0]?.toString(),
							shortOwner: propertyDetails[1]
								? `${propertyDetails[1].slice(0, 6)}...${propertyDetails[1].slice(-4)}`
								: 'Unknown'
						};

						console.log('🏆 Highest rated property details:', formattedProperty);

						return {
							productId,
							property: formattedProperty,
							success: true
						};
					} catch (detailError) {
						console.error('Failed to fetch property details:', detailError);
						return {
							productId,
							property: null,
							success: true,
							message: 'Highest rated property ID found but details unavailable'
						};
					}
				}
			} else {
				console.log('ℹ️ No rated properties found');
				return {
					productId: null,
					property: null,
					success: true,
					message: 'No properties have been rated yet'
				};
			}
		} catch (error) {
			console.error('❌ Failed to fetch highest rated property:', error);
			throw error;
		}
	}

	static async getPropertyReviews(propertyId: number) {
		try {
			console.log('📊 Fetching reviews for property:', propertyId);

			// Get contract (read-only or with signer)
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

			const result = await contract.getProductReviews(propertyId);

			// Format reviews
			const formattedReviews = result.map((review, index) => ({
				reviewer: review.reviewer || review[0],
				productId: review.productId ? Number(review.productId) : Number(review[1]),
				rating: review.rating ? Number(review.rating) : Number(review[2]),
				comment: review.comment || review[3],
				likes: review.likes ? Number(review.likes) : Number(review[4]),
				index: index,
				shortReviewer: review.reviewer
					? `${review.reviewer.slice(0, 6)}...${review.reviewer.slice(-4)}`
					: 'Unknown'
			}));

			// Calculate average rating
			const totalRating = formattedReviews.reduce((sum, review) => sum + review.rating, 0);
			const averageRating =
				formattedReviews.length > 0 ? (totalRating / formattedReviews.length).toFixed(1) : '0';

			console.log(`✅ Fetched ${formattedReviews.length} reviews for property ${propertyId}`, {
				averageRating,
				totalReviews: formattedReviews.length
			});

			return {
				reviews: formattedReviews,
				averageRating: parseFloat(averageRating),
				totalReviews: formattedReviews.length,
				totalRating
			};
		} catch (error) {
			console.error('❌ Failed to fetch property reviews:', error);
			throw error;
		}
	}

	// === GET SINGLE PROPERTY ===
	static async getProperty(propertyId: number) {
		try {
			console.log('🔍 Fetching single property:', propertyId);

			// Get contract (read-only or with signer)
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

			// Call getProperty function
			const result = await contract.getProperty(propertyId);

			console.log('🔍 Raw property data:', result);

			// Format single property (matching RealEstate.sol return structure)
			const formattedProperty = {
				productId: result[0] ? Number(result[0]) : propertyId, // uint256 productId
				owner: result[1] || '', // address owner
				price: result[2] ? ethers.formatEther(result[2]) : '0', // uint256 price -> ETH
				title: result[3] || 'Untitled Property', // string propertyTitle
				category: result[4] || 'General', // string category
				image: result[5] || '', // string images
				address: result[6] || '', // string propertyAddress
				description: result[7] || '', // string description

				// Additional formatted fields
				id: result[0]?.toString() || propertyId.toString(),
				shortOwner: result[1] ? `${result[1].slice(0, 6)}...${result[1].slice(-4)}` : 'Unknown',
				priceInWei: result[2]?.toString() || '0'
			};

			console.log('✅ Formatted property:', formattedProperty);

			// Get property reviews as well
			try {
				const reviewsData = await this.getPropertyReviews(propertyId);
				formattedProperty.reviews = reviewsData.reviews;
				formattedProperty.averageRating = reviewsData.averageRating;
				formattedProperty.totalReviews = reviewsData.totalReviews;
			} catch (reviewError) {
				console.warn('Failed to fetch property reviews:', reviewError);
				formattedProperty.reviews = [];
				formattedProperty.averageRating = 0;
				formattedProperty.totalReviews = 0;
			}

			return {
				success: true,
				property: formattedProperty
			};
		} catch (error) {
			console.error('❌ Failed to fetch property:', error);

			// Check if property exists
			if (
				error.reason?.includes('Property does not exist') ||
				error.message?.includes('Property does not exist')
			) {
				return {
					success: false,
					property: null,
					error: 'Property not found'
				};
			}

			throw error;
		}
	}

	// === CHECK IF PROPERTY EXISTS ===
	static async propertyExists(propertyId: number): Promise<boolean> {
		try {
			const result = await this.getProperty(propertyId);
			return result.success && result.property && result.property.productId === propertyId;
		} catch (error) {
			return false;
		}
	}

	// GET user Reviews
	// === GET USER REVIEWS ===
	static async getUserReviews(userAddress?: string) {
		try {
			const address = userAddress || walletState.address;
			if (!address) throw new Error('No address provided');

			console.log('📝 Fetching reviews by user:', address);

			// Get contract with signer
			const signer = await WalletService.getSigner();
			const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

			const result = await contract.getUserReviews(address);
			console.log('📊 Raw user reviews data:', result);

			// Format user reviews
			const formattedReviews = result.map((review, index) => ({
				reviewer: review.reviewer || review[0] || address, // address reviewer
				productId: review.productId ? Number(review.productId) : Number(review[1]), // uint256 productId
				rating: review.rating ? Number(review.rating) : Number(review[2]), // uint256 rating
				comment: review.comment || review[3] || '', // string comment
				likes: review.likes ? Number(review.likes) : Number(review[4]) || 0, // uint256 likes
				index: index,
				shortReviewer: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown',

				// Additional fields
				isMyReview: walletState.address?.toLowerCase() === address.toLowerCase(),
				createdAt: Date.now() - index * 24 * 60 * 60 * 1000, // Fake timestamp for sorting
				ratingStars: '⭐'.repeat(review.rating ? Number(review.rating) : Number(review[2]) || 0)
			}));

			// Get property details for each review
			const reviewsWithPropertyDetails = await Promise.all(
				formattedReviews.map(async (review) => {
					try {
						// Find property in current state first
						let property = propertyState.items.find((p) => p.productId === review.productId);

						if (!property) {
							// If not found, fetch from contract
							const propertyResult = await this.getProperty(review.productId);
							property = propertyResult.success ? propertyResult.property : null;
						}

						return {
							...review,
							propertyTitle: property?.title || `Property #${review.productId}`,
							propertyCategory: property?.category || 'Unknown',
							propertyPrice: property?.price || '0',
							propertyOwner: property?.owner || 'Unknown',
							propertyImage: property?.image || ''
						};
					} catch (error) {
						console.warn(`Failed to fetch property details for review ${review.productId}:`, error);
						return {
							...review,
							propertyTitle: `Property #${review.productId}`,
							propertyCategory: 'Unknown',
							propertyPrice: '0',
							propertyOwner: 'Unknown',
							propertyImage: ''
						};
					}
				})
			);

			// Calculate user review statistics
			const totalReviews = reviewsWithPropertyDetails.length;
			const totalLikes = reviewsWithPropertyDetails.reduce((sum, review) => sum + review.likes, 0);
			const averageRating =
				totalReviews > 0
					? (
							reviewsWithPropertyDetails.reduce((sum, review) => sum + review.rating, 0) /
							totalReviews
						).toFixed(1)
					: '0';

			// Group by rating for statistics
			const ratingDistribution = {
				5: reviewsWithPropertyDetails.filter((r) => r.rating === 5).length,
				4: reviewsWithPropertyDetails.filter((r) => r.rating === 4).length,
				3: reviewsWithPropertyDetails.filter((r) => r.rating === 3).length,
				2: reviewsWithPropertyDetails.filter((r) => r.rating === 2).length,
				1: reviewsWithPropertyDetails.filter((r) => r.rating === 1).length
			};

			console.log(`✅ Fetched ${totalReviews} reviews by user ${address}`);

			return {
				reviews: reviewsWithPropertyDetails,
				reviewStats: {
					totalReviews,
					totalLikes,
					averageRating: parseFloat(averageRating),
					ratingDistribution,
					userAddress: address,
					shortAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
					mostRecentReview: reviewsWithPropertyDetails[0] || null,
					highestRatedReview:
						reviewsWithPropertyDetails.find(
							(r) => r.rating === Math.max(...reviewsWithPropertyDetails.map((r) => r.rating))
						) || null
				},
				success: true
			};
		} catch (error) {
			console.error('❌ Failed to fetch user reviews:', error);
			throw error;
		}
	}

	// === GET CURRENT USER REVIEWS (shorthand) ===
	static async getMyReviews() {
		if (!walletState.address) {
			throw new Error('Wallet not connected');
		}
		return this.getUserReviews(walletState.address);
	}

	// === GET USER REVIEW STATISTICS ONLY ===
	static async getUserReviewStats(userAddress?: string) {
		try {
			const userReviewsData = await this.getUserReviews(userAddress);
			return userReviewsData.reviewStats;
		} catch (error) {
			console.error('❌ Failed to fetch user review stats:', error);
			throw error;
		}
	}

	// === CHECK IF USER HAS REVIEWED PROPERTY ===
	static async hasUserReviewedProperty(propertyId: number, userAddress?: string) {
		try {
			const address = userAddress || walletState.address;
			if (!address) return false;

			const userReviews = await this.getUserReviews(address);
			return userReviews.reviews.some((review) => review.productId === propertyId);
		} catch (error) {
			console.error('❌ Failed to check user review status:', error);
			return false;
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

	// How to read data with events
	// get specific event
	// === GET CONTRACT EVENTS ===
	static async getContractEvents(eventName?: string, fromBlock = 0, toBlock = 'latest') {
		try {
			console.log('📡 Fetching contract events:', { eventName, fromBlock, toBlock });

			// Get contract with provider
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

			// Get events - DÜZELTME
			let events;
			if (eventName) {
				// Specific event
				const filter = contract.filters[eventName]();
				events = await contract.queryFilter(filter, fromBlock, toBlock);
			} else {
				// All events - filter olmadan
				events = await contract.queryFilter({}, fromBlock, toBlock);
			}

			// Format events
			const formattedEvents = events.map((event, index) => {
				try {
					const parsedLog = contract.interface.parseLog(event);

					return {
						eventName: parsedLog.name,
						transactionHash: event.transactionHash,
						blockNumber: event.blockNumber,
						blockHash: event.blockHash,
						transactionIndex: event.transactionIndex,
						logIndex: event.logIndex,
						args: parsedLog.args,
						data: Object.fromEntries(
							parsedLog.fragment.inputs.map((input, i) => [
								input.name,
								parsedLog.args[i]?.toString() || parsedLog.args[i]
							])
						),
						timestamp: null, // Will be filled if needed
						explorerUrl: `https://sepolia.etherscan.io/tx/${event.transactionHash}`
					};
				} catch (parseError) {
					// Eğer log parse edilemezse, raw log'u döndür
					console.warn('Could not parse log:', event, parseError);
					return {
						eventName: 'UnknownEvent',
						transactionHash: event.transactionHash,
						blockNumber: event.blockNumber,
						blockHash: event.blockHash,
						transactionIndex: event.transactionIndex,
						logIndex: event.logIndex,
						args: [],
						data: {},
						timestamp: null,
						explorerUrl: `https://sepolia.etherscan.io/tx/${event.transactionHash}`
					};
				}
			});

			console.log(`✅ Fetched ${formattedEvents.length} events:`, formattedEvents);

			return {
				events: formattedEvents,
				total: formattedEvents.length,
				success: true
			};
		} catch (error) {
			console.error('❌ Failed to fetch contract events:', error);
			throw error;
		}
	}

	// === GET SPECIFIC EVENT TYPES ===
	static async getPropertyListedEvents(fromBlock = 0, toBlock = 'latest') {
		return this.getContractEvents('PropertyListed', fromBlock, toBlock);
	}

	static async getPropertySoldEvents(fromBlock = 0, toBlock = 'latest') {
		return this.getContractEvents('PropertySold', fromBlock, toBlock);
	}

	static async getReviewAddedEvents(fromBlock = 0, toBlock = 'latest') {
		return this.getContractEvents('ReviewAdded', fromBlock, toBlock);
	}

	static async getReviewLikedEvents(fromBlock = 0, toBlock = 'latest') {
		return this.getContractEvents('ReviewLiked', fromBlock, toBlock);
	}

	// === GET USER SPECIFIC EVENTS ===
	static async getUserEvents(userAddress?: string, fromBlock = 0, toBlock = 'latest') {
		try {
			const address = userAddress || walletState.address;
			if (!address) throw new Error('No address provided');

			console.log('👤 Fetching events for user:', address);

			const allEvents = await this.getContractEvents(null, fromBlock, toBlock);

			// Filter events related to the user
			const userEvents = allEvents.events.filter((event) => {
				const data = event.data;

				// Check if user is involved in any way
				return (
					data.owner?.toLowerCase() === address.toLowerCase() ||
					data.oldOwner?.toLowerCase() === address.toLowerCase() ||
					data.newOwner?.toLowerCase() === address.toLowerCase() ||
					data.reviewer?.toLowerCase() === address.toLowerCase() ||
					data.liker?.toLowerCase() === address.toLowerCase()
				);
			});

			console.log(`✅ Found ${userEvents.length} events for user ${address}`);

			return {
				events: userEvents,
				total: userEvents.length,
				userAddress: address,
				success: true
			};
		} catch (error) {
			console.error('❌ Failed to fetch user events:', error);
			throw error;
		}
	}

	// === GET PROPERTY SPECIFIC EVENTS ===
	static async getPropertyEvents(propertyId: number, fromBlock = 0, toBlock = 'latest') {
		try {
			console.log('🏠 Fetching events for property:', propertyId);

			const allEvents = await this.getContractEvents(null, fromBlock, toBlock);

			// Filter events related to the property
			const propertyEvents = allEvents.events.filter((event) => {
				const data = event.data;

				return data.productId === propertyId.toString() || data.productId === propertyId;
			});

			console.log(`✅ Found ${propertyEvents.length} events for property ${propertyId}`);

			return {
				events: propertyEvents,
				propertyId,
				total: propertyEvents.length,
				success: true
			};
		} catch (error) {
			console.error('❌ Failed to fetch property events:', error);
			throw error;
		}
	}

	// === GET RECENT EVENTS (Dashboard için) ===
	static async getRecentEvents(limit = 10) {
		try {
			console.log('🕒 Fetching recent events...');

			// Get events from last 1000 blocks
			const allEvents = await this.getContractEvents(null, -1000, 'latest');

			// Sort by block number (newest first) and limit
			const recentEvents = allEvents.events
				.sort((a, b) => b.blockNumber - a.blockNumber)
				.slice(0, limit);

			console.log(`✅ Fetched ${recentEvents.length} recent events`);

			return {
				events: recentEvents,
				total: recentEvents.length,
				success: true
			};
		} catch (error) {
			console.error('❌ Failed to fetch recent events:', error);
			throw error;
		}
	}

	// === GET TOTAL REVIEWS COUNT ===
	static async getTotalReviews() {
		try {
			console.log('📊 Fetching total reviews count...');

			// Get contract (read-only or with signer)
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

			const totalReviews = await contract.getTotalReviews();
			const count = Number(totalReviews);

			console.log('✅ Total reviews count:', count);

			return {
				totalReviews: count,
				success: true
			};
		} catch (error) {
			console.error('❌ Failed to fetch total reviews count:', error);
			throw error;
		}
	}
}

// getAllProperties
