# API Documentation

Complete API reference for the Betting Pool Platform.

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Response Format

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Questions API

### 1. Get All Questions

Retrieve all betting questions with optional filters.

**Endpoint:** `GET /questions`

**Query Parameters:**
- `status` (optional): Filter by status (`open`, `closed`, `settled`, `cancelled`)
- `category` (optional): Filter by category (e.g., `crypto`, `sports`, `technology`)

**Example Request:**
```bash
curl "http://localhost:3001/api/questions?status=open&category=crypto"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Will Bitcoin reach $100K by end of 2026?",
      "description": "Prediction about Bitcoin price",
      "category": "crypto",
      "deadline": "2026-12-31T23:59:59Z",
      "settlement_date": null,
      "contract_question_id": 0,
      "status": "open",
      "result": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "pool_stats": {
        "yes_ocro_total": "45",
        "yes_usdt_total": "45",
        "yes_participants": 45,
        "no_ocro_total": "55",
        "no_usdt_total": "55",
        "no_participants": 55
      }
    }
  ]
}
```

---

### 2. Get Question by ID

Retrieve detailed information about a specific question.

**Endpoint:** `GET /questions/:id`

**Parameters:**
- `id` (required): Question UUID

**Example Request:**
```bash
curl "http://localhost:3001/api/questions/uuid-here"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Will Bitcoin reach $100K?",
    "description": "...",
    "category": "crypto",
    "deadline": "2026-12-31T23:59:59Z",
    "status": "open",
    "pool_stats": { ... },
    "bets": [
      {
        "id": "uuid",
        "user_address": "0x...",
        "outcome": "yes",
        "ocro_amount": "1",
        "usdt_amount": "1",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 3. Create Question (Admin Only)

Create a new betting question.

**Endpoint:** `POST /questions`

**Request Body:**
```json
{
  "title": "Will Bitcoin reach $100K by end of 2026?",
  "description": "Detailed description of the question",
  "category": "crypto",
  "deadline": "2026-12-31T23:59:59Z"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/questions" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Will Bitcoin reach $100K?",
    "description": "By end of 2026",
    "category": "crypto",
    "deadline": "2026-12-31T23:59:59Z"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Will Bitcoin reach $100K?",
    "contract_question_id": 0,
    "status": "open"
  },
  "transactionHash": "0x..."
}
```

---

### 4. Settle Question (Admin Only)

Settle a question and determine the winning outcome.

**Endpoint:** `POST /questions/:id/settle`

**Parameters:**
- `id` (required): Question UUID

**Request Body:**
```json
{
  "result": "yes"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/questions/uuid/settle" \
  -H "Content-Type: application/json" \
  -d '{"result": "yes"}'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "settled",
    "result": "yes",
    "settlement_date": "2024-01-01T00:00:00Z"
  },
  "transactionHash": "0x..."
}
```

---

### 5. Sync Question from Blockchain

Sync question data from the smart contract.

**Endpoint:** `POST /questions/sync/:contractQuestionId`

**Parameters:**
- `contractQuestionId` (required): Question ID on the smart contract

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/questions/sync/0"
```

---

## Bets API

### 1. Record Bet

Record a bet placed on the blockchain.

**Endpoint:** `POST /bets`

**Request Body:**
```json
{
  "questionId": "uuid",
  "userAddress": "0x1234...",
  "outcome": "yes",
  "transactionHash": "0xabcd..."
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/bets" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "uuid",
    "userAddress": "0x1234...",
    "outcome": "yes",
    "transactionHash": "0xabcd..."
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "question_id": "uuid",
    "user_address": "0x1234...",
    "outcome": "yes",
    "ocro_amount": "1",
    "usdt_amount": "1",
    "transaction_hash": "0xabcd...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 2. Get User Bets

Get all bets placed by a specific user.

**Endpoint:** `GET /bets/user/:userAddress`

**Parameters:**
- `userAddress` (required): User's wallet address

**Example Request:**
```bash
curl "http://localhost:3001/api/bets/user/0x1234..."
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "outcome": "yes",
      "is_winner": true,
      "questions": {
        "title": "Will Bitcoin reach $100K?",
        "status": "settled"
      }
    }
  ]
}
```

---

### 3. Get Question Bets

Get all bets for a specific question.

**Endpoint:** `GET /bets/question/:questionId`

**Parameters:**
- `questionId` (required): Question UUID

**Example Request:**
```bash
curl "http://localhost:3001/api/bets/question/uuid"
```

---

### 4. Calculate Winnings

Calculate potential winnings for a user on a question.

**Endpoint:** `GET /bets/winnings/:questionId/:userAddress`

**Parameters:**
- `questionId` (required): Question UUID
- `userAddress` (required): User's wallet address

**Example Request:**
```bash
curl "http://localhost:3001/api/bets/winnings/uuid/0x1234..."
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "ocroWinnings": "3.1",
    "usdtWinnings": "3.1"
  }
}
```

---

### 5. Record Withdrawal

Record a winnings withdrawal.

**Endpoint:** `POST /bets/withdraw`

**Request Body:**
```json
{
  "questionId": "uuid",
  "userAddress": "0x1234...",
  "ocroAmount": "3.1",
  "usdtAmount": "3.1",
  "transactionHash": "0xabcd..."
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/bets/withdraw" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "uuid",
    "userAddress": "0x1234...",
    "ocroAmount": "3.1",
    "usdtAmount": "3.1",
    "transactionHash": "0xabcd..."
  }'
```

---

### 6. Get User Withdrawals

Get all withdrawals for a specific user.

**Endpoint:** `GET /bets/withdrawals/:userAddress`

**Parameters:**
- `userAddress` (required): User's wallet address

**Example Request:**
```bash
curl "http://localhost:3001/api/bets/withdrawals/0x1234..."
```

---

## Statistics API

### 1. Get Pool Stats

Get statistics for a specific question pool.

**Endpoint:** `GET /stats/pool/:questionId`

**Parameters:**
- `questionId` (required): Question UUID

**Example Request:**
```bash
curl "http://localhost:3001/api/stats/pool/uuid"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "yes_ocro_total": "45",
    "yes_usdt_total": "45",
    "yes_participants": 45,
    "no_ocro_total": "55",
    "no_usdt_total": "55",
    "no_participants": 55,
    "admin_fee_ocro": "0",
    "admin_fee_usdt": "0",
    "questions": {
      "title": "Will Bitcoin reach $100K?",
      "status": "open"
    }
  }
}
```

---

### 2. Get Platform Stats

Get overall platform statistics.

**Endpoint:** `GET /stats/platform`

**Example Request:**
```bash
curl "http://localhost:3001/api/stats/platform"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "questions": {
      "total": 50,
      "open": 20,
      "settled": 30
    },
    "bets": {
      "total": 1000,
      "totalOcroStaked": "1000",
      "totalUsdtStaked": "1000"
    },
    "withdrawals": {
      "total": 300,
      "totalOcroWithdrawn": "350",
      "totalUsdtWithdrawn": "350"
    }
  }
}
```

---

### 3. Get User Stats

Get statistics for a specific user.

**Endpoint:** `GET /stats/user/:userAddress`

**Parameters:**
- `userAddress` (required): User's wallet address

**Example Request:**
```bash
curl "http://localhost:3001/api/stats/user/0x1234..."
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "bets": {
      "total": 50,
      "active": 10,
      "settled": 40,
      "won": 25,
      "lost": 15,
      "winRate": "62.50"
    },
    "staked": {
      "totalOcroStaked": "50",
      "totalUsdtStaked": "50"
    },
    "withdrawn": {
      "totalOcroWithdrawn": "75",
      "totalUsdtWithdrawn": "75"
    },
    "profit": {
      "ocroProfit": "25",
      "usdtProfit": "25"
    }
  }
}
```

---

### 4. Get Leaderboard

Get the top 100 users by total winnings.

**Endpoint:** `GET /stats/leaderboard`

**Example Request:**
```bash
curl "http://localhost:3001/api/stats/leaderboard"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "address": "0x1234...",
      "totalBets": 100,
      "wonBets": 70,
      "lostBets": 30,
      "totalWithdrawn": "500",
      "winRate": "70.00"
    }
  ]
}
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding rate limiting middleware.

## Authentication

Currently no authentication is required. The API relies on blockchain transaction verification. For admin operations in production, consider adding authentication.

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.
