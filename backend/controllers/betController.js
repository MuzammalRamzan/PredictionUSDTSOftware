import Bet from "../models/Bet.js";
import Question from "../models/Question.js";
import PoolStat from "../models/PoolStat.js";
import Withdrawal from "../models/Withdrawal.js";
import {getContract} from "../config/blockchain.js";
import {ethers} from "ethers";

export const recordBet = async (req, res) => {
  try {
    const {questionId, userAddress, outcome, transactionHash} = req.body;

    if (!questionId || !userAddress || !outcome || !transactionHash) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    if (outcome !== "yes" && outcome !== "no") {
      return res.status(400).json({
        success: false,
        error: 'Outcome must be either "yes" or "no"',
      });
    }

    const existingBet = await Bet.findOne({transaction_hash: transactionHash});

    if (existingBet) {
      return res.status(400).json({
        success: false,
        error: "Bet already recorded",
      });
    }

    const bet = new Bet({
      question_id: questionId,
      user_address: userAddress.toLowerCase(),
      outcome,
      ftr_amount: 1,
      usdt_amount: 1,
      transaction_hash: transactionHash,
    });

    await bet.save();

    const stats = await PoolStat.findOne({question_id: questionId});

    if (stats) {
      if (outcome === "yes") {
        stats.yes_ftr_total = parseFloat(stats.yes_ftr_total) + 1;
        stats.yes_usdt_total = parseFloat(stats.yes_usdt_total) + 1;
        stats.yes_participants = stats.yes_participants + 1;
      } else {
        stats.no_ftr_total = parseFloat(stats.no_ftr_total) + 1;
        stats.no_usdt_total = parseFloat(stats.no_usdt_total) + 1;
        stats.no_participants = stats.no_participants + 1;
      }

      stats.updated_at = new Date();
      await stats.save();
    }

    const data = {...bet.toObject(), id: bet._id};
    res.json({success: true, data});
  } catch (error) {
    console.error("Error recording bet:", error);
    res.status(500).json({success: false, error: error.message});
  }
};

export const getUserBets = async (req, res) => {
  try {
    const {userAddress} = req.params;

    const bets = await Bet.find({user_address: userAddress.toLowerCase()})
      .sort({created_at: -1})
      .lean();

    const betsWithQuestions = await Promise.all(
      bets.map(async (bet) => {
        const question = await Question.findById(bet.question_id).lean();
        const stats = question
          ? await PoolStat.findOne({question_id: question._id}).lean()
          : null;

        let payout = null;
        let withdrawn = false;

        // If question is settled and user won, calculate payout
        if (
          question &&
          question.status === "settled" &&
          question.result === bet.outcome
        ) {
          try {
            // Check if user has withdrawn first
            const withdrawal = await Withdrawal.findOne({
              question_id: bet.question_id,
              user_address: userAddress.toLowerCase(),
            });

            withdrawn = !!withdrawal;

            // If withdrawn, use the recorded withdrawal amounts
            if (withdrawn && withdrawal) {
              payout = {
                ftr: parseFloat(withdrawal.ftr_amount),
                usdt: parseFloat(withdrawal.usdt_amount),
              };
            } else {
              // If not withdrawn, calculate from contract
              const contract = getContract();
              if (
                question.contract_question_id !== undefined &&
                question.contract_question_id !== null
              ) {
                const [ftrWinnings, usdtWinnings] =
                  await contract.calculateWinnings(
                    question.contract_question_id,
                    userAddress,
                  );

                payout = {
                  ftr: parseFloat(ethers.formatEther(ftrWinnings)),
                  usdt: parseFloat(ethers.formatEther(usdtWinnings)),
                };
              }
            }
          } catch (error) {
            console.error("Error calculating winnings for bet:", error);
          }
        }

        return {
          ...bet,
          id: bet._id,
          payout,
          withdrawn,
          questions: question
            ? {
                ...question,
                id: question._id,
                contract_question_id: question.contract_question_id,
                pool_stats: stats ? [{...stats, id: stats._id}] : [],
              }
            : null,
        };
      }),
    );

    res.json({success: true, data: betsWithQuestions});
  } catch (error) {
    console.error("Error fetching user bets:", error);
    res.status(500).json({success: false, error: error.message});
  }
};

export const getQuestionBets = async (req, res) => {
  try {
    const {questionId} = req.params;

    const bets = await Bet.find({question_id: questionId})
      .sort({created_at: -1})
      .lean();

    const data = bets.map((bet) => ({...bet, id: bet._id}));

    res.json({success: true, data});
  } catch (error) {
    console.error("Error fetching question bets:", error);
    res.status(500).json({success: false, error: error.message});
  }
};

export const calculateWinnings = async (req, res) => {
  try {
    const {questionId, userAddress} = req.params;

    const question = await Question.findById(questionId);

    if (!question) {
      return res
        .status(404)
        .json({success: false, error: "Question not found"});
    }

    if (!question.contract_question_id) {
      return res
        .status(400)
        .json({success: false, error: "Question not on blockchain"});
    }

    const contract = getContract();
    const [ftrWinnings, usdtWinnings] = await contract.calculateWinnings(
      question.contract_question_id,
      userAddress,
    );

    res.json({
      success: true,
      data: {
        ftrWinnings: ethers.formatEther(ftrWinnings),
        usdtWinnings: ethers.formatEther(usdtWinnings),
      },
    });
  } catch (error) {
    console.error("Error calculating winnings:", error);
    res.status(500).json({success: false, error: error.message});
  }
};

export const recordWithdrawal = async (req, res) => {
  try {
    const {questionId, userAddress, ftrAmount, usdtAmount, transactionHash} =
      req.body;

    if (!questionId || !userAddress || !transactionHash) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const existingWithdrawal = await Withdrawal.findOne({
      transaction_hash: transactionHash,
    });

    if (existingWithdrawal) {
      return res.status(400).json({
        success: false,
        error: "Withdrawal already recorded",
      });
    }

    const ftrAmountParsed = parseFloat(ftrAmount) || 0;
    const usdtAmountParsed = parseFloat(usdtAmount) || 0;

    console.log("Recording withdrawal:", {
      questionId,
      userAddress,
      ftrAmount: ftrAmountParsed,
      usdtAmount: usdtAmountParsed,
      transactionHash,
    });

    const withdrawal = new Withdrawal({
      question_id: questionId,
      user_address: userAddress.toLowerCase(),
      ftr_amount: ftrAmountParsed,
      usdt_amount: usdtAmountParsed,
      transaction_hash: transactionHash,
    });

    await withdrawal.save();

    const data = {...withdrawal.toObject(), id: withdrawal._id};

    res.json({success: true, data});
  } catch (error) {
    console.error("Error recording withdrawal:", error);
    res.status(500).json({success: false, error: error.message});
  }
};

export const getUserWithdrawals = async (req, res) => {
  try {
    const {userAddress} = req.params;

    const withdrawals = await Withdrawal.find({
      user_address: userAddress.toLowerCase(),
    })
      .sort({created_at: -1})
      .lean();

    const withdrawalsWithQuestions = await Promise.all(
      withdrawals.map(async (withdrawal) => {
        const question = await Question.findById(withdrawal.question_id).lean();

        return {
          ...withdrawal,
          id: withdrawal._id,
          questions: question ? {...question, id: question._id} : null,
        };
      }),
    );

    res.json({success: true, data: withdrawalsWithQuestions});
  } catch (error) {
    console.error("Error fetching user withdrawals:", error);
    res.status(500).json({success: false, error: error.message});
  }
};
