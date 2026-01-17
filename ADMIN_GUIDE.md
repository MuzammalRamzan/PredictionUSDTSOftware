# Admin Guide: Settling Questions & Reward Distribution

## Overview

As an admin, you are responsible for settling questions after their deadline has passed. This process enables winners to claim their rewards through the smart contract.

## Prerequisites

1. Connect your wallet to the platform
2. Ensure you're using the **admin wallet address** (the address that deployed the smart contract)
3. Make sure you have enough BNB for gas fees

## How to Settle Questions

### Step 1: Navigate to Admin Panel

1. Connect your wallet using the "Connect Wallet" button in the header
2. Click on "Admin" in the navigation menu
3. The Admin Panel will display all questions that have ended but haven't been settled yet

### Step 2: Review Question Details

For each ended question, you'll see:
- Question title
- Time since it ended
- YES pool statistics (participants, OCRO, and USDT amounts)
- NO pool statistics (participants, OCRO, and USDT amounts)

### Step 3: Select the Outcome

1. Review the question and determine the correct outcome
2. Click either **YES** or **NO** button to select the result
3. The selected button will turn blue (YES) or gray (NO)

### Step 4: Settle the Question

1. Once you've selected the outcome, click **"Settle Question & Distribute Rewards"**
2. Your wallet will prompt you to confirm the transaction
3. Wait for the transaction to be confirmed on the blockchain
4. A success notification will appear when the settlement is complete

### What Happens During Settlement

When you settle a question:

1. **On-Chain Settlement**: The smart contract records the result and marks the question as settled
2. **Admin Fee Calculation**: 10% of the losing pool is allocated as admin fees
3. **Winner Pool Distribution**: The remaining 90% of the losing pool is distributed proportionally among winners
4. **Reward Availability**: Winners can now claim their rewards through the "My Positions" section

### Example Scenario

Question: "Will Bitcoin reach $100,000 by end of Q1 2026?"

**Pool Statistics:**
- YES Pool: 50 participants, 50 OCRO, 50 USDT
- NO Pool: 30 participants, 30 OCRO, 30 USDT

**If you settle with result YES:**
- YES bettors win (50 participants)
- NO pool (30 OCRO + 30 USDT) becomes the prize pool
- Admin fee: 3 OCRO + 3 USDT (10% of losing pool)
- Distributed to winners: 27 OCRO + 27 USDT (90% of losing pool)
- Each YES bettor can claim their proportional share based on their stake

## After Settlement

Once a question is settled:

1. **Winners** can claim their rewards by:
   - Going to "My Positions" section
   - Finding the won position
   - Clicking "Withdraw" button

2. **Admin** can withdraw accumulated fees by calling the `withdrawAdminFees()` function on the smart contract

## Important Notes

1. **Irreversible**: Question settlement is **permanent** and cannot be undone. Double-check the outcome before settling.

2. **Only Admin**: Only the admin wallet (contract owner) can settle questions. Other wallets will receive an error.

3. **After Deadline**: Questions can only be settled after their deadline has passed.

4. **Gas Fees**: Settlement requires gas fees. Ensure you have enough BNB in your wallet.

5. **User Claims**: Settlement does NOT automatically distribute rewards. Winners must manually claim their rewards through the UI.

## Troubleshooting

### "Only admin can settle questions"
- You're not connected with the admin wallet
- Solution: Switch to the wallet address that deployed the smart contract

### "Transaction cancelled"
- You rejected the transaction in your wallet
- Solution: Try again and approve the transaction

### Question not showing in Admin Panel
- The question deadline hasn't passed yet, or it's already settled
- Solution: Wait until after the deadline, or check the question status

### Transaction failed
- Insufficient gas fees
- Solution: Ensure you have enough BNB for gas

## Admin Responsibilities

As an admin, you should:

1. Monitor questions regularly for expired deadlines
2. Settle questions promptly after they end
3. Verify the correct outcome before settling
4. Be fair and transparent in your settlements
5. Keep your admin wallet secure

## Smart Contract Functions

For advanced users, you can also interact directly with the smart contract:

### Settle Question
```solidity
function settleQuestion(uint256 _questionId, bool _result) external onlyOwner
```

### Withdraw Admin Fees
```solidity
function withdrawAdminFees() external onlyOwner
```

## Security Best Practices

1. Keep your admin private key secure
2. Use a hardware wallet for admin operations
3. Double-check transaction details before signing
4. Never share your private key or seed phrase
5. Keep your wallet software updated

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your wallet connection and network
3. Ensure you're using the correct admin wallet
4. Check the smart contract on BSCScan for transaction status
