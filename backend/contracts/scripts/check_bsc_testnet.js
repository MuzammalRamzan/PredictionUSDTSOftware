const hre = require("hardhat");

async function main() {
  const contractAddress = "0x929698E5aB19E6dF118B807c97958a66Fd618464"; // From .env
  const usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // From .env
  
  console.log(`Checking BSC Testnet contracts...`);
  console.log(`Pool Address: ${contractAddress}`);
  console.log(`USDT Address: ${usdtAddress}`);

  try {
    const codePool = await hre.ethers.provider.getCode(contractAddress);
    console.log(`Pool Contract Code: ${codePool === "0x" ? "EMPTY (Not Deployed)" : "EXISTS"}`);

    const codeUsdt = await hre.ethers.provider.getCode(usdtAddress);
    console.log(`USDT Contract Code: ${codeUsdt === "0x" ? "EMPTY (Not Deployed)" : "EXISTS"}`);

  } catch (error) {
    console.error("Error connecting to BSC Testnet:", error);
  }
}

main().catch(console.error);
