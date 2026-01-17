import Question from '../models/Question.js';
import PoolStat from '../models/PoolStat.js';
import Bet from '../models/Bet.js';
import { getContract, getContractWithSigner } from '../config/blockchain.js';
import { ethers } from 'ethers';

export const getAllQuestions = async (req, res) => {
  try {
    const { status, category } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const questions = await Question.find(filter)
      .sort({ created_at: -1 })
      .lean();

    const questionsWithStats = await Promise.all(
      questions.map(async (question) => {
        const stats = await PoolStat.findOne({ question_id: question._id }).lean();
        return {
          ...question,
          id: question._id,
          pool_stats: stats ? [{ ...stats, id: stats._id }] : []
        };
      })
    );

    res.json({ success: true, data: questionsWithStats });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id).lean();

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    const stats = await PoolStat.findOne({ question_id: id }).lean();
    const bets = await Bet.find({ question_id: id }).lean();

    const data = {
      ...question,
      id: question._id,
      pool_stats: stats ? [{ ...stats, id: stats._id }] : [],
      bets: bets.map(bet => ({ ...bet, id: bet._id }))
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { title, description, category, deadline } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({
        success: false,
        error: 'Title and deadline are required'
      });
    }

    const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

    const contract = getContractWithSigner();
    const tx = await contract.createQuestion(title, deadlineTimestamp);
    const receipt = await tx.wait();

    const event = receipt.logs.find(
      log => log.topics[0] === ethers.id('QuestionCreated(uint256,string,uint256)')
    );

    let contractQuestionId = 0;
    if (event) {
      const decodedLog = contract.interface.parseLog({
        topics: event.topics,
        data: event.data
      });
      contractQuestionId = Number(decodedLog.args[0]);
    }

    const question = new Question({
      title,
      description,
      category: category || 'general',
      deadline,
      contract_question_id: contractQuestionId,
      status: 'open'
    });

    await question.save();

    await new PoolStat({
      question_id: question._id,
      yes_ocro_total: 0,
      yes_usdt_total: 0,
      yes_participants: 0,
      no_ocro_total: 0,
      no_usdt_total: 0,
      no_participants: 0
    }).save();

    const data = { ...question.toObject(), id: question._id };

    res.json({
      success: true,
      data,
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const settleQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { result } = req.body;

    if (result !== 'yes' && result !== 'no') {
      return res.status(400).json({
        success: false,
        error: 'Result must be either "yes" or "no"'
      });
    }

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    if (question.status === 'settled') {
      return res.status(400).json({ success: false, error: 'Question already settled' });
    }

    const contract = getContractWithSigner();
    const tx = await contract.settleQuestion(
      question.contract_question_id,
      result === 'yes'
    );
    const receipt = await tx.wait();

    question.status = 'settled';
    question.result = result;
    question.settlement_date = new Date();
    question.updated_at = new Date();
    await question.save();

    await Bet.updateMany(
      { question_id: id, outcome: result },
      { is_winner: true }
    );

    await Bet.updateMany(
      { question_id: id, outcome: { $ne: result } },
      { is_winner: false }
    );

    const data = { ...question.toObject(), id: question._id };

    res.json({
      success: true,
      data,
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error('Error settling question:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, deadline } = req.body;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    if (question.status === 'settled') {
      return res.status(400).json({ success: false, error: 'Cannot update settled question' });
    }

    if (title) question.title = title;
    if (description) question.description = description;
    if (category) question.category = category;
    if (deadline) {
      const newDeadline = new Date(deadline);
      if (newDeadline <= new Date()) {
        return res.status(400).json({ success: false, error: 'Deadline must be in the future' });
      }
      question.deadline = newDeadline;
    }

    question.updated_at = new Date();
    await question.save();

    const data = { ...question.toObject(), id: question._id };

    res.json({
      success: true,
      data,
      warning: 'Note: Blockchain deadline remains unchanged. Only database record updated.'
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const syncQuestionFromBlockchain = async (req, res) => {
  try {
    const { contractQuestionId } = req.params;

    const contract = getContract();
    const questionData = await contract.getQuestion(contractQuestionId);

    const question = await Question.findOne({ contract_question_id: contractQuestionId });

    if (question) {
      await PoolStat.updateOne(
        { question_id: question._id },
        {
          yes_ocro_total: ethers.formatEther(questionData.yesOcroTotal),
          yes_usdt_total: ethers.formatEther(questionData.yesUsdtTotal),
          yes_participants: Number(questionData.yesParticipants),
          no_ocro_total: ethers.formatEther(questionData.noOcroTotal),
          no_usdt_total: ethers.formatEther(questionData.noUsdtTotal),
          no_participants: Number(questionData.noParticipants),
          updated_at: new Date()
        }
      );
    }

    res.json({ success: true, message: 'Question synced' });
  } catch (error) {
    console.error('Error syncing question:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
