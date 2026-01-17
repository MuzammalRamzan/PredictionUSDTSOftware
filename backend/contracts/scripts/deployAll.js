const hre = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("DEPLOYMENT STARTING");
  console.log("=".repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  console.log("\nDeploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "BNB");

  console.log("\n" + "=".repeat(60));
  console.log("STEP 1: DEPLOYING USDT TOKEN");
  console.log("=".repeat(60));

  const USDT = await hre.ethers.getContractFactory("USDT");
  const usdt = await USDT.deploy(deployer.address);
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("✅ USDT deployed to:", usdtAddress);

  const usdtBalance = await usdt.balanceOf(deployer.address);
  console.log("   Initial USDT balance:", hre.ethers.formatUnits(usdtBalance, 18), "USDT");

  console.log("\n" + "=".repeat(60));
  console.log("STEP 2: DEPLOYING OCRO TOKEN");
  console.log("=".repeat(60));

  const OCRO = await hre.ethers.getContractFactory("OCRO");
  const ocro = await OCRO.deploy(deployer.address);
  await ocro.waitForDeployment();
  const ocroAddress = await ocro.getAddress();
  console.log("✅ OCRO deployed to:", ocroAddress);

  const ocroBalance = await ocro.balanceOf(deployer.address);
  console.log("   Initial OCRO balance:", hre.ethers.formatUnits(ocroBalance, 18), "OCRO");

  console.log("\n" + "=".repeat(60));
  console.log("STEP 3: DEPLOYING BETTING POOL CONTRACT");
  console.log("=".repeat(60));

  const BettingPool = await hre.ethers.getContractFactory("BettingPool");
  const bettingPool = await BettingPool.deploy(ocroAddress, usdtAddress);
  await bettingPool.waitForDeployment();
  const bettingPoolAddress = await bettingPool.getAddress();
  console.log("✅ BettingPool deployed to:", bettingPoolAddress);

  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("\n📝 CONTRACT ADDRESSES:");
  console.log("   USDT Token:        ", usdtAddress);
  console.log("   OCRO Token:        ", ocroAddress);
  console.log("   Betting Pool:      ", bettingPoolAddress);
  console.log("\n👤 DEPLOYER:");
  console.log("   Address:           ", deployer.address);
  console.log("   Remaining Balance: ", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "BNB");
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETED SUCCESSFULLY ✅");
  console.log("=".repeat(60));

  console.log("\n💾 Save these addresses for your configuration:");
  console.log(JSON.stringify({
    usdt: usdtAddress,
    ocro: ocroAddress,
    bettingPool: bettingPoolAddress,
    deployer: deployer.address
  }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ DEPLOYMENT FAILED:");
    console.error(error);
    process.exit(1);
  });
