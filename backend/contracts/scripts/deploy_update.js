const hre = require("hardhat");

async function main() {
  console.log("Deploying BettingPool V2 contract...");

  const network = hre.network.name;
  console.log(`Network: ${network}`);

  // User provided addresses
  const ftrTokenAddress = "0x33b6745987a1f40F9cb9900d913a016154dd6Eb4";
  const usdtTokenAddress = "0x246D836ba7F33cb2f20e86A975dAe23A3CBfbc4D";

  console.log(`FTR Token: ${ftrTokenAddress}`);
  console.log(`USDT Token: ${usdtTokenAddress}`);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`\nDeploying with account: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${hre.ethers.formatEther(balance)} BNB`);

  const BettingPool = await hre.ethers.getContractFactory("BettingPool");
  const bettingPool = await BettingPool.deploy(
    ftrTokenAddress,
    usdtTokenAddress,
  );

  await bettingPool.waitForDeployment();

  const contractAddress = await bettingPool.getAddress();
  console.log(`\nBettingPool V2 deployed to: ${contractAddress}`);

  console.log("\n✅ Deployment completed!");
  console.log("\nIMPORTANT: Update your .env file with:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
