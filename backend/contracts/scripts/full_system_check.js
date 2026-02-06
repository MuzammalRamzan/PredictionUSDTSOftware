const hre = require("hardhat");

async function main() {
  const usdtAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const poolAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const userAddress = "0xE3A21A584AC9FeA2ef99F2d7bdB62Ff4d3B30bAb";

  console.log("Starting System Health Check...");

  // Impersonate User
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [userAddress],
  });
  const userSigner = await hre.ethers.getSigner(userAddress);
  
  // Fund User with ETH for gas (if needed)
  const [deployer] = await hre.ethers.getSigners();
  await deployer.sendTransaction({
    to: userAddress,
    value: hre.ethers.parseEther("1.0")
  });

  const USDT = await hre.ethers.getContractAt("USDT", usdtAddress, userSigner);
  const Pool = await hre.ethers.getContractAt("BettingPool", poolAddress, userSigner);

  // 1. Check Owner
  const owner = await Pool.owner();
  console.log(`Contract Owner: ${owner}`);
  if (owner.toLowerCase() !== userAddress.toLowerCase()) {
    console.error("User is NOT owner! createQuestion will fail.");
    return;
  }

  // 2. Create Question
  console.log("Creating Question...");
  // Use a unique title to verify
  const deadline = Math.floor(Date.now() / 1000) + 3600;
  const tx1 = await Pool.createQuestion("Health Check Question", deadline, 2);
  await tx1.wait();
  console.log("✅ Question Created");

  // 3. Approve USDT
  console.log("Approving USDT...");
  const tx2 = await USDT.approve(poolAddress, hre.ethers.parseEther("100"));
  await tx2.wait();
  console.log("✅ USDT Approved");

  // 4. Place Bet
  console.log("Placing Bet...");
  // Bet 10 USDT
  const tx3 = await Pool.placeBet(0, 0, hre.ethers.parseEther("10"));
  await tx3.wait();
  console.log("✅ Bet Placed");

  console.log("System Health Check PASSED!");
}

main().catch(console.error);
