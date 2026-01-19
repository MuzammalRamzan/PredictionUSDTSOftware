# Backend Setup Instructions

## Overview

The backend is a Node.js + Express REST API that:
- Stores betting data in MongoDB
- Provides statistics and leaderboard endpoints
- Optionally syncs with smart contracts on BSC

**Important:** Blockchain configuration is now optional. The backend works with just MongoDB.

## Quick Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB (REQUIRED)
MONGODB_URI=mongodb://127.0.0.1:27017/betting_platform
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/betting_platform

# Admin Addresses (REQUIRED for admin functions)
ADMIN_ADDRESSES=0xYourAdminWalletAddress1,0xYourAdminWalletAddress2
```

### 3. MongoDB Setup Options

#### Option A: Local MongoDB

1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use connection string: `mongodb://127.0.0.1:27017/betting_platform`

#### Option B: MongoDB Atlas (Cloud - Free Tier Available)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string from the dashboard
4. Update `MONGODB_URI` in `.env`

### 4. Start the Server

```bash
npm start
```

Server runs on `http://localhost:3001`

## Optional: Blockchain Integration

The backend works without blockchain configuration. Add these only if you want to sync data from smart contracts:

```env
# Network Selection
NETWORK=testnet

# BSC RPC URLs
BSC_RPC_URL=https://bsc-dataseed.binance.org/
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# Smart Contract Address
CONTRACT_ADDRESS=0xYourContractAddress
```

## Testing the API

### Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-..."}
```

### Get All Questions
```bash
curl http://localhost:3001/api/questions
```

### Get Platform Stats
```bash
curl http://localhost:3001/api/stats/platform
```

## What Works Without Blockchain

Without blockchain configuration, these endpoints work normally:
- All question CRUD operations (via database)
- Recording bets (transaction hash from frontend)
- Recording withdrawals
- User statistics
- Platform statistics
- Leaderboards

## What Requires Blockchain

These features require blockchain configuration:
- `POST /api/questions/sync/:contractQuestionId` - Sync question from contract
- `GET /api/bets/winnings/:questionId/:userAddress` - Calculate winnings from contract
- Auto-calculating winnings in user bets (falls back to withdrawal records)

## Troubleshooting

### "Cannot find module" errors
```bash
cd backend
npm install
```

### MongoDB connection errors
- Verify MongoDB is running (local)
- Check connection string format
- Ensure network access (Atlas)
- Check firewall settings

### "Blockchain not configured" warning
This is normal if you haven't configured blockchain settings. The backend will work with database-only features.

### Port already in use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

## Database Collections

The backend automatically creates these MongoDB collections:
- `questions` - Betting questions
- `bets` - User bets
- `withdrawals` - Withdrawal records
- `poolstats` - Pool statistics

## API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed endpoint documentation.

## Next Steps

1. Configure MongoDB connection
2. Set admin addresses
3. Start the backend
4. Optionally add blockchain configuration
5. Connect frontend to the API
