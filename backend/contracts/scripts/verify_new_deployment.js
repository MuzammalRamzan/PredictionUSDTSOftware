const hre = require("hardhat");

async function main() {
  const poolAddress = "0xCFA78D7e30d3fDD5fa7394E1A5dc5A18d974993e"; // New Address
  const usdtAddress = "0x37EbC4B2E56F027104B8B978F15921dF4446EF94"; // New Address
  
  console.log(`Checking New BSC Testnet contracts...`);
  console.log(`Pool Address: ${poolAddress}`);
  console.log(`USDT Address: ${usdtAddress}`);

  try {
    const codePool = await hre.ethers.provider.getCode(poolAddress);
    console.log(`Pool Contract Code: ${codePool === "0x" ? "EMPTY (Not Deployed)" : "EXISTS"}`);

    const codeUsdt = await hre.ethers.provider.getCode(usdtAddress);
    console.log(`USDT Contract Code: ${codeUsdt === "0x" ? "EMPTY (Not Deployed)" : "EXISTS"}`);

  } catch (error) {
    console.error("Error connecting to BSC Testnet:", error);
  }
}

main().catch(console.error);
