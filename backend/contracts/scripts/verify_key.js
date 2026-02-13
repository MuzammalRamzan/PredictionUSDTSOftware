const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const envPrivateKey = process.env.PRIVATE_KEY;
  if (!envPrivateKey) {
    console.error("No PRIVATE_KEY found in .env");
    return;
  }

  const wallet = new hre.ethers.Wallet(envPrivateKey);
  console.log(`Private Key Address: ${wallet.address}`);

  const requestedAddress = (
    process.env.ADMIN_ADDRESSES || "0x2686AD7C841A81170b8b2DC3D747682D1dbbE63b"
  )
    .split(",")[0]
    .trim();

  if (wallet.address.toLowerCase() === requestedAddress.toLowerCase()) {
    console.log("MATCH: The private key belongs to the requested address.");
  } else {
    console.log(
      "MISMATCH: The private key does NOT belong to the requested address.",
    );
  }
}

main().catch(console.error);
