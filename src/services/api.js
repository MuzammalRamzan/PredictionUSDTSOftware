const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  async getAllQuestions(status = null, category = null) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);

    const response = await fetch(`${API_BASE_URL}/questions?${params}`);
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
  },

  async getQuestion(id) {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`);
    if (!response.ok) throw new Error('Failed to fetch question');
    return response.json();
  },

  async createQuestion(data) {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create question');
    return response.json();
  },

  async recordBet(data) {
    const response = await fetch(`${API_BASE_URL}/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to record bet');
    return response.json();
  },

  async getUserBets(userAddress) {
    const response = await fetch(`${API_BASE_URL}/bets/user/${userAddress}`);
    if (!response.ok) throw new Error('Failed to fetch user bets');
    return response.json();
  },

  async getQuestionBets(questionId) {
    const response = await fetch(`${API_BASE_URL}/bets/question/${questionId}`);
    if (!response.ok) throw new Error('Failed to fetch question bets');
    return response.json();
  },

  async calculateWinnings(questionId, userAddress) {
    const response = await fetch(`${API_BASE_URL}/bets/winnings/${questionId}/${userAddress}`);
    if (!response.ok) throw new Error('Failed to calculate winnings');
    return response.json();
  },

  async recordWithdrawal(data) {
    const response = await fetch(`${API_BASE_URL}/bets/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to record withdrawal');
    return response.json();
  },

  async getUserWithdrawals(userAddress) {
    const response = await fetch(`${API_BASE_URL}/bets/withdrawals/${userAddress}`);
    if (!response.ok) throw new Error('Failed to fetch withdrawals');
    return response.json();
  },

  async getPoolStats(questionId) {
    const response = await fetch(`${API_BASE_URL}/stats/pool/${questionId}`);
    if (!response.ok) throw new Error('Failed to fetch pool stats');
    return response.json();
  },

  async getPlatformStats() {
    const response = await fetch(`${API_BASE_URL}/stats/platform`);
    if (!response.ok) throw new Error('Failed to fetch platform stats');
    return response.json();
  },

  async getUserStats(userAddress) {
    const response = await fetch(`${API_BASE_URL}/stats/user/${userAddress}`);
    if (!response.ok) throw new Error('Failed to fetch user stats');
    return response.json();
  },

  async getLeaderboard() {
    const response = await fetch(`${API_BASE_URL}/stats/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  },
};
