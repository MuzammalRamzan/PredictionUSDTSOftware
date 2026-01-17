const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }
  return data.data;
};

export const api = {
  async getAllQuestions(status = null, category = null) {
    const response = await fetch(`${API_BASE_URL}/questions`);
    const questions = await handleResponse(response);

    let filtered = questions;
    if (status) {
      filtered = filtered.filter(q => {
        if (status === 'open') return q.status === 'open';
        if (status === 'settled') return q.status === 'settled';
        return true;
      });
    }
    if (category) {
      filtered = filtered.filter(q => q.category === category);
    }

    return filtered.map(q => {
      const poolStats = q.pool_stats && q.pool_stats[0] ? q.pool_stats[0] : {};
      return {
        _id: q._id,
        contractQuestionId: q.contract_question_id,
        title: q.title,
        description: q.description,
        category: q.category || 'General',
        deadline: q.deadline,
        status: q.status,
        result: q.result,
        totalYesOcro: parseFloat(poolStats.yes_ocro_total || 0),
        totalYesUsdt: parseFloat(poolStats.yes_usdt_total || 0),
        totalNoOcro: parseFloat(poolStats.no_ocro_total || 0),
        totalNoUsdt: parseFloat(poolStats.no_usdt_total || 0),
        yesCount: parseInt(poolStats.yes_participants || 0),
        noCount: parseInt(poolStats.no_participants || 0),
      };
    });
  },

  async getQuestion(id) {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`);
    const question = await handleResponse(response);

    return {
      _id: question._id,
      contractQuestionId: question.contract_question_id,
      title: question.title,
      description: question.description,
      category: question.category || 'General',
      deadline: question.deadline,
      status: question.status,
      result: question.result,
    };
  },

  async createQuestion(data) {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contractQuestionId: data.contractQuestionId,
        question: data.title,
        description: data.description,
        category: data.category,
        endTime: data.deadline,
        creator: data.creator,
        minBetAmount: data.minBetAmount || '1',
      }),
    });
    return handleResponse(response);
  },

  async recordBet(data) {
    const response = await fetch(`${API_BASE_URL}/bets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionId: data.questionId,
        userAddress: data.userAddress,
        outcome: data.outcome,
        transactionHash: data.transactionHash,
      }),
    });
    return handleResponse(response);
  },

  async getUserBets(userAddress) {
    const response = await fetch(`${API_BASE_URL}/bets/user/${userAddress}`);
    const bets = await handleResponse(response);

    return bets.map(bet => ({
      questionId: {
        _id: bet.questions?._id,
        title: bet.questions?.title,
        status: bet.questions?.status,
        result: bet.questions?.result,
        deadline: bet.questions?.deadline,
      },
      outcome: bet.outcome,
      ocroAmount: bet.ocro_amount,
      usdtAmount: bet.usdt_amount,
      createdAt: bet.created_at,
    }));
  },

  async getQuestionBets(questionId) {
    const response = await fetch(`${API_BASE_URL}/bets/question/${questionId}`);
    return handleResponse(response);
  },

  async calculateWinnings(questionId, userAddress) {
    const response = await fetch(`${API_BASE_URL}/bets/winnings/${questionId}/${userAddress}`);
    const data = await handleResponse(response);

    return {
      ocro: data.potentialWinnings || '0',
      usdt: data.potentialWinnings || '0',
    };
  },

  async recordWithdrawal(data) {
    const response = await fetch(`${API_BASE_URL}/bets/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionId: data.questionId,
        userAddress: data.userAddress,
        ocroAmount: data.ocroAmount,
        usdtAmount: data.usdtAmount,
        transactionHash: data.transactionHash,
      }),
    });
    return handleResponse(response);
  },

  async getUserWithdrawals(userAddress) {
    const response = await fetch(`${API_BASE_URL}/bets/withdrawals/${userAddress}`);
    return handleResponse(response);
  },

  async getPoolStats(questionId) {
    const response = await fetch(`${API_BASE_URL}/stats/pool/${questionId}`);
    const stats = await handleResponse(response);

    return {
      totalYesOcro: parseFloat(stats.totalYesAmount || 0),
      totalYesUsdt: parseFloat(stats.totalYesAmount || 0),
      totalNoOcro: parseFloat(stats.totalNoAmount || 0),
      totalNoUsdt: parseFloat(stats.totalNoAmount || 0),
      yesCount: stats.yesBettors || 0,
      noCount: stats.noBettors || 0,
      totalParticipants: stats.uniqueBettors || 0,
    };
  },

  async getPlatformStats() {
    const response = await fetch(`${API_BASE_URL}/stats/platform`);
    const stats = await handleResponse(response);

    return {
      totalVolumeOcro: parseFloat(stats.totalVolume || 0),
      totalVolumeUsdt: parseFloat(stats.totalVolume || 0),
      totalQuestions: stats.totalQuestions || 0,
      activeQuestions: stats.activeQuestions || 0,
      totalParticipants: stats.totalUsers || 0,
    };
  },

  async getUserStats(userAddress) {
    const response = await fetch(`${API_BASE_URL}/stats/user/${userAddress}`);
    const stats = await handleResponse(response);

    return {
      totalBets: stats.totalBets || 0,
      wonBets: 0,
      lostBets: 0,
      activeBets: stats.totalBets || 0,
      winRate: stats.winRate || '0',
      totalStakedOcro: parseFloat(stats.totalBetAmount || 0),
      totalStakedUsdt: parseFloat(stats.totalBetAmount || 0),
    };
  },

  async getLeaderboard() {
    const response = await fetch(`${API_BASE_URL}/stats/leaderboard?limit=10`);
    const leaders = await handleResponse(response);

    return leaders.map(l => ({
      address: l.userAddress,
      won: 0,
      lost: 0,
      totalStaked: parseFloat(l.totalWinnings || 0),
      winRate: l.winRate || '0',
    }));
  },
};
