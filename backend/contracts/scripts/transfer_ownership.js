const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const newOwner = "0x2686AD7C841A81170b8b2DC3D747682D1dbbE63b"; // User's address

  if (!contractAddress) {
    console.error("Please set CONTRACT_ADDRESS env var");
    process.exit(1);
  }

  console.log(`Transferring ownership of BettingPool at ${contractAddress}`);
  console.log(`From: Current Owner (Deployer)`);
  console.log(`To:   ${newOwner}`);

  const BettingPool = await hre.ethers.getContractFactory("BettingPool");
  const contract = BettingPool.attach(contractAddress);

  // Check current owner
  const currentOwner = await contract.owner();
  console.log("Current contract owner:", currentOwner);

  if (currentOwner.toLowerCase() === newOwner.toLowerCase()) {
    console.log("User is already the owner. No action needed.");
    return;
  }

  // Transfer ownership
  const tx = await contract.setOwnerAddress(newOwner);
  console.log("Transaction sent:", tx.hash);
  await tx.wait();

  console.log("✅ Ownership transferred successfully!");
  console.log("New contract owner:", await contract.owner());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
