# 🏢 PropChain - Decentralized Real Estate Marketplace

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://propchain-frontend-nukdfawi2a-uc.a.run.app/)
[![Contract](https://img.shields.io/badge/Contract-Sepolia-blue)](https://sepolia.etherscan.io/address/0xa75650BD4A021dBDB9aEb82Ac6Adc917712067e6)
[![Built with Svelte](https://img.shields.io/badge/Built%20with-Svelte%205-orange)](https://svelte.dev/)
[![Powered by Hardhat](https://img.shields.io/badge/Powered%20by-Hardhat-yellow)](https://hardhat.org/)

## 🌟 **About The Project**

PropChain is a decentralized real estate marketplace built on Ethereum blockchain that revolutionizes property transactions through smart contracts. Users can securely list, buy, and review properties while ensuring transparency and eliminating intermediaries.

**🚀 Live Demo:** [https://propchain-frontend-nukdfawi2a-uc.a.run.app/](https://propchain-frontend-nukdfawi2a-uc.a.run.app/)

**📋 Smart Contract:** [`0xa75650BD4A021dBDB9aEb82Ac6Adc917712067e6`](https://sepolia.etherscan.io/address/0xa75650BD4A021dBDB9aEb82Ac6Adc917712067e6)

---

## 🛠️ **Tech Stack**

### **Blockchain Layer**

- **Solidity ^0.8.28** - Smart Contract Development
- **Hardhat** - Development Environment & Testing
- **Ethers.js v6** - Blockchain Interaction Library
- **Sepolia Testnet** - Deployment Network

### **Frontend Layer**

- **Svelte 5** - Modern Reactive Framework with Runes
- **SvelteKit** - Full-Stack Web Framework
- **TypeScript** - Type Safety & Developer Experience
- **TailwindCSS** - Utility-First Styling
- **Vite** - Lightning Fast Build Tool

### **DevOps & Deployment**

- **Docker** - Application Containerization
- **Google Cloud Run** - Serverless Container Platform
- **Google Container Registry** - Image Storage

---

## ✨ **Key Features**

### **🏠 Property Management**

- **Create Listings** - List properties with detailed information
- **Update Properties** - Modify price and property details
- **Secure Transactions** - Blockchain-powered buying/selling
- **Portfolio Tracking** - Monitor owned properties and investments

### **⭐ Review & Rating System**

- **Property Reviews** - Leave detailed feedback and ratings
- **5-Star Rating** - Comprehensive rating system
- **Review Interactions** - Like and engage with reviews
- **Top Rated Properties** - Discover highest-rated listings

### **🔐 Web3 Integration**

- **MetaMask Connection** - Seamless wallet integration
- **Network Detection** - Automatic Sepolia network handling
- **Account Management** - Real-time account switching
- **Transaction Tracking** - Monitor blockchain transactions

### **📊 Analytics & Insights**

- ✅ **User Dashboard** - Comprehensive statistics and metrics
- ✅ **Portfolio Valuation** - Real-time property value calculation
- ✅ **Advanced Filtering** - Search and filter properties
- ✅ **Responsive Design** - Mobile-first user experience
  Use Cases & User Scenarios\*\*

### **🏡 Property Seller (Alice)**

1. **Onboard:** Connects MetaMask wallet to the platform
2. **List:** Creates listing for 3-bedroom house at $250,000
3. **Manage:** Updates property details and adjusts pricing
4. **Sell:** Receives secure payment through smart contract
5. **Track:** Monitors portfolio performance on dashboard

### **🏠 Property Buyer (Bob)**

1. **Explore:** Browses available properties with advanced filters
2. **Research:** Reviews property details and user feedback
3. **Purchase:** Makes secure payment via smart contract
4. **Review:** Leaves rating and review for purchased property

### **⭐ Platform User (Carol)**

1. **Discover:** Finds top-rated properties in desired area
2. **Engage:** Likes helpful reviews and follows market trends
3. **Analyze:** Compares prices and property features
4. **Invest:** Makes informed decisions based on community feedback

---

## 🚀 **Getting Started**

### **Prerequisites**

- **Node.js 18+** - JavaScript runtime
- **MetaMask** - Web3 wallet browser extension
- **Sepolia ETH** - Test tokens for transactions
- **Git** - Version control system

### **1. Clone Repository**

```bash
git clone https://github.com/your-username/propchain.git
cd propchain
```

### **2. Smart Contract Setup**

```bash
cd blockchain

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run comprehensive tests
npx hardhat test

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

### **3. Frontend Development**

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### **4. Environment Configuration**

Create `blockchain/.env`:

```env
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_wallet_private_key
```

### **5. MetaMask Setup**

1. Install MetaMask browser extension
2. Add Sepolia testnet:
   - **Network Name:** Sepolia
   - **RPC URL:** https://sepolia.infura.io/v3/YOUR_KEY
   - **Chain ID:** 11155111
   - **Currency Symbol:** ETH
3. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

---

## 🔗 **Links & Resources**

- **🌐 Live Application:** [PropChain Platform](https://propchain-frontend-nukdfawi2a-uc.a.run.app/)
- **📜 Smart Contract:** [Sepolia Etherscan](https://sepolia.etherscan.io/address/0xa75650BD4A021dBDB9aEb82Ac6Adc917712067e6)
- **📚 Documentation:** [Developer Docs](/docs)
- **🔧 API Reference:** [Contract ABI](/blockchain/artifacts)
- **💰 Get Test ETH:** [Google Web3 Faucet](https://cloud.google.com/application/web3/faucet)

## 🙏 **Acknowledgments**

- **[Alchemy](https://alchemy.com/)** - Blockchain infrastructure and education
- **[Svelte](https://svelte.dev/)** - Revolutionary frontend framework
- **[Hardhat](https://hardhat.org/)** - Ethereum development environment
- **[Ethers.js](https://ethers.org/)** - Ethereum interaction library
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Google Cloud](https://cloud.google.com/)** - Cloud infrastructure
