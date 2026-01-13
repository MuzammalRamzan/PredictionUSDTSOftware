# Frontend-Backend Integration Guide

This document explains how the frontend is connected to the backend API and smart contracts.

## Architecture Overview

The application follows a **3-tier architecture**:

1. **Frontend (React)** - User interface built with React and TailwindCSS
2. **Backend API (Node.js + Express)** - RESTful API running on port 3001
3. **Blockchain (BSC Smart Contract)** - Handles on-chain betting logic

## How It Works

### Data Flow

```
User Action (Frontend)
    ↓
Web3 Wallet (MetaMask)
    ↓
Smart Contract (BSC) → Backend API → MongoDB
    ↓                        ↓
Frontend Updates ← API Response
```

### Key Services

#### 1. API Service (`src/services/api.js`)

Handles all HTTP requests to the backend:
- Fetch questions from database
- Record bets after blockchain confirmation
- Get user positions and history
- Fetch platform statistics
- Record withdrawals

**Example Usage:**
```javascript
import { api } from './services/api';

// Fetch all active questions
const questions = await api.getAllQuestions('open');

// Record a bet after blockchain transaction
await api.recordBet({
  questionId: '123',
  userAddress: '0x...',
  outcome: 'yes',
  transactionHash: '0x...'
});
```

#### 2. Web3 Service (`src/services/web3.js`)

Handles blockchain interactions:
- Connect wallet (MetaMask)
- Approve OCRO and USDT tokens
- Place bets on smart contract
- Withdraw winnings
- Calculate potential winnings

**Example Usage:**
```javascript
import { web3Service } from './services/web3';

// Connect wallet
const address = await web3Service.connectWallet();

// Approve tokens before betting
await web3Service.approveTokens();

// Place a bet
const txHash = await web3Service.placeBet(questionId, 'yes');
```

## Environment Configuration

### Frontend `.env` File

Located at project root:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Smart Contract Address (from deployment)
VITE_CONTRACT_ADDRESS=0x...

# Network (testnet or mainnet)
VITE_NETWORK=testnet

# Token Addresses on BSC
VITE_OCRO_TOKEN_ADDRESS=0x...
VITE_USDT_TOKEN_ADDRESS=0x...
```

### Backend `.env` File

Located at `/backend/.env`:

```env
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/betting_platform

# BSC Configuration
BSC_RPC_URL=https://bsc-dataseed.binance.org/
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
NETWORK=testnet

# Contract
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=your_private_key

# Token Addresses
OCRO_TOKEN_ADDRESS=0x...
USDT_TOKEN_ADDRESS=0x...
```

## Component Integration

### App.jsx - Main Application

**Key Features:**
- Manages global state (wallet, questions, positions)
- Loads data from backend API on mount
- Handles wallet connection via Web3
- Coordinates betting and withdrawal flows

**State Management:**
```javascript
const [walletAddress, setWalletAddress] = useState();
const [questions, setQuestions] = useState([]);
const [userPositions, setUserPositions] = useState([]);
const [platformStats, setPlatformStats] = useState({...});
```

**Data Loading:**
```javascript
useEffect(() => {
  loadQuestions();        // Fetch from API
  loadPlatformStats();    // Fetch from API
  checkWalletConnection(); // Check if wallet already connected
}, []);

useEffect(() => {
  if (walletAddress) {
    loadUserBets();        // Fetch user's bets from API
  }
}, [walletAddress]);
```

### Betting Flow

1. **User clicks "Yes" or "No" button**
2. Frontend checks wallet connection
3. Frontend checks token approvals
4. If needed, prompts user to approve tokens
5. Calls smart contract `placeBet()` function
6. Waits for blockchain confirmation
7. Records bet in backend database via API
8. Refreshes questions and user positions

**Code:**
```javascript
const handlePlaceBet = async (questionId, side) => {
  // Check approvals
  const approvals = await web3Service.checkApprovals(walletAddress);

  // Approve tokens if needed
  if (!approvals.ocroApproved || !approvals.usdtApproved) {
    await web3Service.approveTokens();
  }

  // Place bet on blockchain
  const txHash = await web3Service.placeBet(questionId, side);

  // Record in backend
  await api.recordBet({
    questionId,
    userAddress: walletAddress,
    outcome: side,
    transactionHash: txHash,
  });

  // Refresh data
  await loadQuestions();
  await loadUserBets();
};
```

### Withdrawal Flow

1. **User clicks "Withdraw Winnings" button**
2. Frontend calls smart contract `withdrawWinnings()`
3. Waits for blockchain confirmation
4. Calculates actual winnings from contract
5. Records withdrawal in backend via API
6. Updates user positions display

**Code:**
```javascript
const handleWithdraw = async (questionId) => {
  // Withdraw from blockchain
  const txHash = await web3Service.withdrawWinnings(questionId);

  // Calculate winnings
  const winnings = await web3Service.calculateWinnings(
    questionId,
    walletAddress
  );

  // Record in backend
  await api.recordWithdrawal({
    questionId,
    userAddress: walletAddress,
    ocroAmount: winnings.ocro,
    usdtAmount: winnings.usdt,
    transactionHash: txHash,
  });

  // Refresh positions
  await loadUserBets();
};
```

## Running the Application

### 1. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

### 2. Start Backend

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:3001`

### 3. Start Frontend

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Connect MetaMask

1. Install MetaMask browser extension
2. Switch to BSC Testnet
3. Add OCRO and USDT token addresses
4. Get testnet BNB, OCRO, and USDT from faucets

## API Endpoints Used by Frontend

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/questions` | GET | Fetch all questions |
| `/api/questions/:id` | GET | Fetch single question |
| `/api/bets` | POST | Record a bet |
| `/api/bets/user/:address` | GET | Get user's bets |
| `/api/bets/withdraw` | POST | Record withdrawal |
| `/api/stats/platform` | GET | Get platform stats |
| `/api/stats/pool/:id` | GET | Get pool statistics |

## Smart Contract Functions Used

| Function | Purpose | Called By |
|----------|---------|-----------|
| `placeBet(questionId, outcome)` | Place a bet | `handlePlaceBet` |
| `withdrawWinnings(questionId)` | Withdraw winnings | `handleWithdraw` |
| `calculateWinnings(questionId, user)` | Calculate potential winnings | `handleWithdraw` |
| `getUserBet(questionId, user)` | Get user's bet info | Future feature |

## Troubleshooting

### Frontend Can't Connect to Backend

**Issue:** `Failed to fetch questions`

**Solution:**
1. Check backend is running on port 3001
2. Verify `VITE_API_URL` in `.env`
3. Check for CORS errors in browser console
4. Ensure MongoDB is connected

### Wallet Connection Issues

**Issue:** `MetaMask is not installed`

**Solution:**
1. Install MetaMask extension
2. Create/import wallet
3. Switch to BSC Testnet

### Transaction Failures

**Issue:** `Transaction reverted` or `Insufficient funds`

**Solution:**
1. Ensure you have testnet BNB for gas
2. Check you have 1 OCRO + 1 USDT
3. Verify tokens are approved
4. Check deadline hasn't passed

### API Errors

**Issue:** Backend returns 500 errors

**Solution:**
1. Check backend console logs
2. Verify MongoDB connection
3. Ensure contract address is set
4. Check all env variables are configured

## Development Tips

### Testing Without Blockchain

You can test the UI without blockchain by:
1. Comment out web3Service calls
2. Use mock data in state
3. Test API calls independently

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Vite automatically reloads on file changes
- Backend: Use `npm run dev` with nodemon

### Network Switching

To switch between testnet and mainnet:
1. Update `VITE_NETWORK` in frontend `.env`
2. Update `NETWORK` in backend `.env`
3. Update contract and token addresses
4. Switch MetaMask network

## Production Deployment

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` folder to hosting (Vercel, Netlify, etc.)
3. Update `VITE_API_URL` to production backend URL

### Backend
1. Deploy to VPS, AWS, or Heroku
2. Use MongoDB Atlas for production database
3. Set all environment variables
4. Enable HTTPS
5. Configure CORS for production domain

## Security Considerations

1. **Never commit private keys** - Keep in `.env` files only
2. **Validate all user inputs** - Backend validates all data
3. **Use HTTPS in production** - Protect user data
4. **Audit smart contracts** - Before mainnet deployment
5. **Rate limiting** - Prevent API abuse
6. **Token approvals** - Users explicitly approve spending

## Next Steps

1. Add admin panel for question management
2. Implement real-time updates with WebSockets
3. Add transaction history page
4. Implement leaderboard feature
5. Add email notifications for settlements
6. Create mobile-responsive improvements

## Support

For issues or questions:
- Check backend logs: `backend/` directory
- Check browser console: Developer Tools
- Review MongoDB data: MongoDB Compass
- Check blockchain transactions: BSCScan
