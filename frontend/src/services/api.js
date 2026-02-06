export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const handleResponse = async (response) => {
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "API request failed");
  }
  return data.data;
};

export const api = {
  async getAllQuestions(status = null, category = null, filters = {}) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (category) params.append("category", category);
    if (filters.subcategory) params.append("subcategory", filters.subcategory);
    if (filters.country) params.append("country", filters.country);
    if (filters.level) params.append("level", filters.level);

    const response = await fetch(
      `${API_BASE_URL}/questions?${params.toString()}`,
    );
    const questions = await handleResponse(response);

    // Client-side filtering is no longer strictly necessary if backend handles it,
    // but we can keep it for consistency or remove it.
    // Since we updated backend to handle these, we can return questions directly
    // but the existing code does some mapping.

    return questions.map((q) => {
      const poolStats = q.pool_stats && q.pool_stats[0] ? q.pool_stats[0] : {};
      const outcomeStats = poolStats.outcome_stats || [];
      const formattedOutcomeStats = (q.outcomes || []).map(
        (outcome, index) => ({
          name: outcome,
          usdt: outcomeStats[index]?.usdt_total || 0,
          participants: outcomeStats[index]?.participants || 0,
        }),
      );

      return {
        id: q._id,
        _id: q._id,
        contractQuestionId: q.contract_question_id,
        question: q.title,
        title: q.title,
        description: q.description,
        category: q.category || "General",
        subcategory: q.subcategory,
        country: q.country,
        level: q.level,
        outcomes: q.outcomes || [],
        outcomeStats: formattedOutcomeStats,
        endTime: q.deadline,
        deadline: q.deadline,
        status: q.status,
        result: q.result,
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
      category: question.category || "General",
      outcomes: question.outcomes,
      deadline: question.deadline,
      status: question.status,
      result: question.result,
    };
  },

  async createQuestion(data) {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contractQuestionId: data.contractQuestionId,
        title: data.title, // Send title as title
        question: data.title, // Keep legacy field just in case
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        country: data.country,
        level: data.level,
        endTime: data.deadline,
        creator: data.creator,
        minBetAmount: data.minBetAmount || "1",
      }),
    });
    return handleResponse(response);
  },

  async recordBet(data) {
    const response = await fetch(`${API_BASE_URL}/bets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId: data.questionId,
        userAddress: data.userAddress,
        outcome: data.outcome,
        usdtAmount: data.usdtAmount,
        transactionHash: data.transactionHash,
      }),
    });
    return handleResponse(response);
  },

  async getUserBets(userAddress) {
    const response = await fetch(`${API_BASE_URL}/bets/user/${userAddress}`);
    const bets = await handleResponse(response);

    return bets.map((bet) => ({
      questionId: {
        _id: bet.questions?._id,
        title: bet.questions?.title,
        status: bet.questions?.status,
        result: bet.questions?.result,
        outcomes: bet.questions?.outcomes,
        deadline: bet.questions?.deadline,
        contractQuestionId: bet.questions?.contract_question_id,
      },
      outcome: bet.outcome,
      usdtAmount: bet.usdt_amount,
      createdAt: bet.created_at,
      payout: bet.payout,
      withdrawn: bet.withdrawn,
    }));
  },

  async getQuestionBets(questionId) {
    const response = await fetch(`${API_BASE_URL}/bets/question/${questionId}`);
    return handleResponse(response);
  },

  async calculateWinnings(questionId, userAddress) {
    const response = await fetch(
      `${API_BASE_URL}/bets/winnings/${questionId}/${userAddress}`,
    );
    const data = await handleResponse(response);

    return {
      usdtAmount: data.usdtAmount,
    };
  },

  async recordWithdrawal(data) {
    const response = await fetch(`${API_BASE_URL}/bets/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId: data.questionId,
        userAddress: data.userAddress,
        usdtAmount: data.usdtAmount,
        transactionHash: data.transactionHash,
      }),
    });
    return handleResponse(response);
  },

  async getUserWithdrawals(userAddress) {
    const response = await fetch(
      `${API_BASE_URL}/bets/withdrawals/${userAddress}`,
    );
    return handleResponse(response);
  },

  async settleQuestion(questionId, result) {
    const response = await fetch(
      `${API_BASE_URL}/questions/${questionId}/settle`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          result: result,
        }),
      },
    );
    return handleResponse(response);
  },

  async getPoolStats(questionId) {
    const response = await fetch(`${API_BASE_URL}/stats/pool/${questionId}`);
    const stats = await handleResponse(response);

    return {
      totalYesUsdt: parseFloat(stats.yes_usdt_total || 0),
      totalNoUsdt: parseFloat(stats.no_usdt_total || 0),
      yesCount: stats.yes_participants || 0,
      noCount: stats.no_participants || 0,
      totalParticipants:
        (stats.yes_participants || 0) + (stats.no_participants || 0),
    };
  },

  async getPlatformStats() {
    const response = await fetch(`${API_BASE_URL}/stats/platform`);
    const stats = await handleResponse(response);

    return {
      totalVolumeUsdt: parseFloat(stats.bets?.totalUsdtStaked || 0),
      totalQuestions: stats.questions?.total || 0,
      activeQuestions: stats.questions?.open || 0,
      totalParticipants: stats.totalParticipants || 0,
    };
  },

  async getUserStats(userAddress) {
    const response = await fetch(`${API_BASE_URL}/stats/user/${userAddress}`);
    const stats = await handleResponse(response);

    return {
      totalBets: stats.bets?.total || 0,
      wonBets: stats.bets?.won || 0,
      lostBets: stats.bets?.lost || 0,
      activeBets: stats.bets?.active || 0,
      winRate: stats.bets?.winRate || "0",
      totalStakedUsdt: parseFloat(stats.staked?.totalUsdtStaked || 0),
    };
  },

  async getLeaderboard() {
    const response = await fetch(`${API_BASE_URL}/stats/leaderboard?limit=10`);
    const leaders = await handleResponse(response);

    return leaders.map((l) => ({
      address: l.userAddress,
      won: l.wonBets || 0,
      lost: l.lostBets || 0,
      totalStaked: parseFloat(l.totalWithdrawn || 0), // Leaderboard sorts by totalWithdrawn
      winRate: l.winRate || "0",
    }));
  },
};
