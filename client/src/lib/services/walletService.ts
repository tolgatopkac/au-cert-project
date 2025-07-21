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
}
