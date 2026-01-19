# Complete Setup Guide

## ✅ What's Already Done

1. **Supabase Database** - Schema applied with tables:
   - `questions` - Betting questions/markets
   - `bets` - User bets tracking
   - `withdrawals` - Withdrawal history
   - `pool_stats` - Pool statistics
   - Row Level Security (RLS) enabled on all tables

2. **Frontend Configuration** - Connected to Supabase
3. **Backend Dependencies** - All npm packages installed

---

## 🔧 Required Setup Steps

### Step 1: Get Supabase Service Role Key

1. Go to your Supabase project: https://supabase.com/dashboard/project/gqscklrjbtcnccdmkxbb
2. Click on **Settings** (gear icon in sidebar)
3. Click on **API** section
4. Find **Service Role Key** (secret key - keep it safe!)
5. Copy the service role key

### Step 2: Update Backend Configuration

Open `backend/.env` and replace `your_service_role_key_here` with your actual service role key:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Blockchain Setup (Required for Betting)

#### Option A: Deploy Smart Contract to BSC Testnet

1. Install contract dependencies:
   ```bash
   cd backend/contracts
   npm install
   ```

2. Create `backend/contracts/.env`:
   ```env
   BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
   PRIVATE_KEY=your_wallet_private_key
   ```

3. Get testnet BNB from faucet: https://testnet.bnbchain.org/faucet-smart

4. Deploy contract:
   ```bash
   npx hardhat run scripts/deploy.js --network bscTestnet
   ```

5. Copy the deployed contract address

#### Option B: Use Existing Contract

If you already have a deployed contract, skip deployment.

### Step 4: Update Backend .env with Contract Details

Edit `backend/.env`:

```env
CONTRACT_ADDRESS=0x... # Your deployed contract address
PRIVATE_KEY=0x... # Private key for backend operations
OCRO_TOKEN_ADDRESS_TESTNET=0x... # OCRO token address
USDT_TOKEN_ADDRESS_TESTNET=0x... # USDT token address on testnet
```

---

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

Backend runs on: http://localhost:3001

### Start Frontend (In a new terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

---

## 🧪 Testing the Setup

### Test Backend Health

```bash
curl http://localhost:3001/health
```

Expected response: `{"status":"ok","timestamp":"..."}`

### Test Database Connection

```bash
curl http://localhost:3001/api/questions
```

Expected response: `{"success":true,"data":[]}`

### Create a Test Question

```bash
curl -X POST http://localhost:3001/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Will Bitcoin reach $100k by end of 2024?",
    "description": "Market prediction for BTC price",
    "category": "crypto",
    "deadline": "2024-12-31T23:59:59Z"
  }'
```

---

## 📁 Project Structure

```
project/
├── frontend/              # React frontend application
│   ├── src/              # React components and app code
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
├── backend/              # Node.js backend API
│   ├── server.js         # Main API server
│   ├── config/           # Database & blockchain config
│   ├── controllers/      # Business logic
│   ├── routes/           # API endpoints
│   ├── contracts/        # Smart contracts & deployment
│   └── .env             # Backend configuration
└── .env                  # Environment variables
```

---

## 🔐 Security Notes

- Never commit `.env` files to git
- Keep your service role key secure
- Use testnet for development
- Private keys should be from test wallets only

---

## 📚 API Documentation

Full API documentation available in: `backend/API_DOCUMENTATION.md`

### Key Endpoints

- `GET /api/questions` - List all betting questions
- `POST /api/questions` - Create new question
- `POST /api/bets` - Place a bet
- `GET /api/stats/:questionId` - Get pool statistics
- `GET /api/bets/user/:address` - Get user's bets

---

## ❓ Troubleshooting

### Backend won't start
- Check if port 3001 is already in use
- Verify SUPABASE_SERVICE_ROLE_KEY is set correctly
- Check backend/.env file exists

### Database errors
- Verify Supabase project is active
- Check if tables exist in Supabase dashboard
- Verify service role key permissions

### Smart contract errors
- Ensure you have testnet BNB
- Verify contract is deployed
- Check CONTRACT_ADDRESS is set correctly
- Confirm wallet has permissions

---

## 🎯 Next Steps

1. Get your Supabase service role key and add it to `backend/.env`
2. Decide if you want to deploy your own contract or use an existing one
3. Start both backend and frontend servers
4. Create test questions and start betting!

For development without blockchain (database only), you can test the API endpoints that don't require contract interactions.
