# Betting Pool Platform - Complete Project Overview

A decentralized betting platform built on Binance Smart Chain (BSC) with OCRO and USDT tokens.

## 🎯 Project Structure

```
project/
├── backend/                    # Backend API & Smart Contracts
│   ├── contracts/             # Solidity smart contracts
│   │   ├── BettingPool.sol   # Main betting contract
│   │   ├── hardhat.config.js # Hardhat configuration
│   │   ├── package.json      # Contract dependencies
│   │   └── scripts/
│   │       └── deploy.js     # Deployment script
│   ├── config/                # Configuration files
│   │   ├── database.js       # Supabase connection
│   │   ├── blockchain.js     # Web3 configuration
│   │   └── BettingPoolABI.json
│   ├── controllers/           # API controllers
│   │   ├── questionController.js
│   │   ├── betController.js
│   │   └── statsController.js
│   ├── routes/               # API routes
│   │   ├── questionRoutes.js
│   │   ├── betRoutes.js
│   │   └── statsRoutes.js
│   ├── scripts/              # Utility scripts
│   │   ├── initDatabase.js
│   │   └── schema.sql        # Database schema
│   ├── server.js             # Express server
│   ├── package.json
│   ├── .env.example
│   ├── README.md             # Complete backend docs
│   ├── QUICKSTART.md         # Quick start guide
│   └── API_DOCUMENTATION.md  # API reference
│
└── src/                      # Frontend (React + TypeScript)
    ├── components/
    │   ├── Header.tsx
    │   ├── Hero.tsx
    │   ├── HowItWorks.tsx
    │   ├── BettingQuestion.tsx
    │   └── UserPositions.tsx
    ├── types/
    │   └── betting.ts
    ├── App.tsx
    └── main.tsx
```

## 🏗️ System Architecture

### Three-Layer Architecture

1. **Smart Contract Layer (BSC)**
   - Handles all financial transactions
   - Manages betting pools and settlements
   - Distributes winnings
   - Collects admin fees (10% from losing pool)

2. **Backend API Layer (Node.js + Express)**
   - Coordinates between blockchain and database
   - Provides REST API for frontend
   - Manages off-chain data
   - Handles business logic

3. **Database Layer (Supabase/PostgreSQL)**
   - Stores question metadata
   - Tracks user bets and history
   - Maintains statistics and leaderboards
   - Provides fast queries

### Data Distribution Strategy

**On-Chain (Immutable, Transparent):**
- Question creation and deadlines
- Bet placements (1 OCRO + 1 USDT each)
- Pool totals (YES/NO for both tokens)
- Settlement results
- Winnings calculations
- Admin fee collection

**Off-Chain (Fast, Flexible):**
- Question descriptions and categories
- User profiles and preferences
- Historical data and analytics
- Leaderboards and rankings
- UI state and metadata

## 🔐 Security Model

### Smart Contract Security
- Immutable after deployment
- Owner can only create questions and settle results
- Cannot manipulate balances or outcomes
- Transparent fee structure (10% from losing pool)
- All funds managed on-chain

### Backend Security
- Service role authentication for database writes
- Row Level Security (RLS) on all tables
- Public read access for transparency
- Environment variable protection
- No private keys stored in database

### Frontend Security
- User connects their own wallet
- All transactions signed by user
- No server-side wallet operations
- Token approvals required before betting

## 💰 Economic Model

### Betting Mechanics
- Fixed stake: 1 OCRO + 1 USDT per bet
- Binary outcomes: YES or NO
- Multiple simultaneous questions supported
- Deadline-based betting closure

### Reward Distribution
1. Losers' pools collected (OCRO and USDT separately)
2. 10% admin fee deducted from losing pool
3. Remaining 90% distributed proportionally to winners
4. Winners also get their original stake back

### Example Calculation
```
Initial Pool:
- YES: 30 users × (1 OCRO + 1 USDT) = 30 OCRO + 30 USDT
- NO: 70 users × (1 OCRO + 1 USDT) = 70 OCRO + 70 USDT

Result: YES wins

Distribution:
- Admin fee: 70 × 10% = 7 OCRO + 7 USDT
- To distribute: 70 - 7 = 63 OCRO + 63 USDT
- Each YES bettor: 1 + (63/30) = 3.1 OCRO + 3.1 USDT
- ROI: 210% (3.1x return)
```

## 🚀 Deployment Guide

### Prerequisites
- Node.js 18+
- Supabase account
- BSC wallet with BNB
- OCRO and USDT token addresses

### Quick Deployment

1. **Set up Database**
   ```bash
   # Run schema.sql in Supabase SQL Editor
   ```

2. **Configure Environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Deploy Smart Contract**
   ```bash
   cd contracts
   npm install
   npm run deploy:testnet
   # Copy contract address to .env
   ```

4. **Start Backend**
   ```bash
   cd ..
   npm install
   npm start
   ```

5. **Build Frontend**
   ```bash
   cd ../..
   npm install
   npm run build
   ```

See `backend/QUICKSTART.md` for detailed steps.

## 📡 API Endpoints

### Questions
- `GET /api/questions` - List all questions
- `GET /api/questions/:id` - Get question details
- `POST /api/questions` - Create question (admin)
- `POST /api/questions/:id/settle` - Settle question (admin)

### Bets
- `POST /api/bets` - Record bet
- `GET /api/bets/user/:address` - Get user's bets
- `GET /api/bets/winnings/:questionId/:address` - Calculate winnings
- `POST /api/bets/withdraw` - Record withdrawal

### Stats
- `GET /api/stats/platform` - Platform statistics
- `GET /api/stats/user/:address` - User statistics
- `GET /api/stats/leaderboard` - Top 100 users

See `backend/API_DOCUMENTATION.md` for complete reference.

## 🔧 Tech Stack

### Smart Contracts
- Solidity 0.8.19
- Hardhat for development
- OpenZeppelin for standards
- BSC network

### Backend
- Node.js 18+
- Express.js
- ethers.js v6
- Supabase client
- TypeScript support

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React icons

### Database
- Supabase (PostgreSQL)
- Row Level Security
- Real-time capabilities
- Built-in authentication

## 📊 Database Schema

### Tables
- **questions** - Betting questions and metadata
- **bets** - Individual bets with transaction hashes
- **withdrawals** - Withdrawal records
- **pool_stats** - Real-time pool statistics

All tables have RLS enabled with public read and service role write policies.

## 🎮 User Flow

### For Bettors

1. **Connect Wallet**
   - MetaMask or compatible wallet
   - Switch to BSC network

2. **Approve Tokens**
   - Approve OCRO spending
   - Approve USDT spending

3. **Place Bet**
   - Choose a question
   - Select YES or NO
   - Confirm transaction

4. **Wait for Settlement**
   - Monitor question status
   - Check pool statistics

5. **Claim Winnings**
   - After settlement
   - Call withdraw function
   - Receive tokens to wallet

### For Admins

1. **Create Question**
   - Define title and description
   - Set deadline
   - Deploy to blockchain

2. **Monitor Pools**
   - Track participation
   - View pool balances

3. **Settle Question**
   - After deadline passes
   - Determine correct outcome
   - Execute settlement

4. **Withdraw Fees**
   - Collect accumulated fees
   - 10% from each losing pool

## 🧪 Testing

### Smart Contract Testing
```bash
cd backend/contracts
npx hardhat test
```

### API Testing
```bash
cd backend
npm start
# Use Postman or curl to test endpoints
```

### Frontend Testing
```bash
npm run dev
# Manual testing in browser
```

## 📈 Monitoring & Analytics

### Platform Metrics
- Total questions created
- Total bets placed
- Total value locked (TVL)
- Admin fees collected
- Active users

### User Metrics
- Win rate
- Total bets
- Profit/loss
- Active positions
- Withdrawal history

### Question Metrics
- Pool distribution (YES/NO)
- Participant count
- Total value per side
- Settlement result

## 🔒 Security Considerations

### Smart Contract
- Fixed bet amounts prevent manipulation
- Deadline enforcement
- Owner-only settlement
- No backdoors or upgrade mechanisms
- Event-driven transparency

### Backend
- Environment variables for secrets
- Service role for database access
- Input validation on all endpoints
- Error handling without leaking info

### Frontend
- User controls their own keys
- All transactions require confirmation
- No server-side signing
- Clear transaction previews

## 📝 Best Practices

### For Development
- Test on testnet first
- Verify contract on BSCScan
- Monitor gas usage
- Keep dependencies updated

### For Production
- Audit smart contract
- Set up monitoring
- Configure rate limiting
- Enable error tracking
- Set up backups

### For Users
- Never share private keys
- Verify contract address
- Check token approvals
- Monitor transactions
- Keep wallet secure

## 🆘 Troubleshooting

### Common Issues

**"Insufficient funds"**
- Get testnet BNB from faucet
- Ensure enough for gas fees

**"Transaction reverted"**
- Check token approvals
- Verify deadline hasn't passed
- Ensure question exists

**"Database connection failed"**
- Check Supabase credentials
- Verify RLS policies
- Run schema.sql

**"Contract not found"**
- Verify contract address
- Check network selection
- Confirm deployment

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [Supabase Documentation](https://supabase.com/docs)
- [BSC Documentation](https://docs.bnbchain.org/)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

- Check documentation in `backend/README.md`
- Review API docs in `backend/API_DOCUMENTATION.md`
- Follow quick start in `backend/QUICKSTART.md`
- Open issues on GitHub

---

**Built with ❤️ for decentralized prediction markets**
