const hre = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("DEPLOYMENT STARTING");
  console.log("=".repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  console.log("\nDeploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "BNB");

  // User provided USDT address
  const usdtAddress = "0x246D836ba7F33cb2f20e86A975dAe23A3CBfbc4D";
  console.log("\nUsing existing USDT Token:", usdtAddress);

  console.log("\n" + "=".repeat(60));
  console.log("STEP 1: DEPLOYING BETTING POOL CONTRACT");
  console.log("=".repeat(60));

  const developerAddress = "0x9A85Ea37365Af51583F41F89D75A1733524b4148";
  console.log("Developer Address:", developerAddress);

  const BettingPool = await hre.ethers.getContractFactory("BettingPool");
  // Pass USDT address and Developer address
  const bettingPool = await BettingPool.deploy(usdtAddress, developerAddress);
  await bettingPool.waitForDeployment();
  const bettingPoolAddress = await bettingPool.getAddress();
  console.log("✅ BettingPool deployed to:", bettingPoolAddress);

  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("\n📝 CONTRACT ADDRESSES:");
  console.log("   USDT Token:        ", usdtAddress);
  console.log("   Betting Pool:      ", bettingPoolAddress);
  console.log("\n👤 DEPLOYER:");
  console.log("   Address:           ", deployer.address);
  console.log(
    "   Remaining Balance: ",
    hre.ethers.formatEther(
      await hre.ethers.provider.getBalance(deployer.address),
    ),
    "BNB",
  );
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETED SUCCESSFULLY ✅");
  console.log("=".repeat(60));

  console.log("\n💾 Save these addresses for your configuration:");
  console.log(
    JSON.stringify(
      {
        usdt: usdtAddress,
        bettingPool: bettingPoolAddress,
        deployer: deployer.address,
      },
      null,
      2,
    ),
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ DEPLOYMENT FAILED:");
    console.error(error);
    process.exit(1);
  });
