const hre = require("hardhat");

async function main() {
  const usdtAddress = process.env.USDT_ADDRESS;
  const userAddress = (
    process.env.ADMIN_ADDRESSES || "0x2686AD7C841A81170b8b2DC3D747682D1dbbE63b"
  )
    .split(",")[0]
    .trim();

  if (!usdtAddress) {
    console.error("Please set USDT_ADDRESS env var");
    process.exit(1);
  }

  console.log(`Funding user ${userAddress} with Mock USDT at ${usdtAddress}`);

  const USDT = await hre.ethers.getContractFactory("USDT");
  const usdt = USDT.attach(usdtAddress);

  // Mint tokens to user
  // Since we are using a Mock USDT that inherits from ERC20, we can likely mint if we are owner
  // Or we can just transfer from the deployer (who has 10M tokens)

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await usdt.balanceOf(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatUnits(balance, 18));

  const amountToTransfer = hre.ethers.parseUnits("1000", 18);

  const tx = await usdt.transfer(userAddress, amountToTransfer);
  console.log("Transfer tx sent:", tx.hash);
  await tx.wait();

  const newBalance = await usdt.balanceOf(userAddress);
  console.log(
    "✅ User funded! New Balance:",
    hre.ethers.formatUnits(newBalance, 18),
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
