import {ethers} from "ethers";
import BettingPoolABI from "../config/BettingPoolABI.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const FTR_TOKEN_ADDRESS = import.meta.env.VITE_FTR_TOKEN_ADDRESS;
const USDT_TOKEN_ADDRESS = import.meta.env.VITE_USDT_TOKEN_ADDRESS;

console.log("Web3 Service Configuration:", {
  CONTRACT_ADDRESS,
  FTR_TOKEN_ADDRESS,
  USDT_TOKEN_ADDRESS,
  NETWORK: import.meta.env.VITE_NETWORK,
});

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
];

const validateAddress = (address, name) => {
  if (!address) {
    console.error(`${name} validation failed: address is`, address);
    throw new Error(
      `${name} is not configured. Please check your environment variables in frontend/.env file and restart the dev server.`,
    );
  }
  if (!ethers.isAddress(address)) {
    console.error(
      `${name} validation failed: "${address}" is not a valid Ethereum address`,
    );
    throw new Error(`${name} is invalid: ${address}`);
  }
  return address;
};

export const web3Service = {
  async connectWallet() {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const chainId = await window.ethereum.request({method: "eth_chainId"});
    const expectedChainId =
      import.meta.env.VITE_NETWORK === "mainnet" ? "0x38" : "0x61";

    if (chainId !== expectedChainId) {
      const networkName =
        import.meta.env.VITE_NETWORK === "mainnet"
          ? "BSC Mainnet"
          : "BSC Testnet";
      throw new Error(`Please switch to ${networkName}`);
    }

    return accounts[0];
  },

  async getProvider() {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }
    return new ethers.BrowserProvider(window.ethereum);
  },

  async getSigner() {
    const provider = await this.getProvider();
    return provider.getSigner();
  },

  async getContract() {
    const validAddress = validateAddress(CONTRACT_ADDRESS, "Contract address");
    const signer = await this.getSigner();
    return new ethers.Contract(validAddress, BettingPoolABI, signer);
  },

  async getTokenContract(tokenAddress) {
    const validAddress = validateAddress(tokenAddress, "Token address");
    const signer = await this.getSigner();
    return new ethers.Contract(validAddress, ERC20_ABI, signer);
  },

  async approveTokens() {
    const validContractAddress = validateAddress(
      CONTRACT_ADDRESS,
      "Contract address",
    );
    const ftrToken = await this.getTokenContract(FTR_TOKEN_ADDRESS);
    const usdtToken = await this.getTokenContract(USDT_TOKEN_ADDRESS);

    // Approve max amount to avoid repeated approvals
    const amount = ethers.MaxUint256;

    const ftrTx = await ftrToken.approve(validContractAddress, amount);
    await ftrTx.wait();

    const usdtTx = await usdtToken.approve(validContractAddress, amount);
    await usdtTx.wait();

    return true;
  },

  async getAdminFees() {
    try {
      const contract = await this.getContract();
      const ftrFees = await contract.adminFeesFtr();
      const usdtFees = await contract.adminFeesUsdt();

      return {
        ftr: ethers.formatEther(ftrFees),
        usdt: ethers.formatEther(usdtFees),
      };
    } catch (error) {
      console.error("Failed to fetch admin fees:", error);
      return {ftr: "0.0", usdt: "0.0"};
    }
  },

  async checkBalances(userAddress, amountFtr = "1", amountUsdt = "1") {
    const ftrToken = await this.getTokenContract(FTR_TOKEN_ADDRESS);
    const usdtToken = await this.getTokenContract(USDT_TOKEN_ADDRESS);

    const ftrBalance = await ftrToken.balanceOf(userAddress);
    const usdtBalance = await usdtToken.balanceOf(userAddress);

    const requiredFtr = ethers.parseEther(amountFtr.toString());
    const requiredUsdt = ethers.parseEther(amountUsdt.toString());

    return {
      ftrBalance: ethers.formatEther(ftrBalance),
      usdtBalance: ethers.formatEther(usdtBalance),
      hasFtrBalance: ftrBalance >= requiredFtr,
      hasUsdtBalance: usdtBalance >= requiredUsdt,
      hasSufficientBalance:
        ftrBalance >= requiredFtr && usdtBalance >= requiredUsdt,
    };
  },

  async checkApprovals(userAddress, amountFtr = "1", amountUsdt = "1") {
    const validContractAddress = validateAddress(
      CONTRACT_ADDRESS,
      "Contract address",
    );
    const ftrToken = await this.getTokenContract(FTR_TOKEN_ADDRESS);
    const usdtToken = await this.getTokenContract(USDT_TOKEN_ADDRESS);

    const ftrAllowance = await ftrToken.allowance(
      userAddress,
      validContractAddress,
    );
    const usdtAllowance = await usdtToken.allowance(
      userAddress,
      validContractAddress,
    );

    const requiredFtr = ethers.parseEther(amountFtr.toString());
    const requiredUsdt = ethers.parseEther(amountUsdt.toString());

    return {
      ftrApproved: ftrAllowance >= requiredFtr,
      usdtApproved: usdtAllowance >= requiredUsdt,
    };
  },

  async placeBet(questionId, outcomeIndex, amountFtr, amountUsdt) {
    const contract = await this.getContract();
    const tx = await contract.placeBet(
      questionId,
      outcomeIndex,
      ethers.parseEther(amountFtr.toString()),
      ethers.parseEther(amountUsdt.toString()),
    );
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
    const [ftrWinnings, usdtWinnings] = await contract.calculateWinnings(
      questionId,
      userAddress,
    );
    return {
      ftr: ethers.formatEther(ftrWinnings),
      usdt: ethers.formatEther(usdtWinnings),
    };
  },

  async getQuestion(questionId) {
    const contract = await this.getContract();
    const question = await contract.getQuestion(questionId);
    return question;
  },

  async getUserBet(questionId, userAddress) {
    const contract = await this.getContract();
    const bet = await contract.getUserBet(questionId, userAddress);
    return bet;
  },

  async createQuestion(title, deadlineTimestamp, outcomeCount) {
    const contract = await this.getContract();
    const tx = await contract.createQuestion(
      title,
      deadlineTimestamp,
      outcomeCount,
    );
    const receipt = await tx.wait();

    const event = receipt.logs.find((log) => {
      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });
        return parsed.name === "QuestionCreated";
      } catch {
        return false;
      }
    });

    let contractQuestionId = 0;
    if (event) {
      const decodedLog = contract.interface.parseLog({
        topics: event.topics,
        data: event.data,
      });
      contractQuestionId = Number(decodedLog.args[0]);
    }

    return {
      transactionHash: receipt.hash,
      contractQuestionId,
    };
  },

  async settleQuestion(contractQuestionId, result) {
    const contract = await this.getContract();
    const tx = await contract.settleQuestion(contractQuestionId, result);
    const receipt = await tx.wait();
    return receipt.hash;
  },
};
