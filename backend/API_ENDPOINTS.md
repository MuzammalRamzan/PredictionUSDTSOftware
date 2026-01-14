# Betting Pool API - Complete Endpoint Reference

Base URL: `http://localhost:3001`

## Table of Contents
- [Health & Info](#health--info)
- [Questions](#questions)
- [Bets](#bets)
- [Statistics](#statistics)

---

## Health & Info

### 1. Health Check
**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-14T12:00:00.000Z"
}
```

### 2. API Information
**GET** `/`

Get API version and available endpoints.

**Response:**
```json
{
  "message": "Betting Pool API",
  "version": "1.0.0",
  "endpoints": {
    "questions": "/api/questions",
    "bets": "/api/bets",
    "stats": "/api/stats"
  }
}
```

---

## Questions

### 1. Get All Questions
**GET** `/api/questions`

Retrieve all betting questions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "contractQuestionId": 1,
      "question": "Will Bitcoin reach $100,000 by end of 2024?",
      "description": "This bet will be settled based on the BTC/USD price on major exchanges",
      "endTime": "2024-12-31T23:59:59.000Z",
      "creator": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "isSettled": false,
      "answer": null,
      "totalYesAmount": "0",
      "totalNoAmount": "0",
      "minBetAmount": "0.01",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Get Question by ID
**GET** `/api/questions/:id`

Get details of a specific question.

**Parameters:**
- `id` (path) - MongoDB ObjectId of the question

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "contractQuestionId": 1,
    "question": "Will Bitcoin reach $100,000 by end of 2024?",
    "isSettled": false,
    "totalYesAmount": "0.5",
    "totalNoAmount": "0.3"
  }
}
```

### 3. Create Question
**POST** `/api/questions`

Create a new betting question.

**Request Body:**
```json
{
  "contractQuestionId": 1,
  "question": "Will Bitcoin reach $100,000 by end of 2024?",
  "description": "This bet will be settled based on the BTC/USD price on major exchanges",
  "endTime": "2024-12-31T23:59:59.000Z",
  "creator": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "minBetAmount": "0.01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "contractQuestionId": 1,
    "question": "Will Bitcoin reach $100,000 by end of 2024?",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Settle Question
**POST** `/api/questions/:id/settle`

Settle a question with the correct answer.

**Parameters:**
- `id` (path) - MongoDB ObjectId of the question

**Request Body:**
```json
{
  "answer": true,
  "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isSettled": true,
    "answer": true,
    "settledAt": "2024-12-31T23:59:59.000Z"
  }
}
```

### 5. Sync Question from Blockchain
**POST** `/api/questions/sync/:contractQuestionId`

Sync question data from the blockchain smart contract.

**Parameters:**
- `contractQuestionId` (path) - The question ID on the smart contract

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "contractQuestionId": 1,
    "synced": true
  }
}
```

---

## Bets

### 1. Record Bet
**POST** `/api/bets`

Record a new bet for a question.

**Request Body:**
```json
{
  "questionId": 1,
  "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "answer": true,
  "amount": "0.1",
  "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "questionId": 1,
    "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "answer": true,
    "amount": "0.1",
    "timestamp": "2024-01-15T12:00:00.000Z"
  }
}
```

### 2. Get User Bets
**GET** `/api/bets/user/:userAddress`

Get all bets placed by a specific user.

**Parameters:**
- `userAddress` (path) - Ethereum wallet address of the user

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "questionId": 1,
      "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "answer": true,
      "amount": "0.1",
      "timestamp": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

### 3. Get Question Bets
**GET** `/api/bets/question/:questionId`

Get all bets for a specific question.

**Parameters:**
- `questionId` (path) - The contract question ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "questionId": 1,
      "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "answer": true,
      "amount": "0.1"
    }
  ]
}
```

### 4. Calculate Winnings
**GET** `/api/bets/winnings/:questionId/:userAddress`

Calculate potential winnings for a user on a specific question.

**Parameters:**
- `questionId` (path) - The contract question ID
- `userAddress` (path) - Ethereum wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBetAmount": "0.1",
    "potentialWinnings": "0.15",
    "hasWon": true,
    "roi": "50%"
  }
}
```

### 5. Record Withdrawal
**POST** `/api/bets/withdraw`

Record a withdrawal of winnings.

**Request Body:**
```json
{
  "questionId": 1,
  "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "0.15",
  "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "questionId": 1,
    "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "0.15",
    "timestamp": "2024-01-16T12:00:00.000Z"
  }
}
```

### 6. Get User Withdrawals
**GET** `/api/bets/withdrawals/:userAddress`

Get all withdrawals for a specific user.

**Parameters:**
- `userAddress` (path) - Ethereum wallet address

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "questionId": 1,
      "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "amount": "0.15",
      "timestamp": "2024-01-16T12:00:00.000Z"
    }
  ]
}
```

---

## Statistics

### 1. Get Pool Stats
**GET** `/api/stats/pool/:questionId`

Get statistics for a specific betting pool/question.

**Parameters:**
- `questionId` (path) - The contract question ID

**Response:**
```json
{
  "success": true,
  "data": {
    "questionId": 1,
    "totalBets": 10,
    "totalYesAmount": "0.5",
    "totalNoAmount": "0.3",
    "totalPoolValue": "0.8",
    "uniqueBettors": 8,
    "yesPercentage": "62.5%",
    "noPercentage": "37.5%"
  }
}
```

### 2. Get Platform Stats
**GET** `/api/stats/platform`

Get overall platform statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalQuestions": 25,
    "activeQuestions": 10,
    "settledQuestions": 15,
    "totalBets": 500,
    "totalVolume": "125.5",
    "totalUsers": 150,
    "totalWithdrawals": "75.2"
  }
}
```

### 3. Get User Stats
**GET** `/api/stats/user/:userAddress`

Get statistics for a specific user.

**Parameters:**
- `userAddress` (path) - Ethereum wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "totalBets": 15,
    "totalBetAmount": "1.5",
    "totalWinnings": "2.1",
    "totalWithdrawals": "1.8",
    "winRate": "66.7%",
    "roi": "40%"
  }
}
```

### 4. Get Leaderboard
**GET** `/api/stats/leaderboard`

Get the leaderboard of top users.

**Query Parameters:**
- `limit` (optional) - Number of top users to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "totalWinnings": "5.5",
      "totalBets": 20,
      "winRate": "75%",
      "rank": 1
    },
    {
      "userAddress": "0x123abc456def789ghi012jkl345mno678pqr901st",
      "totalWinnings": "4.2",
      "totalBets": 18,
      "winRate": "70%",
      "rank": 2
    }
  ]
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Environment Variables

Make sure to set these in your `.env` file:

```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
CONTRACT_ADDRESS=your_deployed_contract_address
PRIVATE_KEY=your_wallet_private_key
NETWORK=testnet
```

---

## Postman Collection

Import the `Betting_Pool_API.postman_collection.json` file into Postman to get started immediately.

### How to Import:
1. Open Postman
2. Click "Import" button
3. Select the `Betting_Pool_API.postman_collection.json` file
4. The collection will be added to your workspace

### Collection Variables:
- `baseUrl`: http://localhost:3001
- `userAddress`: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb (example)
- `questionId`: 1 (example)

You can modify these variables in Postman after importing.
