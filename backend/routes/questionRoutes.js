import express from 'express';
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  settleQuestion,
  syncQuestionFromBlockchain
} from '../controllers/questionController.js';

const router = express.Router();

router.get('/', getAllQuestions);
router.get('/:id', getQuestionById);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.post('/:id/settle', settleQuestion);
router.post('/sync/:contractQuestionId', syncQuestionFromBlockchain);

export default router;
