# FTR Predict - Decentralized Prediction Market

A blockchain-based prediction market platform built on Cronos zkEVM where users can bet on outcomes of real-world events using USDT and earn rewards in OCRO tokens.

## Project Structure

```
├── frontend/          # React + Vite frontend application
├── backend/           # Node.js + Express backend API
├── docs/             # Documentation files
├── .env              # Environment variables
└── README.md         # This file
```

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Documentation

- [Project Overview](PROJECT_OVERVIEW.md) - Complete system architecture and features
- [Setup Guide](SETUP_GUIDE.md) - Detailed installation instructions
- [Admin Guide](ADMIN_GUIDE.md) - Admin panel usage and question management
- [Testing Guide](TESTING_GUIDE.md) - Testing procedures and verification
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
- [Withdrawal Guide](WITHDRAWAL_GUIDE.md) - How to withdraw winnings
- [Frontend Integration](FRONTEND_INTEGRATION.md) - Frontend technical details
- [Deployment Info](DEPLOYMENT_INFO.md) - Deployment instructions

## Technology Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- ethers.js for blockchain interaction
- Lucide React for icons

### Backend
- Node.js + Express
- MongoDB for data persistence
- ethers.js for smart contract interaction
- RESTful API architecture

### Blockchain
- Cronos zkEVM Testnet
- Solidity smart contracts
- USDT for betting
- OCRO for rewards

## Key Features

- Real-time prediction markets
- Secure blockchain-based betting
- Admin panel for question management
- Automatic payout distribution
- User position tracking
- Dark/Light theme support

## Environment Variables

Copy `.env` file and configure with your settings:
- MongoDB connection string
- Cronos zkEVM RPC URLs
- Contract addresses
- Admin wallet private key

## License

MIT
