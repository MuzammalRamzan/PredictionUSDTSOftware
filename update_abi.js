const fs = require('fs');
const path = require('path');

const artifactPath = path.join(__dirname, 'backend/contracts/artifacts/contracts/BettingPool.sol/BettingPool.json');
const frontendConfigPath = path.join(__dirname, 'frontend/src/config/BettingPoolABI.json');

try {
  if (!fs.existsSync(artifactPath)) {
    console.error(`Artifact not found at ${artifactPath}`);
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abi = artifact.abi;
  
  // Ensure directory exists
  const dir = path.dirname(frontendConfigPath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(frontendConfigPath, JSON.stringify(abi, null, 2));
  console.log('Successfully updated BettingPoolABI.json');
} catch (error) {
  console.error('Error updating ABI:', error);
  process.exit(1);
}
