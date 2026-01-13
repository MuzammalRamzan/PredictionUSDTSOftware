# Backend Setup Instructions

## Important Note

**The backend is now OPTIONAL** since the frontend connects directly to Supabase. You only need to run the backend if you want to:
- Test the MongoDB integration separately
- Use the REST API endpoints directly
- Run blockchain event listeners (future feature)

## Quick Fix for Import Error

The import syntax has been updated to use the newer `with` keyword instead of `assert`:

**Fixed in:** `backend/config/blockchain.js`
```javascript
// Old (causes error)
import BettingPoolABI from './BettingPoolABI.json' assert { type: 'json' };

// New (works with Node.js 20+)
import BettingPoolABI from './BettingPoolABI.json' with { type: 'json' };
```

## Setting Up the Backend (Optional)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create .env File

Copy the example and fill in your values:

```bash
cp .env.example .env
```

### 3. Configure MongoDB

You have three options:

#### Option A: Local MongoDB (Recommended for Testing)

1. Install MongoDB locally: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use this connection string:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/betting_platform
```

#### Option B: MongoDB Atlas (Cloud)

1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string from Atlas dashboard
4. Use this format:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/betting_platform
```

#### Option C: Skip Backend Entirely

Since the frontend now uses Supabase, you don't need MongoDB at all! The frontend works independently.

### 4. Configure Blockchain Settings

Edit `backend/.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB (choose one from above)
MONGODB_URI=mongodb://127.0.0.1:27017/betting_platform

# BSC Configuration
BSC_RPC_URL=https://bsc-dataseed.binance.org/
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
NETWORK=testnet

# Smart Contract (fill after deployment)
CONTRACT_ADDRESS=your_deployed_contract_address_here
PRIVATE_KEY=your_private_key_for_admin_operations

# Token Addresses (BSC Testnet)
OCRO_TOKEN_ADDRESS_TESTNET=your_ocro_token_address
USDT_TOKEN_ADDRESS_TESTNET=0x337610d27c682E347C9cD60BD4b3b107C9d34dDd
```

### 5. Start the Server

```bash
npm start
```

The backend will run on `http://localhost:3001`

## Testing the Backend API

### Health Check
```bash
curl http://localhost:3001/health
```

### Get All Questions
```bash
curl http://localhost:3001/api/questions
```

### Get Platform Stats
```bash
curl http://localhost:3001/api/stats/platform
```

## Current Architecture

```
Frontend (React)
    ↓
Supabase (PostgreSQL) ← Primary Data Store
    ↓
Smart Contract (BSC)


Backend (Node.js/Express) ← OPTIONAL
    ↓
MongoDB ← Separate from frontend
    ↓
Smart Contract (BSC)
```

The frontend and backend are now **independent systems**. The frontend uses Supabase, and the backend (if you run it) uses MongoDB.

## Why the Backend is Optional

1. **Direct Database Access**: Frontend connects to Supabase directly
2. **Web3 Integration**: Blockchain calls happen in the frontend via MetaMask
3. **Real-time Updates**: Supabase provides real-time subscriptions
4. **Simplified Deployment**: One less service to manage

## When You Might Need the Backend

- **Cron Jobs**: Automated question settlement
- **Event Listeners**: Listen to blockchain events and sync to database
- **Admin Operations**: Bulk operations that shouldn't run in frontend
- **Analytics**: Heavy data processing
- **Webhooks**: External integrations

## Troubleshooting

### "Cannot find module 'express'"
```bash
cd backend
npm install
```

### "MongoDB connection error"
- Check if MongoDB is running: `mongosh` (for local)
- Verify connection string in `.env`
- Check network access in MongoDB Atlas

### "Contract address not configured"
This is expected before deployment. The backend will work for basic API endpoints, but blockchain features require a deployed contract.

### Port 3001 already in use
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Or use a different port in .env
PORT=3002
```

## Next Steps

1. **Deploy Smart Contract** (Required for full functionality)
2. **Configure Frontend** with contract address
3. **Run Frontend Only** with `npm run dev` (in project root)
4. **Skip Backend** unless you need the optional features above

## Questions?

- Frontend works without backend: ✅
- Backend is completely optional: ✅
- Both can run simultaneously: ✅
- They use different databases: ✅ (Supabase vs MongoDB)
