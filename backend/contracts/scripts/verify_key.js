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
  
  const requestedAddress = "0xE3A21A584AC9FeA2ef99F2d7bdB62Ff4d3B30bAb";
  
  if (wallet.address.toLowerCase() === requestedAddress.toLowerCase()) {
    console.log("MATCH: The private key belongs to the requested address.");
  } else {
    console.log("MISMATCH: The private key does NOT belong to the requested address.");
  }
}

main().catch(console.error);
