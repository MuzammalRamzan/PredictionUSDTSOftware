import Question from "../models/Question.js";
import Bet from "../models/Bet.js";
import Withdrawal from "../models/Withdrawal.js";
import PoolStat from "../models/PoolStat.js";

export const getPoolStats = async (req, res) => {
  try {
    const {questionId} = req.params;

    const stats = await PoolStat.findOne({question_id: questionId}).lean();

    if (!stats) {
      return res.status(404).json({success: false, error: "Stats not found"});
    }

    const question = await Question.findById(questionId).lean();

    const data = {
      ...stats,
      id: stats._id,
      questions: question ? {...question, id: question._id} : null,
    };

    res.json({success: true, data});
  } catch (error) {
    console.error("Error fetching pool stats:", error);
    res.status(500).json({success: false, error: error.message});
  }
};

export const getPlatformStats = async (req, res) => {
  try {
    const questions = await Question.find({}).select("status").lean();
    const bets = await Bet.find({})
      .select("ftr_amount usdt_amount user_address")
      .lean();
    const withdrawals = await Withdrawal.find({})
      .select("ftr_amount usdt_amount")
      .lean();

    const totalQuestions = questions.length;
    const openQuestions = questions.filter((q) => q.status === "open").length;
    const settledQuestions = questions.filter(
      (q) => q.status === "settled",
    ).length;

    const totalBets = bets.length;
    const totalFtrStaked = bets.reduce(
      (sum, bet) => sum + parseFloat(bet.ftr_amount),
      0,
    );
    const totalUsdtStaked = bets.reduce(
      (sum, bet) => sum + parseFloat(bet.usdt_amount),
      0,
    );

    const uniqueUsers = new Set(bets.map((bet) => bet.user_address)).size;

    const totalWithdrawals = withdrawals.length;
    const totalFtrWithdrawn = withdrawals.reduce(
      (sum, w) => sum + parseFloat(w.ftr_amount),
      0,
    );
    const totalUsdtWithdrawn = withdrawals.reduce(
      (sum, w) => sum + parseFloat(w.usdt_amount),
      0,
    );

    const stats = {
      questions: {
        total: totalQuestions,
        open: openQuestions,
        settled: settledQuestions,
      },
      bets: {
        total: totalBets,
        totalFtrStaked,
        totalUsdtStaked,
      },
      withdrawals: {
        total: totalWithdrawals,
        totalFtrWithdrawn,
        totalUsdtWithdrawn,
      },
      totalParticipants: uniqueUsers,
    };

    res.json({success: true, data: stats});
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    res.status(500).json({success: false, error: error.message});
  }
};

export const getUserStats = async (req, res) => {
  try {
    const {userAddress} = req.params;

    const bets = await Bet.find({
      user_address: userAddress.toLowerCase(),
    }).lean();
    const betsWithQuestions = await Promise.all(
      bets.map(async (bet) => {
        const question = await Question.findById(bet.question_id).lean();
        return {...bet, questions: question};
      }),
    );

    const withdrawals = await Withdrawal.find({
      user_address: userAddress.toLowerCase(),
    }).lean();

    const totalBets = betsWithQuestions.length;
    const activeBets = betsWithQuestions.filter(
      (b) => b.questions && b.questions.status === "open",
    ).length;
    const settledBets = betsWithQuestions.filter(
      (b) => b.questions && b.questions.status === "settled",
    ).length;
    const wonBets = betsWithQuestions.filter(
      (b) => b.is_winner === true,
    ).length;
    const lostBets = betsWithQuestions.filter(
      (b) => b.is_winner === false,
    ).length;

    const totalFtrStaked = bets.reduce(
      (sum, bet) => sum + parseFloat(bet.ftr_amount),
      0,
    );
    const totalUsdtStaked = bets.reduce(
      (sum, bet) => sum + parseFloat(bet.usdt_amount),
      0,
    );

    const totalFtrWithdrawn = withdrawals.reduce(
      (sum, w) => sum + parseFloat(w.ftr_amount),
      0,
    );
    const totalUsdtWithdrawn = withdrawals.reduce(
      (sum, w) => sum + parseFloat(w.usdt_amount),
      0,
    );

    const stats = {
      bets: {
        total: totalBets,
        active: activeBets,
        settled: settledBets,
        won: wonBets,
        lost: lostBets,
        winRate:
          settledBets > 0 ? ((wonBets / settledBets) * 100).toFixed(2) : 0,
      },
      staked: {
        totalFtrStaked,
        totalUsdtStaked,
      },
      withdrawn: {
        totalFtrWithdrawn,
        totalUsdtWithdrawn,
      },
      profit: {
        ftrProfit: totalFtrWithdrawn - totalFtrStaked,
        usdtProfit: totalUsdtWithdrawn - totalUsdtStaked,
      },
    };

    res.json({success: true, data: stats});
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({success: false, error: error.message});
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const bets = await Bet.find({}).select("user_address is_winner").lean();
    const withdrawals = await Withdrawal.find({})
      .select("user_address ftr_amount usdt_amount")
      .lean();

    const userMap = new Map();

    bets.forEach((bet) => {
      const addr = bet.user_address;
      if (!userMap.has(addr)) {
        userMap.set(addr, {
          address: addr,
          totalBets: 0,
          wonBets: 0,
          lostBets: 0,
          totalWithdrawn: 0,
        });
      }

      const user = userMap.get(addr);
      user.totalBets++;
      if (bet.is_winner === true) user.wonBets++;
      if (bet.is_winner === false) user.lostBets++;
    });

    withdrawals.forEach((w) => {
      const addr = w.user_address;
      if (userMap.has(addr)) {
        const user = userMap.get(addr);
        user.totalWithdrawn +=
          parseFloat(w.ftr_amount) + parseFloat(w.usdt_amount);
      }
    });

    const leaderboard = Array.from(userMap.values())
      .map((user) => ({
        ...user,
        winRate:
          user.totalBets > 0
            ? ((user.wonBets / user.totalBets) * 100).toFixed(2)
            : 0,
      }))
      .sort((a, b) => b.totalWithdrawn - a.totalWithdrawn)
      .slice(0, 100);

    res.json({success: true, data: leaderboard});
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({success: false, error: error.message});
  }
};
