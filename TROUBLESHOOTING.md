# Troubleshooting Guide

## Issue: "Already Settled" Error When Trying to Settle Questions

### Problem Description
When attempting to settle a question through the Admin Panel, you receive an "already settled" error even though the question appears as unsettled in the admin interface.

### Root Cause
This occurs when there's a mismatch between the blockchain state and the database state. A question may be settled on the blockchain but not marked as settled in the MongoDB database.

This can happen when:
1. A question was settled directly through a blockchain transaction without updating the database
2. The database update failed after a successful blockchain settlement
3. Network issues caused the API call to fail after the blockchain transaction succeeded
4. Manual intervention was performed on the blockchain

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

The issue has been **FULLY FIXED** with the following improvements:

#### 1. Enhanced Sync Endpoint
The backend sync endpoint (`/api/questions/:contractQuestionId/sync`) now:
- Syncs settlement status from blockchain to database
- Updates the question result (yes/no)
- Marks winning bets correctly
- Updates pool statistics

#### 2. Automatic Recovery in Frontend
The Admin Panel now handles all settlement scenarios:

**Scenario A: Question Already Settled on Blockchain**
- Checks blockchain state before attempting settlement
- If already settled, automatically syncs database
- Shows clear message with the settlement result

**Scenario B: Blockchain Succeeds but Database Fails**
- Detects when blockchain transaction succeeds
- Catches database update failures
- Automatically triggers sync to update database
- Shows clear success message after sync

**Scenario C: User Retries After Failed Database Update**
- Catches "Already settled" blockchain error
- Automatically syncs database
- No need for manual intervention

#### 3. Sync All Questions Button
A new "Sync All Questions" button in the Admin Panel allows you to:
- Manually sync all questions from blockchain to database
- Fix any mismatches across all questions at once
- See a summary of synced questions

#### 4. Better Error Handling
The settle function now:
- Separates blockchain errors from database errors
- Provides specific error messages for each failure type
- Automatically recovers from known error states
- Logs detailed information for debugging

#### 5. Automatic Blockchain Verification on Load
The Admin Panel now verifies blockchain state when loading questions:
- Checks each "ended but unsettled" question against the blockchain
- Automatically syncs any questions that are already settled on blockchain
- Only displays questions that truly need settlement
- Prevents the "already settled" error by proactively detecting mismatches

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
