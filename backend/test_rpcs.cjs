const ethers = require('ethers');

const rpcUrls = [
  "https://data-seed-prebsc-1-s1.binance.org:8545/",
  "https://bsc-testnet.publicnode.com",
  "https://data-seed-prebsc-2-s1.binance.org:8545/",
  "https://tbagathon.rw.rpc.pool.binance.com",
];

async function checkRpc(url) {
  try {
    // reduce timeout to fail faster
    const provider = new ethers.JsonRpcProvider(url, undefined, { staticNetwork: true });
    // basic fetch check first
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ ${url} is UP (Block: ${blockNumber})`);
    return true;
  } catch (error) {
    console.log(`❌ ${url} is DOWN (${error.message.slice(0, 50)}...)`);
    return false;
  }
}

async function main() {
  console.log("Checking BSC Testnet RPCs...");
  const results = await Promise.all(rpcUrls.map(checkRpc));
  const workingCount = results.filter(r => r).length;
  console.log(`\nSummary: ${workingCount}/${rpcUrls.length} RPCs are working.`);
}

main();
