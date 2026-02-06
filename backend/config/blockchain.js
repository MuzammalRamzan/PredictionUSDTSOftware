import { ethers } from 'ethers';
import dotenv from 'dotenv';
import BettingPoolABI from './BettingPoolABI.json' with { type: 'json' };

dotenv.config();

const RPC_URL = process.env.NETWORK === 'localhost'
  ? 'http://127.0.0.1:8545/'
  : process.env.NETWORK === 'mainnet'
  ? process.env.BSC_RPC_URL
  : process.env.BSC_TESTNET_RPC_URL;

let provider = null;

if (RPC_URL) {
  provider = new ethers.JsonRpcProvider(RPC_URL);
  console.log('Blockchain provider initialized');
} else {
  console.warn('Blockchain not configured - blockchain sync features will be unavailable');
}

export { provider };

export const getContract = () => {
  if (!provider) {
    throw new Error('Blockchain provider not configured. Please set RPC_URL in .env');
  }
  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured. Please set CONTRACT_ADDRESS in .env');
  }
  return new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    BettingPoolABI,
    provider
  );
};

export default {
  provider,
  getContract
};
