import { WalletService } from './web3.svelte.js';

// Re-exports for easy importing
export { walletState, isWalletReady, shortAddress } from './stores/walletStore.svelte.js';
export { WalletService } from './services/walletService.js';
export { CONTRACT_ADDRESS, CONTRACT_ABI, NETWORKS } from './utils/constants.js';

// Convenience exports
export const connectWallet = () => WalletService.connect();
export const disconnectWallet = () => WalletService.disconnect();
export const checkWalletConnection = () => WalletService.checkConnection();
