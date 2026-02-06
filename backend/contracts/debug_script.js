const {ethers} = require("hardhat");

async function main() {
  const usdtAddress = "0x246D836ba7F33cb2f20e86A975dAe23A3CBfbc4D";
  const userAddress = "0xE3A21A584AC9FeA2ef99F2d7bdB62Ff4d3B30bAb";
  const spenderAddress = "0x0647DA0188954dC250B16C087021CE2143477Dae"; // BettingPool V2

  console.log("\n--- Debugging Round 4: Token Behavior ---");

  // Define two interfaces: Standard and Non-Standard (void return)
  const abiStandard = [
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  ];
  const abiNonStandard = [
    "function transferFrom(address from, address to, uint256 amount) external",
  ];

  const provider = ethers.provider;

  const amount = ethers.parseUnits("1", 18);
  const token = new ethers.Contract(usdtAddress, abiStandard, provider);

  // Encode call
  const data = token.interface.encodeFunctionData("transferFrom", [
    userAddress,
    spenderAddress,
    amount,
  ]);

  // We need to simulate this call from the SPENDER (BettingPool)?
  // No, usually BettingPool calls it.
  // Wait, `transferFrom(sender, recipient, amount)`.
  // If BettingPool calls it: msg.sender = BettingPool.
  // We can simulate a call where `from` = BettingPool.

  const tx = {
    to: usdtAddress,
    from: spenderAddress, // Simulate BettingPool calling the token
    data: data,
  };

  try {
    console.log("Simulating transferFrom...");
    const result = await provider.call(tx);
    console.log("Result (Hex):", result);

    if (result === "0x") {
      console.error("CRITICAL: Token returned EMPTY data (0x)!");
      console.error(
        "The BettingPool expects 'returns (bool)', so this causes a revert.",
      );
    } else if (
      result ===
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    ) {
      console.log("Token returned TRUE (Standard ERC20).");
    } else {
      console.log("Token returned:", result);
    }
  } catch (e) {
    console.error("Simulation failed:", e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
