const hre = require("hardhat");

async function main() {
  const usdtAddress = process.env.USDT_ADDRESS;
  
  if (!usdtAddress) {
      console.error("Please provide USDT_ADDRESS env var");
      process.exit(1);
  }

  console.log("Checking USDT address:", usdtAddress);
  
  const code = await hre.ethers.provider.getCode(usdtAddress);
  console.log("Code at address:", code.slice(0, 50) + "...");

  if (code === "0x") {
      console.error("❌ ERROR: No code at USDT address!");
  } else {
      console.log("✅ Code found at USDT address.");
      
      // Try to call balanceOf
      const USDT = await hre.ethers.getContractFactory("USDT");
      const usdt = USDT.attach(usdtAddress);
      
      try {
          // Use a random address or the zero address to check if call works
          const balance = await usdt.balanceOf("0x0000000000000000000000000000000000000000");
          console.log("✅ balanceOf call successful. Balance:", balance.toString());
      } catch (e) {
          console.error("❌ balanceOf call failed:", e.message);
      }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
