# Withdrawal Guide

## Overview

When you win a bet on the OCRO Predict platform, you can withdraw your winnings directly to your wallet. This guide explains how the withdrawal process works.

## How to Withdraw Your Winnings

### Prerequisites

1. You must have placed a bet on a question
2. The question must have been settled by an admin
3. Your bet outcome must match the settled result (you won!)
4. You must have the same wallet connected that placed the bet

### Steps to Withdraw

1. **Connect Your Wallet**
   - Make sure you're connected with the same wallet address you used to place the bet

2. **Navigate to Positions**
   - Click on "Positions" in the navigation menu
   - You'll see all your betting positions

3. **Find Your Winning Bet**
   - Look for positions with a "Won" badge (green background)
   - These will show your total payout amount in OCRO and USDT

4. **Click "Withdraw Winnings"**
   - A green button will appear on winning positions
   - Click the button to initiate the withdrawal
   - Confirm the transaction in your wallet (MetaMask or other Web3 wallet)

5. **Wait for Confirmation**
   - The transaction will be processed on the blockchain
   - Once confirmed, your winnings will be transferred to your wallet
   - The button will change to show "Withdrawn"

### What Happens During Withdrawal

1. **Smart Contract Call**: Your wallet sends a transaction to the betting smart contract
2. **Winnings Calculation**: The contract calculates your exact payout based on:
   - Your bet amount (OCRO + USDT)
   - Total pool sizes for winning/losing sides
   - Your proportional share of the losing pool
3. **Transfer**: The contract transfers both OCRO and USDT tokens to your wallet
4. **Record**: The withdrawal is recorded in the database to prevent double withdrawals

### Important Notes

- **Gas Fees**: You'll need some BNB to pay for the transaction gas fees
- **One-Time Withdrawal**: Once withdrawn, you cannot withdraw again for the same bet
- **No Time Limit**: You can withdraw your winnings at any time after the question is settled
- **Both Tokens**: You receive both OCRO and USDT in a single transaction

## Withdrawal Status

### Button States

1. **"Withdraw Winnings"** (Green button)
   - Ready to withdraw
   - Click to initiate withdrawal

2. **"Processing..."** (Gray button)
   - Transaction in progress
   - Wait for blockchain confirmation

3. **"Withdrawn"** (Gray badge)
   - Already withdrawn
   - No further action needed

## Troubleshooting

### "No withdraw button showing"

Make sure:
- You're connected with the correct wallet address
- The question has been settled by an admin
- Your bet outcome matches the settled result
- You haven't already withdrawn

### "Transaction failed"

Common reasons:
- Insufficient BNB for gas fees
- Network congestion (try again later)
- Transaction rejected in wallet
- Already withdrawn (check blockchain)

### "Payout showing as 0"

This shouldn't happen, but if it does:
- Refresh the page
- Reconnect your wallet
- Contact support if issue persists

## For Developers

### How Withdrawal Detection Works

The system checks for winning positions and displays the withdraw button by:

1. **Backend** (`/api/bets/user/:userAddress`)
   - Fetches all user bets from database
   - For each bet, checks if question is settled
   - If bet outcome matches question result:
     - Calls smart contract `calculateWinnings()`
     - Returns payout amounts in OCRO and USDT
     - Checks withdrawal table for existing withdrawal
     - Sets `withdrawn: true` if found

2. **Frontend** (`UserPositions.jsx`)
   - Receives bet data with `payout` and `withdrawn` fields
   - Shows "Won" badge for winning bets
   - Displays payout amounts in green card
   - Shows withdraw button if `payout` exists and `withdrawn` is false
   - Shows "Withdrawn" badge if `withdrawn` is true

3. **Smart Contract** (`BettingPool.sol`)
   - `calculateWinnings()` - Calculates exact payout amounts
   - `withdrawWinnings()` - Transfers tokens to winner
   - Prevents double withdrawals internally

### API Endpoints

- `GET /api/bets/user/:userAddress` - Get user bets with payout info
- `POST /api/bets/withdraw` - Record withdrawal in database
- `GET /api/bets/withdrawals/:userAddress` - Get user withdrawal history

### Database Tables

- `bets` - Stores all placed bets
- `withdrawals` - Records all withdrawals (prevents double withdrawals)
- `questions` - Stores question status and results
