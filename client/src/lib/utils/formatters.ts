// ETH değerlerini güzel formatla
export function formatEthValue(value: string | number, decimals = 3): string {
	const num = parseFloat(value.toString());

	// NaN kontrolü
	if (isNaN(num)) return '0';

	// Çok küçük değerler için
	if (num === 0) return '0';
	if (num < 0.001) return '< 0.001';

	// Normal formatla
	return num.toFixed(decimals);
}

// Para formatı (binlik ayırıcı ile)
export function formatEthDisplay(value: string | number): string {
	const formatted = formatEthValue(value);

	// Binlik ayırıcı ekle
	return parseFloat(formatted).toLocaleString('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 3
	});
}

// Kompakt format (büyük sayılar için)
export function formatEthCompact(value: string | number): string {
	const num = parseFloat(value.toString());

	if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
	if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
	if (num < 0.001) return '< 0.001';

	return num.toFixed(3);
}
