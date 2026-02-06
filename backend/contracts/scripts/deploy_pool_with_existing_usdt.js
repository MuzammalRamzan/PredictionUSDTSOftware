const hre = require("hardhat");

async function main() {
  const usdtAddress = "0x7026eC8ed277Ae6dda4628357cE2885423b9B3ce"; // User provided address
  const developerAddress = "0x9A85Ea37365Af51583F41F89D75A1733524b4148";

  console.log("Deploying BettingPool with existing USDT:", usdtAddress);

  const BettingPool = await hre.ethers.getContractFactory("BettingPool");
  const bettingPool = await BettingPool.deploy(usdtAddress, developerAddress);
  await bettingPool.waitForDeployment();
  const bettingPoolAddress = await bettingPool.getAddress();

  console.log("✅ BettingPool deployed to:", bettingPoolAddress);
  console.log("Using USDT:", usdtAddress);
  
  // Output for the update script
  console.log(`\n::EXPORT::CONTRACT_ADDRESS=${bettingPoolAddress}`);
  console.log(`::EXPORT::USDT_ADDRESS=${usdtAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
