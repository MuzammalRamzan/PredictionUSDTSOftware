# Troubleshooting Guide

## Issue: "Already Settled" Error When Trying to Settle Questions

### Problem Description
When attempting to settle a question through the Admin Panel, you receive an "already settled" error even though the question appears as unsettled in the admin interface.

### Root Cause
This occurs when there's a mismatch between the blockchain state and the database state. A question may be settled on the blockchain but not marked as settled in the MongoDB database.

This can happen when:
1. A question was settled directly through a blockchain transaction without updating the database
2. The database update failed after a successful blockchain settlement
3. Manual intervention was performed on the blockchain

### How to Check for This Issue

1. **Check Database State:**
   ```bash
   cd backend
   # Create a script to check database questions
   node -e "import('./models/Question.js').then(m => m.default.find({}).then(console.log))"
   ```

2. **Check Blockchain State:**
   The frontend now automatically checks the blockchain state before attempting to settle a question.

### Solution

The issue has been fixed with the following improvements:

#### 1. Automatic Blockchain State Check
The Admin Panel now checks if a question is already settled on the blockchain before attempting to settle it. If it detects a mismatch, it will:
- Display a message: "This question is already settled on the blockchain. Syncing database..."
- Automatically sync the database with the blockchain state
- Refresh the admin panel to show the updated status

#### 2. Better Error Handling
The settle function now provides clearer error messages when blockchain operations fail.

### Prevention

To prevent this issue in the future:

1. **Always use the Admin Panel to settle questions** - Don't interact with the smart contract directly unless necessary
2. **Monitor both blockchain and database states** - Use the built-in sync functionality
3. **Keep the backend running** - Ensure the backend API is accessible when settling questions

### Manual Sync (If Needed)

If you need to manually sync all questions from blockchain to database, you can create a sync script:

```javascript
// sync-all-questions.js
import mongoose from 'mongoose';
import { ethers } from 'ethers';
import Question from './models/Question.js';
import BettingPoolABI from './config/BettingPoolABI.json' with { type: 'json' };

const provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_RPC_URL);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, BettingPoolABI, provider);

const questions = await Question.find({});
for (const q of questions) {
  const blockchainQ = await contract.getQuestion(q.contract_question_id);
  if (blockchainQ.isSettled && q.status !== 'settled') {
    q.status = 'settled';
    q.result = blockchainQ.result ? 'yes' : 'no';
    q.settlement_date = new Date();
    await q.save();
    console.log(`Synced question ${q.contract_question_id}`);
  }
}
```

### Contact Support

If you continue to experience issues after following these steps, please check:
1. Your wallet is connected
2. You're on the correct network (BSC Testnet/Mainnet)
3. The backend API is running and accessible
4. Your wallet address is listed in the `ADMIN_ADDRESSES` environment variable
