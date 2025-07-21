const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying RealEstate Contract...");

  const network = await hre.ethers.provider.getNetwork();
  console.log(
    "📡 Network:",
    network.name,
    "Chain ID:",
    Number(network.chainId)
  );

  // Deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Contract factory
  const MyContract = await hre.ethers.getContractFactory("MyContract");

  console.log("⏳ Deploying contract...");

  // Deploy
  const realEstate = await MyContract.deploy();

  console.log("⏳ Waiting for deployment confirmation...");
  await realEstate.waitForDeployment();

  const contractAddress = await realEstate.getAddress();

  console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("===============================");
  console.log("📍 Contract Address:", contractAddress);
  console.log(
    "🔍 Etherscan:",
    `https://sepolia.etherscan.io/address/${contractAddress}`
  );
  console.log("===============================");

  const propertyIndex = await realEstate.propertyIndex();
  console.log("✅ Initial Property Index:", propertyIndex.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deploy failed:", error);
    process.exit(1);
  });
