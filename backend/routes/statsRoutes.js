import express from 'express';
import {
  getPoolStats,
  getPlatformStats,
  getUserStats,
  getLeaderboard
} from '../controllers/statsController.js';

const router = express.Router();

router.get('/pool/:questionId', getPoolStats);
router.get('/platform', getPlatformStats);
router.get('/user/:userAddress', getUserStats);
router.get('/leaderboard', getLeaderboard);

export default router;
