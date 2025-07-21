// === WALLET STATE ===
export const walletState = $state({
	address: null as string | null,
	isConnected: false,
	network: null as number | null,
	loading: false,
	error: null as string | null
});

// === DERIVED VALUES AS FUNCTIONS ===
export const isWalletReady = () => walletState.isConnected && walletState.network === 11155111;

export const shortAddress = () =>
	walletState.address
		? `${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}`
		: null;

// === ADDITIONAL HELPER FUNCTIONS ===
export const isCorrectNetwork = () => walletState.network === 11155111;

export const networkName = () => {
	switch (walletState.network) {
		case 1:
			return 'Ethereum Mainnet';
		case 11155111:
			return 'Sepolia Testnet';
		case 31337:
			return 'Localhost';
		default:
			return `Chain ID: ${walletState.network}`;
	}
};
