const hre = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("DEPLOYING NEW SYSTEM (USDT + BettingPool)");
  console.log("=".repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  console.log("\nDeploying with account:", deployer.address);

  // 1. Deploy new USDT (6 decimals)
  console.log("\nSTEP 1: DEPLOYING NEW USDT (6 Decimals)...");
  const USDT = await hre.ethers.getContractFactory("USDT");
  const usdtToken = await USDT.deploy(deployer.address);
  await usdtToken.waitForDeployment();
  const usdtAddress = await usdtToken.getAddress();
  console.log("✅ New USDT deployed to:", usdtAddress);
  
  // Verify decimals
  const decimals = await usdtToken.decimals();
  console.log("   Decimals:", decimals.toString());

  // 2. Deploy BettingPool
  console.log("\nSTEP 2: DEPLOYING BETTING POOL...");
  const developerAddress = "0x9A85Ea37365Af51583F41F89D75A1733524b4148"; // Keep same developer address
  const BettingPool = await hre.ethers.getContractFactory("BettingPool");
  const bettingPool = await BettingPool.deploy(usdtAddress, developerAddress);
  await bettingPool.waitForDeployment();
  const bettingPoolAddress = await bettingPool.getAddress();
  console.log("✅ BettingPool deployed to:", bettingPoolAddress);

  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("Update your .env file with:");
  console.log(`USDT_ADDRESS=${usdtAddress}`);
  console.log(`CONTRACT_ADDRESS=${bettingPoolAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
