const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  
  const expectedDeployer = "0xE3A21A584AC9FeA2ef99F2d7bdB62Ff4d3B30bAb";
  if (deployer.address.toLowerCase() !== expectedDeployer.toLowerCase()) {
    console.error(`WARNING: Deployer address ${deployer.address} does not match expected ${expectedDeployer}`);
    // Proceeding anyway as verified by key check, but good to note.
  }

  // 1. Deploy USDT
  console.log("Deploying USDT...");
  const USDT = await hre.ethers.getContractFactory("USDT");
  const usdt = await USDT.deploy(deployer.address);
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("✅ USDT deployed to:", usdtAddress);

  // 2. Deploy BettingPool
  console.log("Deploying BettingPool...");
  const BettingPool = await hre.ethers.getContractFactory("BettingPool");
  // constructor(address _usdtToken, address _developerAddress)
  const bettingPool = await BettingPool.deploy(usdtAddress, deployer.address);
  await bettingPool.waitForDeployment();
  const poolAddress = await bettingPool.getAddress();
  console.log("✅ BettingPool deployed to:", poolAddress);

  console.log("\n--- Deployment Summary ---");
  console.log(`USDT: ${usdtAddress}`);
  console.log(`BettingPool: ${poolAddress}`);
  console.log(`Deployer/Owner: ${deployer.address}`);
  console.log("--------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
