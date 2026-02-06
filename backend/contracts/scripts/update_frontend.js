const fs = require('fs');
const path = require('path');

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const usdtAddress = process.env.USDT_ADDRESS;

  if (!contractAddress || !usdtAddress) {
    console.error("Please provide CONTRACT_ADDRESS and USDT_ADDRESS env vars");
    process.exit(1);
  }

  // 1. Update ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/BettingPool.sol/BettingPool.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abiPath = path.join(__dirname, "../../../frontend/src/config/BettingPoolABI.json");
  
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log(`Updated ABI at ${abiPath}`);

  // 2. Update .env in frontend
  const envPath = path.join(__dirname, "../../../frontend/.env");
  const envContent = `VITE_CONTRACT_ADDRESS=${contractAddress}
VITE_USDT_TOKEN_ADDRESS=${usdtAddress}
VITE_NETWORK=localhost
`;

  fs.writeFileSync(envPath, envContent);
  console.log(`Updated .env at ${envPath}`);
}

main();
