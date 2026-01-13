import { ethers } from 'ethers';
import BettingPoolABI from '../config/BettingPoolABI.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const OCRO_TOKEN_ADDRESS = import.meta.env.VITE_OCRO_TOKEN_ADDRESS;
const USDT_TOKEN_ADDRESS = import.meta.env.VITE_USDT_TOKEN_ADDRESS;

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)',
  'function balanceOf(address account) public view returns (uint256)',
];

export const web3Service = {
  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const expectedChainId = import.meta.env.VITE_NETWORK === 'mainnet' ? '0x38' : '0x61';

    if (chainId !== expectedChainId) {
      const networkName = import.meta.env.VITE_NETWORK === 'mainnet' ? 'BSC Mainnet' : 'BSC Testnet';
      throw new Error(`Please switch to ${networkName}`);
    }

    return accounts[0];
  },

  async getProvider() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    return new ethers.BrowserProvider(window.ethereum);
  },

  async getSigner() {
    const provider = await this.getProvider();
    return provider.getSigner();
  },

  async getContract() {
    const signer = await this.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, BettingPoolABI, signer);
  },

  async getTokenContract(tokenAddress) {
    const signer = await this.getSigner();
    return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  },

  async approveTokens() {
    const ocroToken = await this.getTokenContract(OCRO_TOKEN_ADDRESS);
    const usdtToken = await this.getTokenContract(USDT_TOKEN_ADDRESS);

    const amount = ethers.parseEther('1');

    const ocroTx = await ocroToken.approve(CONTRACT_ADDRESS, amount);
    await ocroTx.wait();

    const usdtTx = await usdtToken.approve(CONTRACT_ADDRESS, amount);
    await usdtTx.wait();

    return true;
  },

  async checkApprovals(userAddress) {
    const ocroToken = await this.getTokenContract(OCRO_TOKEN_ADDRESS);
    const usdtToken = await this.getTokenContract(USDT_TOKEN_ADDRESS);

    const ocroAllowance = await ocroToken.allowance(userAddress, CONTRACT_ADDRESS);
    const usdtAllowance = await usdtToken.allowance(userAddress, CONTRACT_ADDRESS);

    const requiredAmount = ethers.parseEther('1');

    return {
      ocroApproved: ocroAllowance >= requiredAmount,
      usdtApproved: usdtAllowance >= requiredAmount,
    };
  },

  async placeBet(questionId, outcome) {
    const contract = await this.getContract();
    const tx = await contract.placeBet(questionId, outcome === 'yes');
    const receipt = await tx.wait();
    return receipt.hash;
  },

  async withdrawWinnings(questionId) {
    const contract = await this.getContract();
    const tx = await contract.withdrawWinnings(questionId);
    const receipt = await tx.wait();
    return receipt.hash;
  },

  async calculateWinnings(questionId, userAddress) {
    const contract = await this.getContract();
    const [ocroWinnings, usdtWinnings] = await contract.calculateWinnings(questionId, userAddress);
    return {
      ocro: ethers.formatEther(ocroWinnings),
      usdt: ethers.formatEther(usdtWinnings),
    };
  },

  async getQuestion(questionId) {
    const contract = await this.getContract();
    const question = await contract.questions(questionId);
    return question;
  },

  async getUserBet(questionId, userAddress) {
    const contract = await this.getContract();
    const bet = await contract.getUserBet(questionId, userAddress);
    return bet;
  },
};
