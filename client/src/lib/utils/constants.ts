export const CONTRACT_ADDRESS = '0x05F3883541C6eb62a961bD914c388D50A783A41a';

export const CONTRACT_ABI = [
	'function listProperty(address,uint256,string,string,string,string,string) external returns (uint256)',
	'function getAllProperties() public view returns (tuple(uint256,address,uint256,string,string,string,string,string,address[],string[])[])',
	'function buyProperty(uint256,address) external payable',
	'function getUserProperties(address) external view returns (tuple(uint256,address,uint256,string,string,string,string,string,address[],string[])[])',
	'function getProperty(uint256) external view returns (uint256,address,uint256,string,string,string,string,string)', // ← Bu satır önemli
	'function updateProperty(address,uint256,string,string,string,string,string) external returns (uint256)',
	'function updatePrice(address,uint256,uint256) external returns (string)',
	'function addReview(uint256,uint256,string,address) external',
	'function getProductReviews(uint256) external view returns (tuple(address,uint256,uint256,string,uint256)[])',
	'function getUserReviews(address) external view returns (tuple(address,uint256,uint256,string,uint256)[])',
	'function likeReview(uint256,uint256,address) external',
	'function getHighestRatedProduct() external view returns (uint256)',
	'event PropertyListed(uint256 indexed productId, address indexed owner, uint256 price)',
	'event PropertySold(uint256 indexed productId, address indexed oldOwner, address indexed newOwner, uint256 price)',
	'event ReviewAdded(uint256 indexed productId, address indexed reviewer, uint256 rating, string comment)',
	'event ReviewLiked(uint256 indexed productId, uint256 indexed reviewIndex, address indexed liker, uint256 likes)'
];
export const NETWORKS = {
	SEPOLIA: 11155111,
	MAINNET: 1,
	LOCALHOST: 31337
};

export const SUPPORTED_NETWORKS = [NETWORKS.SEPOLIA];
