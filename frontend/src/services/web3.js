import {ethers} from "ethers";
import BettingPoolABI from "../config/BettingPoolABI.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const USDT_TOKEN_ADDRESS = import.meta.env.VITE_USDT_TOKEN_ADDRESS;

console.log("Web3 Service Configuration:", {
  CONTRACT_ADDRESS,
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

    let expectedChainId;
    let networkName;

    let rpcUrls;
    let nativeCurrency;

    if (import.meta.env.VITE_NETWORK === "mainnet") {
      expectedChainId = "0x38";
      networkName = "BSC Mainnet";
      rpcUrls = ["https://bsc-dataseed.binance.org/"];
      nativeCurrency = {
        name: "BNB",
        symbol: "BNB",
        decimals: 18,
      };
    } else if (import.meta.env.VITE_NETWORK === "testnet") {
      expectedChainId = "0x61";
      networkName = "BSC Testnet";
      rpcUrls = ["https://data-seed-prebsc-1-s1.binance.org:8545/"];
      nativeCurrency = {
        name: "BNB",
        symbol: "tBNB",
        decimals: 18,
      };
    } else {
      // Default to localhost/hardhat for development
      expectedChainId = "0x7a69"; // 31337
      networkName = "Localhost 8545";
      rpcUrls = ["http://127.0.0.1:8545/"];
      nativeCurrency = {
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
      };
    }

    if (chainId !== expectedChainId) {
      // Try to switch network automatically
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{chainId: expectedChainId}],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: expectedChainId,
                  chainName: networkName,
                  rpcUrls: rpcUrls,
                  nativeCurrency: nativeCurrency,
                },
              ],
            });
          } catch (addError) {
            throw new Error(
              `Please add and switch to ${networkName} manually.`,
            );
          }
        } else {
          throw new Error(
            `Please switch to ${networkName} (Chain ID: ${expectedChainId})`,
          );
        }
      }
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
    const usdtToken = await this.getTokenContract(USDT_TOKEN_ADDRESS);

    // Approve max amount to avoid repeated approvals
    const amount = ethers.MaxUint256;

    const usdtTx = await usdtToken.approve(validContractAddress, amount);
    await usdtTx.wait();
  },

  async getAllowances(userAddress) {
    const validContractAddress = validateAddress(
      CONTRACT_ADDRESS,
      "Contract address",
    );
    const usdtToken = await this.getTokenContract(USDT_TOKEN_ADDRESS);

    const usdtAllowance = await usdtToken.allowance(
      userAddress,
      validContractAddress,
    );

    return {
      usdt: ethers.formatUnits(usdtAllowance, 18),
    };
  },

  async checkBalances(userAddress, usdtAmount) {
    try {
      console.log("[Web3] Checking balances for:", userAddress);
      console.log("[Web3] Using USDT Address:", USDT_TOKEN_ADDRESS);

      const usdtToken = await this.getTokenContract(USDT_TOKEN_ADDRESS);
      console.log("[Web3] Token contract initialized at:", usdtToken.target);

      const usdtBalance = await usdtToken.balanceOf(userAddress);
      console.log("[Web3] Raw balance:", usdtBalance.toString());

      // Handle cases where amount is 0 or undefined
      const amountStr = usdtAmount ? usdtAmount.toString() : "0";
      const usdtWei = ethers.parseUnits(amountStr, 18);

      return {
        hasSufficientBalance: usdtBalance >= usdtWei,
        usdtBalance: ethers.formatUnits(usdtBalance, 18),
      };
    } catch (error) {
      console.error("[Web3] Error in checkBalances:", error);
      console.error("[Web3] Failed Address:", USDT_TOKEN_ADDRESS);
      throw error;
    }
  },

  async checkApprovals(userAddress, usdtAmount) {
    const validContractAddress = validateAddress(
      CONTRACT_ADDRESS,
      "Contract address",
    );
    const usdtToken = await this.getTokenContract(USDT_TOKEN_ADDRESS);
    const usdtAllowance = await usdtToken.allowance(
      userAddress,
      validContractAddress,
    );

    const amountWei = usdtAmount
      ? ethers.parseUnits(usdtAmount.toString(), 18)
      : 0n;

    return {
      usdtApproved: usdtAllowance >= amountWei,
    };
  },

  async placeBet(questionId, outcomeIndex, usdtAmount) {
    console.log("[Web3] placeBet called:", {
      questionId,
      outcomeIndex,
      usdtAmount,
    });

    const contract = await this.getContract();
    if (!contract) {
      throw new Error("Failed to initialize contract");
    }

    if (typeof contract.placeBet !== "function") {
      console.error("[Web3] placeBet method missing on contract:", contract);
      throw new Error("Contract method 'placeBet' not found. Check ABI.");
    }

    // Convert to Wei (assuming 18 decimals)
    const usdtWei = ethers.parseUnits(usdtAmount.toString(), 18);
    console.log("[Web3] Placing bet with args:", {
      questionId,
      outcomeIndex,
      usdtWei: usdtWei.toString(),
    });

    try {
      // Manual gas limit might be needed for localhost if estimation fails
      const tx = await contract.placeBet(questionId, outcomeIndex, usdtWei);
      console.log("[Web3] Bet tx sent:", tx.hash);

      await tx.wait();
      console.log("[Web3] Bet tx confirmed");
      return tx.hash;
    } catch (error) {
      console.error("[Web3] Error in placeBet:", error);
      throw error;
    }
  },

  async calculateWinnings(questionId, userAddress) {
    const contract = await this.getContract();
    const winnings = await contract.calculateWinnings(questionId, userAddress);
    // Contract returns a single uint256 now
    return {
      usdt: ethers.formatUnits(winnings, 18),
    };
  },

  async withdrawWinnings(questionId) {
    const contract = await this.getContract();
    const tx = await contract.withdrawWinnings(questionId);
    await tx.wait();
    return tx.hash;
  },

  async createQuestion(title, deadline, outcomeCount) {
    console.log("[Web3] createQuestion called with:", {
      title,
      deadline,
      outcomeCount,
    });
    const contract = await this.getContract();
    console.log("[Web3] Contract instance obtained:", contract.target);

    console.log("[Web3] Sending createQuestion transaction...");
    const tx = await contract.createQuestion(title, deadline, outcomeCount);
    console.log("[Web3] Transaction sent:", tx.hash);

    console.log("[Web3] Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("[Web3] Transaction confirmed:", receipt);

    // Parse event to get questionId
    let contractQuestionId = null;

    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === "QuestionCreated") {
          contractQuestionId = parsedLog.args[0].toString();
          console.log(
            "[Web3] Found QuestionCreated event. ID:",
            contractQuestionId,
          );
          break;
        }
      } catch (e) {
        // Ignore logs that don't match
      }
    }

    if (!contractQuestionId) {
      console.warn("[Web3] Warning: QuestionCreated event not found in logs!");
    }

    return {
      transactionHash: tx.hash,
      contractQuestionId,
    };
  },

  async settleQuestion(questionId, result) {
    const contract = await this.getContract();
    const tx = await contract.settleQuestion(questionId, result);
    await tx.wait();
    return tx.hash;
  },

  async getQuestion(questionId) {
    const contract = await this.getContract();
    const data = await contract.getQuestion(questionId);

    return {
      title: data[0],
      deadline: Number(data[1]),
      isSettled: data[2],
      result: Number(data[3]),
      outcomeCount: Number(data[4]),
      outcomeUsdtTotals: data[5],
      outcomeParticipants: data[6],
      exists: data[7],
    };
  },

  async getAdminFees() {
    const contract = await this.getContract();
    const usdt = await contract.adminFeesUsdt();
    return {
      usdt: ethers.formatUnits(usdt, 18),
    };
  },

  async withdrawAdminFees() {
    const contract = await this.getContract();
    const tx = await contract.withdrawAdminFees();
    await tx.wait();
    return tx.hash;
  },
};
