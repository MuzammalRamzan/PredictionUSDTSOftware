import { ethers } from 'ethers';
import dotenv from 'dotenv';
import BettingPoolABI from './BettingPoolABI.json' with { type: 'json' };

dotenv.config();

const RPC_URL = process.env.NETWORK === 'mainnet'
  ? process.env.BSC_RPC_URL
  : process.env.BSC_TESTNET_RPC_URL;

if (!RPC_URL) {
  throw new Error('RPC URL not configured');
}

export const provider = new ethers.JsonRpcProvider(RPC_URL);

export const getContract = () => {
  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }
  return new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    BettingPoolABI,
    provider
  );
};


export const OCRO_TOKEN_ADDRESS = process.env.NETWORK === 'mainnet'
  ? process.env.OCRO_TOKEN_ADDRESS
  : process.env.OCRO_TOKEN_ADDRESS_TESTNET;

export const USDT_TOKEN_ADDRESS = process.env.NETWORK === 'mainnet'
  ? process.env.USDT_TOKEN_ADDRESS
  : process.env.USDT_TOKEN_ADDRESS_TESTNET;

export default {
  provider,
  getContract,
  OCRO_TOKEN_ADDRESS,
  USDT_TOKEN_ADDRESS
};
