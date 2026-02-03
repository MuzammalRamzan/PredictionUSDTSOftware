const hre = require("hardhat");

async function main() {
  console.log("Deploying BettingPool contract to BSC...");

  const network = hre.network.name;
  console.log(`Network: ${network}`);

  let ftrTokenAddress;
  let usdtTokenAddress;

  if (network === "bscTestnet") {
    console.log("\nUsing BSC Testnet tokens...");
    ftrTokenAddress = process.env.FTR_TOKEN_ADDRESS_TESTNET;
    usdtTokenAddress = process.env.USDT_TOKEN_ADDRESS_TESTNET;
  } else if (network === "bscMainnet") {
    console.log("\nUsing BSC Mainnet tokens...");
    ftrTokenAddress = process.env.FTR_TOKEN_ADDRESS;
    usdtTokenAddress = process.env.USDT_TOKEN_ADDRESS;
  } else {
    throw new Error("Unsupported network. Use bscTestnet or bscMainnet");
  }

  if (!ftrTokenAddress || !usdtTokenAddress) {
    throw new Error("Token addresses not configured in .env file");
  }

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
  console.log(`\nBettingPool deployed to: ${contractAddress}`);

  console.log("\n✅ Deployment completed!");
  console.log("\nIMPORTANT: Update your .env file with:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);

  console.log("\n📋 Next steps:");
  console.log("1. Update backend/.env with the contract address");
  console.log("2. Verify the contract on BSCScan (optional):");
  console.log(
    `   npx hardhat verify --network ${network} ${contractAddress} ${ftrTokenAddress} ${usdtTokenAddress}`,
  );
  console.log("3. Test the contract by creating a question");
  console.log("4. Make sure users approve token spending before betting");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
