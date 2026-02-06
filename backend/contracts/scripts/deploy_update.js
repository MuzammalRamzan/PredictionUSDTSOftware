const hre = require("hardhat");

async function main() {
  console.log("Deploying BettingPool V2 contract...");

  const network = hre.network.name;
  console.log(`Network: ${network}`);

  const usdtTokenAddress = "0x246D836ba7F33cb2f20e86A975dAe23A3CBfbc4D"; // BSC Testnet USDT (Corrected from debug)

  console.log("Deploying updated BettingPool...");
  console.log("USDT Token:", usdtTokenAddress);

  const developerAddress = "0x9A85Ea37365Af51583F41F89D75A1733524b4148";
  console.log("Developer Address:", developerAddress);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`\nDeploying with account: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${hre.ethers.formatEther(balance)} BNB`);

  const BettingPool = await hre.ethers.getContractFactory("BettingPool");
  const bettingPool = await BettingPool.deploy(
    usdtTokenAddress,
    developerAddress,
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
