# FTR Predict Frontend

React-based frontend application for the FTR Predict decentralized prediction market.

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Backend API (optional if using Supabase directly)
VITE_API_URL=http://localhost:3001/api

# Smart Contract Configuration (REQUIRED)
VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
VITE_NETWORK=testnet

# Token Addresses (REQUIRED)
VITE_OCRO_TOKEN_ADDRESS=0xYourOCROTokenAddressHere
VITE_USDT_TOKEN_ADDRESS=0xYourUSDTTokenAddressHere

# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** The `.env` file must be in the `frontend/` directory for Vite to load it.

## Development

```bash
npm run dev
```

The application will start on `http://localhost:5173`

**Note:** After changing environment variables, you must restart the dev server.

## Build

```bash
npm run build
```

## Features

- Connect wallet (MetaMask)
- Browse active prediction markets
- Place bets with FTR and USDT tokens
- Track user positions and statistics
- Claim winnings from settled questions
- Admin panel for question management
- Dark/Light theme support
- Real-time updates via Supabase

## Tech Stack

- React 18
- Vite
- TailwindCSS
- ethers.js v6
- Supabase (PostgreSQL)
- Lucide React (icons)

## Project Structure

```
src/
├── components/      # React components
│   ├── AdminPanel.jsx
│   ├── BettingQuestion.jsx
│   ├── Header.jsx
│   ├── Hero.jsx
│   ├── HowItWorks.jsx
│   └── UserPositions.jsx
├── contexts/        # React contexts
│   └── ThemeContext.jsx
├── services/        # Services
│   ├── api.js       # Backend API calls
│   └── web3.js      # Web3/blockchain interactions
└── config/          # Configuration
    ├── admin.js
    └── BettingPoolABI.json
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONTRACT_ADDRESS` | Yes | Deployed smart contract address |
| `VITE_OCRO_TOKEN_ADDRESS` | Yes | FTR/OCRO token address |
| `VITE_USDT_TOKEN_ADDRESS` | Yes | USDT token address |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `VITE_NETWORK` | Yes | Network (mainnet or testnet) |
| `VITE_API_URL` | No | Backend API URL (optional) |

## Troubleshooting

### "invalid value for Contract target"

This error means the contract address is not configured or invalid:
1. Check that `.env` exists in the `frontend/` directory
2. Verify `VITE_CONTRACT_ADDRESS` is set correctly
3. Restart the dev server after changing `.env`

### MetaMask Network Issues

Make sure you're connected to the correct network:
- Testnet: BSC Testnet (Chain ID: 97)
- Mainnet: BSC Mainnet (Chain ID: 56)

### Token Approval Failed

Ensure you have sufficient token balance and gas (BNB) for transactions.
