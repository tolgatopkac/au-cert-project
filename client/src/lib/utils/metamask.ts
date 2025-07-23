export interface MetaMaskStatus {
	isInstalled: boolean;
	isAvailable: boolean;
	error?: string;
}

export function checkMetaMask(): MetaMaskStatus {
	// Server-side check
	if (typeof window === 'undefined') {
		return { isInstalled: false, isAvailable: false, error: 'Server-side rendering' };
	}

	// MetaMask check
	if (typeof window.ethereum === 'undefined') {
		return {
			isInstalled: false,
			isAvailable: false,
			error: 'MetaMask extension not found'
		};
	}

	// MetaMask available but may not be connected
	return { isInstalled: true, isAvailable: true };
}

export function getMetaMaskInstallUrl(): string {
	const userAgent = navigator.userAgent;

	if (userAgent.includes('Chrome')) {
		return 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn';
	} else if (userAgent.includes('Firefox')) {
		return 'https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/';
	} else if (userAgent.includes('Edge')) {
		return 'https://microsoftedge.microsoft.com/addons/detail/metamask/ejbalbakoplchlghecdalmeeeajnimhm';
	}

	return 'https://metamask.io/download/';
}
