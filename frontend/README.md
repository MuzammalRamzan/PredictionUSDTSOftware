# FTR Predict Frontend

React-based frontend application for the FTR Predict decentralized prediction market.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

The application will start on `http://localhost:5173`

## Build

```bash
npm run build
```

## Environment Variables

The frontend uses the root `.env` file. Required variables:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_BETTING_POOL_ADDRESS` - Smart contract address
- `VITE_CRONOS_RPC_URL` - Cronos zkEVM RPC URL

## Features

- Connect wallet (MetaMask)
- Browse active prediction markets
- Place bets with USDT
- Track user positions
- Claim winnings
- Admin panel for question management
- Dark/Light theme support

## Tech Stack

- React 18
- Vite
- TailwindCSS
- ethers.js
- Lucide React

## Project Structure

```
src/
├── components/      # React components
├── contexts/        # React contexts (Theme)
├── services/        # API and Web3 services
└── config/          # Configuration files
```
