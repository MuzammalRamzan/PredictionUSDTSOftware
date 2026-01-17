# Testing Guide

## Quick Start

### 1. Start the Backend Server
```bash
cd backend
npm install
npm start
```
The backend will run on `http://localhost:3001`

### 2. Start the Frontend (in a new terminal)
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

### 3. Get Testnet BNB
You need BNB for gas fees:
- Visit: https://testnet.bnbchain.org/faucet-smart
- Enter your wallet address
- Request testnet BNB

### 4. Configure MetaMask

#### Add BSC Testnet to MetaMask
- Network Name: BSC Testnet
- RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
- Chain ID: 97
- Currency Symbol: BNB
- Block Explorer: https://testnet.bscscan.com

#### Import Deployer Account (Has All Tokens)
1. Click MetaMask icon
2. Click account menu → Import Account
3. Paste private key: `9a729ea1f2a12dbddc151cab410898e71828ace35fc6f5c59a9e7a924de5f6c1`
4. This account has 10,000 OCRO and 10,000 USDT

#### Add Tokens to MetaMask
1. In MetaMask, click "Import tokens"
2. Add OCRO:
   - Token Address: `0x4b20351E27aD66466E8Dc6F2e96FBad5ee69e362`
   - Symbol: OCRO
   - Decimals: 18
3. Add USDT:
   - Token Address: `0x7026eC8ed277Ae6dda4628357cE2885423b9B3ce`
   - Symbol: USDT
   - Decimals: 18

## Testing Flow

### Step 1: Create a Question (Backend API)

Use Postman, curl, or any API client:

```bash
curl -X POST http://localhost:3001/api/questions/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Will Bitcoin reach $100k by end of 2026?",
    "deadline": 1735689600
  }'
```

Response:
```json
{
  "success": true,
  "questionId": "0",
  "txHash": "0x..."
}
```

### Step 2: View Questions on Frontend

1. Open http://localhost:5173
2. Connect your MetaMask wallet
3. You should see the question you created

### Step 3: Place a Bet

1. Click on a question card
2. Select "Yes" or "No"
3. Click "Approve Tokens" (first time only)
4. Wait for approval transaction
5. Click "Place Bet"
6. Confirm transaction in MetaMask
7. Wait for confirmation

### Step 4: Settle the Question (Backend API)

After the deadline:

```bash
curl -X POST http://localhost:3001/api/questions/0/settle \
  -H "Content-Type: application/json" \
  -d '{
    "result": true
  }'
```

Note: `true` = YES wins, `false` = NO wins

### Step 5: Withdraw Winnings

1. Refresh the frontend
2. If you won, you'll see a "Withdraw" button
3. Click "Withdraw Winnings"
4. Confirm transaction in MetaMask
5. Check your token balance

## Creating Multiple Test Accounts

To test betting between multiple users:

1. Create new accounts in MetaMask
2. From the deployer account, send:
   - Some BNB for gas (0.1 BNB is enough)
   - Some OCRO tokens (at least 1 OCRO per bet)
   - Some USDT tokens (at least 1 USDT per bet)
3. Switch to the new account
4. Connect and place bets

## Common Issues

### Transaction Fails
- Check you have enough BNB for gas
- Check you approved tokens first
- Check the question deadline hasn't passed
- Check you haven't already bet on this question

### Tokens Not Showing
- Make sure you imported the correct token addresses
- Refresh MetaMask
- Check you're on BSC Testnet

### Backend Not Working
- Check MongoDB is running (if using local MongoDB)
- Check the .env file has correct values
- Check port 3001 is not in use

## API Endpoints Reference

### Questions

#### Create Question (Admin)
```
POST /api/questions/create
Body: { "title": "string", "deadline": number }
```

#### Get All Questions
```
GET /api/questions
```

#### Get Question by ID
```
GET /api/questions/:id
```

#### Settle Question (Admin)
```
POST /api/questions/:id/settle
Body: { "result": boolean }
```

### Bets

#### Place Bet
```
POST /api/bets/place
Body: { "questionId": number, "outcome": "yes|no", "userAddress": "0x..." }
```

#### Get User Bets
```
GET /api/bets/user/:address
```

#### Withdraw Winnings
```
POST /api/bets/withdraw
Body: { "questionId": number, "userAddress": "0x..." }
```

### Stats

#### Get Pool Stats
```
GET /api/stats
```

#### Get Question Stats
```
GET /api/stats/question/:id
```

## Smart Contract Addresses

- **Betting Pool:** `0xf62db92156F86e10CaB2CDcb340b475C5E6948e9`
- **OCRO Token:** `0x4b20351E27aD66466E8Dc6F2e96FBad5ee69e362`
- **USDT Token:** `0x7026eC8ed277Ae6dda4628357cE2885423b9B3ce`

View on BSCScan Testnet:
- https://testnet.bscscan.com/address/0xf62db92156F86e10CaB2CDcb340b475C5E6948e9
