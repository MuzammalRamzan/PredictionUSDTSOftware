# Quick Start Guide

Get your betting platform running in 10 minutes!

## Step 1: Clone and Install

```bash
cd backend
npm install
cd contracts
npm install
cd ..
```

## Step 2: Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB (if not already installed)
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Recommended for production)**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Whitelist your IP address

## Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add:
```env
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/betting_platform

# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/betting_platform

PRIVATE_KEY=your_wallet_private_key
OCRO_TOKEN_ADDRESS_TESTNET=0x...
USDT_TOKEN_ADDRESS_TESTNET=0x...
```

## Step 4: Deploy Smart Contract

```bash
cd contracts
npm run deploy:testnet
```

Copy the contract address from the output and add it to `.env`:
```env
CONTRACT_ADDRESS=0x...
```

## Step 5: Start Backend

```bash
cd ..
npm run dev
```

Your API is now running at `http://localhost:3001`

The MongoDB collections will be created automatically on first use.

## Step 6: Test It

### Health Check
```bash
curl http://localhost:3001/health
```

### Create a Question (Admin)
```bash
curl -X POST http://localhost:3001/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Will Bitcoin reach $100K?",
    "description": "By end of 2026",
    "category": "crypto",
    "deadline": "2026-12-31T23:59:59Z"
  }'
```

### Get All Questions
```bash
curl http://localhost:3001/api/questions
```

## Step 7: Frontend Integration

Update your frontend with:
```javascript
const API_URL = "http://localhost:3001/api";
const CONTRACT_ADDRESS = "your_deployed_contract_address";
const NETWORK = "testnet";
```

## Common Issues

### "Private key not configured"
Make sure you've added your wallet's private key to `.env`

### "Token addresses not configured"
Get testnet token addresses from BSC testnet faucets

### "MongoDB connection error"
- For local: Make sure MongoDB is running (`mongod`)
- For Atlas: Check your connection string and network access settings

### "Insufficient funds"
Get testnet BNB from BSC testnet faucet

## Next Steps

1. Test placing bets from frontend
2. Test settling questions
3. Test withdrawing winnings
4. Deploy to mainnet when ready

## Production Checklist

- [ ] Smart contract audited
- [ ] Environment variables secured
- [ ] MongoDB Atlas production cluster configured
- [ ] Database backups configured
- [ ] API rate limiting enabled
- [ ] Monitoring and logging set up
- [ ] Frontend connected to mainnet
- [ ] User documentation written

## Need Help?

Check the full README.md for detailed documentation.
