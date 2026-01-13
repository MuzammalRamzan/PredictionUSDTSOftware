# Betting Pool Platform - Backend & Smart Contract

Complete backend system for a decentralized betting platform on Binance Smart Chain (BSC).

## 🏗️ Architecture Overview

### Components

1. **Smart Contract (Solidity)** - Handles on-chain betting logic
2. **Backend API (Node.js + Express)** - Manages off-chain data and coordinates with blockchain
3. **Database (MongoDB)** - Stores questions, bets, user stats, and historical data

### Data Distribution

**On-Chain (Smart Contract):**
- Question creation and deadlines
- Bet placement and pool totals
- Settlement results
- Winnings calculation and distribution
- Admin fee collection

**Off-Chain (Database):**
- Question metadata (descriptions, categories)
- User profiles and statistics
- Bet history and transaction records
- Withdrawal history
- Platform analytics and leaderboards

## 📦 Installation

### Prerequisites

- Node.js v18+ and npm
- MongoDB (local installation or MongoDB Atlas account)
- BSC wallet with BNB for gas fees
- OCRO and USDT tokens on BSC

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

Required environment variables:
```env
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/betting_platform
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/betting_platform

# BSC
BSC_RPC_URL=https://bsc-dataseed.binance.org/
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
NETWORK=testnet

# Contract (will be set after deployment)
CONTRACT_ADDRESS=
PRIVATE_KEY=your_private_key

# Tokens
OCRO_TOKEN_ADDRESS=0x...
USDT_TOKEN_ADDRESS=0x55d398326f99059fF775485246999027B3197955
OCRO_TOKEN_ADDRESS_TESTNET=0x...
USDT_TOKEN_ADDRESS_TESTNET=0x...
```

### 3. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Add it to your `.env` file

The database and collections will be created automatically when you start the server.

### 4. Deploy Smart Contract

```bash
cd contracts
npm install

# Deploy to BSC Testnet
npm run deploy:testnet

# Or deploy to BSC Mainnet
npm run deploy:mainnet
```

After deployment, copy the contract address to your `.env` file.

### 5. Start Backend Server

```bash
cd ..
npm start

# For development with auto-reload:
npm run dev
```

Server will run on `http://localhost:3001`

## 🔗 API Endpoints

### Questions

#### Get All Questions
```http
GET /api/questions
Query params: ?status=open&category=crypto
```

#### Get Question by ID
```http
GET /api/questions/:id
```

#### Create Question (Admin)
```http
POST /api/questions
Content-Type: application/json

{
  "title": "Will Bitcoin reach $100K by end of 2026?",
  "description": "Detailed description...",
  "category": "crypto",
  "deadline": "2026-12-31T23:59:59Z"
}
```

#### Settle Question (Admin)
```http
POST /api/questions/:id/settle
Content-Type: application/json

{
  "result": "yes"
}
```

#### Sync Question from Blockchain
```http
POST /api/questions/sync/:contractQuestionId
```

### Bets

#### Record Bet
```http
POST /api/bets
Content-Type: application/json

{
  "questionId": "mongodb_id",
  "userAddress": "0x...",
  "outcome": "yes",
  "transactionHash": "0x..."
}
```

#### Get User Bets
```http
GET /api/bets/user/:userAddress
```

#### Get Question Bets
```http
GET /api/bets/question/:questionId
```

#### Calculate Winnings
```http
GET /api/bets/winnings/:questionId/:userAddress
```

#### Record Withdrawal
```http
POST /api/bets/withdraw
Content-Type: application/json

{
  "questionId": "mongodb_id",
  "userAddress": "0x...",
  "ocroAmount": "3.1",
  "usdtAmount": "3.1",
  "transactionHash": "0x..."
}
```

#### Get User Withdrawals
```http
GET /api/bets/withdrawals/:userAddress
```

### Statistics

#### Get Pool Stats
```http
GET /api/stats/pool/:questionId
```

#### Get Platform Stats
```http
GET /api/stats/platform
```

#### Get User Stats
```http
GET /api/stats/user/:userAddress
```

#### Get Leaderboard
```http
GET /api/stats/leaderboard
```

## 📜 Smart Contract

### Core Functions

#### createQuestion (Owner Only)
```solidity
function createQuestion(string memory _title, uint256 _deadline)
    external onlyOwner returns (uint256)
```
Creates a new betting question.

#### placeBet
```solidity
function placeBet(uint256 _questionId, bool _outcome) external
```
Places a bet. Requires prior token approval.
- `_outcome`: true = YES, false = NO

#### settleQuestion (Owner Only)
```solidity
function settleQuestion(uint256 _questionId, bool _result) external onlyOwner
```
Settles a question and determines winners.

#### withdrawWinnings
```solidity
function withdrawWinnings(uint256 _questionId) external
```
Allows winners to claim their rewards.

#### calculateWinnings
```solidity
function calculateWinnings(uint256 _questionId, address _user)
    public view returns (uint256 ocroWinnings, uint256 usdtWinnings)
```
Calculates potential winnings for a user.

#### withdrawAdminFees (Owner Only)
```solidity
function withdrawAdminFees() external onlyOwner
```
Withdraws collected admin fees.

### Events

- `QuestionCreated(uint256 questionId, string title, uint256 deadline)`
- `BetPlaced(uint256 questionId, address user, bool outcome, uint256 ocroAmount, uint256 usdtAmount)`
- `QuestionSettled(uint256 questionId, bool result)`
- `WinningsWithdrawn(uint256 questionId, address user, uint256 ocroAmount, uint256 usdtAmount)`
- `AdminFeesWithdrawn(uint256 ocroAmount, uint256 usdtAmount)`

## 🎮 Usage Flow

### For Users

1. **Place Bet:**
   - Approve OCRO and USDT tokens to contract
   - Call `placeBet(questionId, outcome)`
   - Backend records the bet in database

2. **Check Status:**
   - Query API for bet status
   - View pool statistics

3. **Withdraw Winnings:**
   - After settlement, call `withdrawWinnings(questionId)`
   - Backend records withdrawal

### For Admin

1. **Create Question:**
   - Call API to create question
   - Backend deploys to smart contract
   - Database stores metadata

2. **Settle Question:**
   - After deadline, call settlement API
   - Smart contract determines winners
   - Database updates bet results

3. **Withdraw Fees:**
   - Call `withdrawAdminFees()` on contract
   - Collect accumulated 10% fees

## 🔒 Security Features

- MongoDB with secure connection strings
- Smart contract ownership controls
- No admin ability to manipulate outcomes after deployment
- All funds managed transparently on-chain
- Event-driven architecture for auditability

## 🧪 Testing

### Test Smart Contract
```bash
cd contracts
npx hardhat test
```

### Test API Endpoints
```bash
# Start server in test mode
NODE_ENV=test npm start

# Use tools like Postman or curl to test endpoints
```

## 📊 Database Schema

### Collections

- **questions** - Betting questions and their status
- **bets** - Individual bets placed by users
- **withdrawals** - Withdrawal history
- **poolstats** - Real-time pool statistics

MongoDB automatically creates these collections and enforces schemas through Mongoose models.

## 🚀 Deployment to Production

### 1. Update Environment
```bash
NODE_ENV=production
NETWORK=mainnet
MONGODB_URI=mongodb+srv://your-production-db
```

### 2. Deploy Smart Contract
```bash
cd contracts
npm run deploy:mainnet
```

### 3. Verify Contract (Optional)
```bash
npx hardhat verify --network bscMainnet <CONTRACT_ADDRESS> <OCRO_ADDRESS> <USDT_ADDRESS>
```

### 4. Deploy Backend
Deploy to your preferred hosting service (AWS, DigitalOcean, Heroku, etc.)

### 5. Configure Frontend
Update frontend with:
- API endpoint URL
- Contract address
- Network configuration

## 📝 Important Notes

### Token Approvals
Users must approve both OCRO and USDT tokens before betting:
```javascript
const ocroToken = new ethers.Contract(OCRO_ADDRESS, ERC20_ABI, signer);
const usdtToken = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);

await ocroToken.approve(CONTRACT_ADDRESS, ethers.parseEther("1"));
await usdtToken.approve(CONTRACT_ADDRESS, ethers.parseEther("1"));
```

### Fixed Amounts
- Each bet requires exactly 1 OCRO + 1 USDT
- This is hardcoded in the smart contract
- Cannot be changed without redeployment

### Admin Fee
- 10% fee taken from losing pool only
- Winners get their original stake back + share of remaining losing pool
- Fees accumulate in contract and can be withdrawn by owner

## 🆘 Troubleshooting

### Database Connection Issues
- Verify MongoDB URI is correct
- Check MongoDB is running (if local)
- Ensure network access is configured (if using Atlas)
- Check firewall settings

### Smart Contract Issues
- Verify contract is deployed to correct network
- Check token addresses are correct
- Ensure sufficient gas for transactions
- Verify token approvals are set

### API Errors
- Check environment variables
- Verify contract ABI matches deployed contract
- Ensure blockchain RPC endpoint is accessible

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📞 Support

For issues or questions, please open an issue on GitHub.
