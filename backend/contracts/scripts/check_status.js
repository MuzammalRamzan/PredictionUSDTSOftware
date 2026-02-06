const hre = require("hardhat");

async function main() {
  const usdtCurrent = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const poolCurrent = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const userRequested = "0x7026eC8ed277Ae6dda4628357cE2885423b9B3ce"; 

  console.log("Checking code at addresses...");

  const codeUsdt = await hre.ethers.provider.getCode(usdtCurrent);
  console.log(`Current USDT Env (${usdtCurrent}): ${codeUsdt === "0x" ? "EMPTY" : "EXISTS"}`);

  const codePool = await hre.ethers.provider.getCode(poolCurrent);
  console.log(`Current Pool Env (${poolCurrent}): ${codePool === "0x" ? "EMPTY" : "EXISTS"}`);

  const codeUser = await hre.ethers.provider.getCode(userRequested);
  console.log(`User Requested (${userRequested}): ${codeUser === "0x" ? "EMPTY" : "EXISTS"}`);
}

main().catch(console.error);
