const hre = require("hardhat");

async function main() {
  const usdtAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const userAddress = "0xE3A21A584AC9FeA2ef99F2d7bdB62Ff4d3B30bAb";

  console.log(`Checking balance of ${userAddress} on USDT ${usdtAddress}`);

  const USDT = await hre.ethers.getContractAt("USDT", usdtAddress);
  
  try {
    const balance = await USDT.balanceOf(userAddress);
    console.log("Balance call successful!");
    console.log("Balance:", balance.toString());
  } catch (error) {
    console.error("Balance call FAILED:", error);
  }
}

main().catch(console.error);
