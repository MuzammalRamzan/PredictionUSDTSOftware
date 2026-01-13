import express from 'express';
import {
  recordBet,
  getUserBets,
  getQuestionBets,
  calculateWinnings,
  recordWithdrawal,
  getUserWithdrawals
} from '../controllers/betController.js';

const router = express.Router();

router.post('/', recordBet);
router.get('/user/:userAddress', getUserBets);
router.get('/question/:questionId', getQuestionBets);
router.get('/winnings/:questionId/:userAddress', calculateWinnings);
router.post('/withdraw', recordWithdrawal);
router.get('/withdrawals/:userAddress', getUserWithdrawals);

export default router;
