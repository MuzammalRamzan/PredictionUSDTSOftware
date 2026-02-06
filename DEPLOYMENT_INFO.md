# Deployment Information

## Network
BSC Testnet (Chain ID: 97)

## Deployed Contracts

### USDT Token
**Address:** `0x7026eC8ed277Ae6dda4628357cE2885423b9B3ce`
- Symbol: USDT
- Decimals: 18
- Initial Supply: 10,000 USDT

### OCRO Token
**Address:** `0x4b20351E27aD66466E8Dc6F2e96FBad5ee69e362`
- Symbol: OCRO
- Decimals: 18
- Initial Supply: 10,000 OCRO

### Betting Pool Contract
**Address:** `0xf62db92156F86e10CaB2CDcb340b475C5E6948e9`
- OCRO Token: `0x4b20351E27aD66466E8Dc6F2e96FBad5ee69e362`
- USDT Token: `0x7026eC8ed277Ae6dda4628357cE2885423b9B3ce`

## Deployer Account
**Address:** `0x2686AD7C841A81170b8b2DC3D747682D1dbbE63b`
**Private Key:** `9a729ea1f2a12dbddc151cab410898e71828ace35fc6f5c59a9e7a924de5f6c1`

## Configuration Files Updated

1. **Backend .env** (`/backend/.env`)
   - CONTRACT_ADDRESS
   - PRIVATE_KEY
   - OCRO_TOKEN_ADDRESS_TESTNET
   - USDT_TOKEN_ADDRESS_TESTNET

2. **Frontend .env** (`/.env`)
   - VITE_CONTRACT_ADDRESS
   - VITE_OCRO_TOKEN_ADDRESS
   - VITE_USDT_TOKEN_ADDRESS

3. **Contract ABIs**
   - Backend: `/backend/config/BettingPoolABI.json`
   - Frontend: `/src/config/BettingPoolABI.json`

## Testing the Application

### Start the Backend Server
```bash
cd backend
npm install
npm start
```

### Start the Frontend
```bash
npm run dev
```

### Add BNB to Your Account
You'll need some BNB for gas fees. Get testnet BNB from:
- https://testnet.bnbchain.org/faucet-smart

### Add Tokens to MetaMask
1. Open MetaMask
2. Click "Import tokens"
3. Add USDT: `0x7026eC8ed277Ae6dda4628357cE2885423b9B3ce`
4. Add OCRO: `0x4b20351E27aD66466E8Dc6F2e96FBad5ee69e362`

### Transfer Tokens for Testing
Since you have the deployer private key, you can import it to MetaMask to access the initial token supply and transfer tokens to other accounts for testing.

## API Endpoints

### Create Question (Admin Only)
```bash
POST http://localhost:3001/api/questions/create
{
  "title": "Will Bitcoin reach $100k by end of 2026?",
  "deadline": 1735689600
}
```

### Get All Questions
```bash
GET http://localhost:3001/api/questions
```

### Place Bet
```bash
POST http://localhost:3001/api/bets/place
{
  "questionId": 0,
  "outcome": "yes",
  "userAddress": "0x..."
}
```

## Smart Contract Functions

### Owner Functions (Requires Private Key)
- `createQuestion(title, deadline)` - Create new betting question
- `settleQuestion(questionId, result)` - Settle question with result
- `withdrawAdminFees()` - Withdraw accumulated admin fees

### User Functions
- `placeBet(questionId, outcome)` - Place bet (requires token approval)
- `withdrawWinnings(questionId)` - Withdraw winnings after settlement
- `calculateWinnings(questionId, user)` - Calculate potential winnings
- `getUserBet(questionId, user)` - Get user's bet details

## Notes

- The backend is configured to use the deployer's private key for admin operations
- Users need to approve both OCRO and USDT tokens before placing bets
- Each bet requires exactly 1 OCRO and 1 USDT
- Admin fee is 10% of the total pool
