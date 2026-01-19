# FTR Predict Backend API

Node.js + Express backend for the FTR Predict decentralized prediction market platform.

## Architecture

The backend provides a REST API that:
- Manages questions, bets, and user data in MongoDB
- Provides statistics and leaderboard functionality
- Optionally syncs with smart contracts for blockchain data

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Required Configuration

```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Admin addresses (REQUIRED for creating/settling questions)
ADMIN_ADDRESSES=0xYourAdminAddress1,0xYourAdminAddress2
```

### Optional Blockchain Configuration

The backend works without blockchain configuration. Add these only if you want to sync data from smart contracts:

```env
# Network
NETWORK=testnet

# BSC RPC URLs
BSC_RPC_URL=https://bsc-dataseed.binance.org/
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# Contract Address
CONTRACT_ADDRESS=0xYourContractAddress
```

## Running

```bash
npm start
```

Server runs on `http://localhost:3001`

## API Endpoints

### Questions

- `GET /api/questions` - List all questions
- `GET /api/questions/:id` - Get question details
- `POST /api/questions` - Create question (admin only)
- `POST /api/questions/:id/settle` - Settle question (admin only)
- `POST /api/questions/sync/:contractQuestionId` - Sync from blockchain (requires blockchain config)

### Bets

- `POST /api/bets` - Record a bet
- `GET /api/bets/user/:userAddress` - Get user's bets
- `GET /api/bets/question/:questionId` - Get bets for a question
- `GET /api/bets/winnings/:questionId/:userAddress` - Calculate winnings (requires blockchain config)
- `POST /api/bets/withdraw` - Record withdrawal
- `GET /api/bets/withdrawals/:userAddress` - Get user's withdrawals

### Statistics

- `GET /api/stats/pool/:questionId` - Get pool statistics
- `GET /api/stats/platform` - Get platform statistics
- `GET /api/stats/user/:userAddress` - Get user statistics
- `GET /api/stats/leaderboard` - Get top users leaderboard

## Database

Uses MongoDB with the following collections:
- `questions` - Betting questions
- `bets` - User bets
- `withdrawals` - Withdrawal records
- `poolstats` - Pool statistics

Collections are created automatically via Mongoose models.

## Admin Functions

Admin addresses configured in `ADMIN_ADDRESSES` can:
- Create new questions
- Settle questions and determine winners

## Blockchain Integration (Optional)

When blockchain configuration is provided:
- Questions can be synced from smart contracts
- Winnings can be calculated from contract state
- Transaction hashes are validated

Without blockchain configuration:
- All data is managed in MongoDB
- Winnings are calculated from withdrawal records
- System works as a standalone prediction market database

## Error Handling

The API returns JSON responses:

Success:
```json
{
  "success": true,
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Documentation

See also:
- [API Documentation](API_DOCUMENTATION.md) - Detailed API reference
- [API Endpoints](API_ENDPOINTS.md) - Endpoint listing
- [Quickstart Guide](QUICKSTART.md) - Quick setup guide

## License

MIT
