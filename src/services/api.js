import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const api = {
  async getAllQuestions(status = null, category = null) {
    let query = supabase
      .from('questions')
      .select(`
        *,
        bets (
          outcome,
          ocro_amount,
          usdt_amount
        )
      `);

    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map(q => ({
      _id: q.id,
      contractQuestionId: q.contract_question_id,
      title: q.title,
      description: q.description,
      category: q.category,
      deadline: q.deadline,
      status: q.status,
      result: q.result,
      totalYesOcro: q.bets?.filter(b => b.outcome === 'yes').reduce((sum, b) => sum + parseFloat(b.ocro_amount || 0), 0) || 0,
      totalYesUsdt: q.bets?.filter(b => b.outcome === 'yes').reduce((sum, b) => sum + parseFloat(b.usdt_amount || 0), 0) || 0,
      totalNoOcro: q.bets?.filter(b => b.outcome === 'no').reduce((sum, b) => sum + parseFloat(b.ocro_amount || 0), 0) || 0,
      totalNoUsdt: q.bets?.filter(b => b.outcome === 'no').reduce((sum, b) => sum + parseFloat(b.usdt_amount || 0), 0) || 0,
      yesCount: q.bets?.filter(b => b.outcome === 'yes').length || 0,
      noCount: q.bets?.filter(b => b.outcome === 'no').length || 0,
    }));
  },

  async getQuestion(id) {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        bets (
          outcome,
          ocro_amount,
          usdt_amount,
          user_address
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Question not found');

    return {
      _id: data.id,
      contractQuestionId: data.contract_question_id,
      title: data.title,
      description: data.description,
      category: data.category,
      deadline: data.deadline,
      status: data.status,
      result: data.result,
      bets: data.bets || [],
    };
  },

  async createQuestion(data) {
    const { data: question, error } = await supabase
      .from('questions')
      .insert([{
        title: data.title,
        description: data.description,
        category: data.category,
        deadline: data.deadline,
        contract_question_id: data.contractQuestionId,
        status: 'open',
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return question;
  },

  async recordBet(data) {
    const { data: bet, error } = await supabase
      .from('bets')
      .insert([{
        question_id: data.questionId,
        user_address: data.userAddress.toLowerCase(),
        outcome: data.outcome,
        ocro_amount: data.ocroAmount || '0',
        usdt_amount: data.usdtAmount || '0',
        transaction_hash: data.transactionHash,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return bet;
  },

  async getUserBets(userAddress) {
    const { data, error } = await supabase
      .from('bets')
      .select(`
        *,
        questionId:questions (
          id,
          title,
          status,
          result,
          deadline
        )
      `)
      .eq('user_address', userAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map(bet => ({
      ...bet,
      ocroAmount: bet.ocro_amount,
      usdtAmount: bet.usdt_amount,
      createdAt: bet.created_at,
    }));
  },

  async getQuestionBets(questionId) {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('question_id', questionId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async calculateWinnings(questionId, userAddress) {
    const { data: question, error: qError } = await supabase
      .from('questions')
      .select('*, bets(*)')
      .eq('id', questionId)
      .maybeSingle();

    if (qError) throw new Error(qError.message);
    if (!question || question.status !== 'settled') {
      return { ocro: '0', usdt: '0' };
    }

    const userBets = question.bets.filter(
      b => b.user_address.toLowerCase() === userAddress.toLowerCase() && b.outcome === question.result
    );

    if (userBets.length === 0) return { ocro: '0', usdt: '0' };

    const totalUserOcro = userBets.reduce((sum, b) => sum + parseFloat(b.ocro_amount || 0), 0);
    const totalUserUsdt = userBets.reduce((sum, b) => sum + parseFloat(b.usdt_amount || 0), 0);

    const winningBets = question.bets.filter(b => b.outcome === question.result);
    const losingBets = question.bets.filter(b => b.outcome !== question.result);

    const totalWinningOcro = winningBets.reduce((sum, b) => sum + parseFloat(b.ocro_amount || 0), 0);
    const totalWinningUsdt = winningBets.reduce((sum, b) => sum + parseFloat(b.usdt_amount || 0), 0);
    const totalLosingOcro = losingBets.reduce((sum, b) => sum + parseFloat(b.ocro_amount || 0), 0);
    const totalLosingUsdt = losingBets.reduce((sum, b) => sum + parseFloat(b.usdt_amount || 0), 0);

    const winningsOcro = totalUserOcro + (totalLosingOcro * totalUserOcro / totalWinningOcro);
    const winningsUsdt = totalUserUsdt + (totalLosingUsdt * totalUserUsdt / totalWinningUsdt);

    return {
      ocro: winningsOcro.toFixed(2),
      usdt: winningsUsdt.toFixed(2),
    };
  },

  async recordWithdrawal(data) {
    const { data: withdrawal, error } = await supabase
      .from('withdrawals')
      .insert([{
        question_id: data.questionId,
        user_address: data.userAddress.toLowerCase(),
        ocro_amount: data.ocroAmount || '0',
        usdt_amount: data.usdtAmount || '0',
        transaction_hash: data.transactionHash,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    await supabase
      .from('bets')
      .update({ withdrawn: true })
      .eq('question_id', data.questionId)
      .eq('user_address', data.userAddress.toLowerCase());

    return withdrawal;
  },

  async getUserWithdrawals(userAddress) {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*, questions(*)')
      .eq('user_address', userAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  async getPoolStats(questionId) {
    const { data, error } = await supabase
      .from('questions')
      .select('*, bets(*)')
      .eq('id', questionId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Question not found');

    const yesBets = data.bets.filter(b => b.outcome === 'yes');
    const noBets = data.bets.filter(b => b.outcome === 'no');

    return {
      totalYesOcro: yesBets.reduce((sum, b) => sum + parseFloat(b.ocro_amount || 0), 0),
      totalYesUsdt: yesBets.reduce((sum, b) => sum + parseFloat(b.usdt_amount || 0), 0),
      totalNoOcro: noBets.reduce((sum, b) => sum + parseFloat(b.ocro_amount || 0), 0),
      totalNoUsdt: noBets.reduce((sum, b) => sum + parseFloat(b.usdt_amount || 0), 0),
      yesCount: yesBets.length,
      noCount: noBets.length,
      totalParticipants: new Set(data.bets.map(b => b.user_address)).size,
    };
  },

  async getPlatformStats() {
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('*, bets(*)');

    if (qError) throw new Error(qError.message);

    const allBets = questions.flatMap(q => q.bets || []);
    const uniqueParticipants = new Set(allBets.map(b => b.user_address)).size;

    return {
      totalVolumeOcro: allBets.reduce((sum, b) => sum + parseFloat(b.ocro_amount || 0), 0),
      totalVolumeUsdt: allBets.reduce((sum, b) => sum + parseFloat(b.usdt_amount || 0), 0),
      totalQuestions: questions.length,
      activeQuestions: questions.filter(q => q.status === 'open').length,
      totalParticipants: uniqueParticipants,
    };
  },

  async getUserStats(userAddress) {
    const { data: bets, error } = await supabase
      .from('bets')
      .select('*, questions(*)')
      .eq('user_address', userAddress.toLowerCase());

    if (error) throw new Error(error.message);

    const totalBets = bets.length;
    const wonBets = bets.filter(b => b.questions.status === 'settled' && b.questions.result === b.outcome).length;
    const lostBets = bets.filter(b => b.questions.status === 'settled' && b.questions.result !== b.outcome).length;
    const activeBets = bets.filter(b => b.questions.status === 'open').length;

    const totalStakedOcro = bets.reduce((sum, b) => sum + parseFloat(b.ocro_amount || 0), 0);
    const totalStakedUsdt = bets.reduce((sum, b) => sum + parseFloat(b.usdt_amount || 0), 0);

    return {
      totalBets,
      wonBets,
      lostBets,
      activeBets,
      winRate: totalBets > 0 ? ((wonBets / (wonBets + lostBets)) * 100).toFixed(2) : 0,
      totalStakedOcro,
      totalStakedUsdt,
    };
  },

  async getLeaderboard() {
    const { data: bets, error } = await supabase
      .from('bets')
      .select('*, questions(*)');

    if (error) throw new Error(error.message);

    const userStats = {};

    bets.forEach(bet => {
      const addr = bet.user_address;
      if (!userStats[addr]) {
        userStats[addr] = { address: addr, won: 0, lost: 0, totalStaked: 0 };
      }

      if (bet.questions.status === 'settled') {
        if (bet.questions.result === bet.outcome) {
          userStats[addr].won++;
        } else {
          userStats[addr].lost++;
        }
      }

      userStats[addr].totalStaked += parseFloat(bet.ocro_amount || 0) + parseFloat(bet.usdt_amount || 0);
    });

    return Object.values(userStats)
      .map(u => ({
        ...u,
        winRate: u.won + u.lost > 0 ? ((u.won / (u.won + u.lost)) * 100).toFixed(2) : 0,
      }))
      .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))
      .slice(0, 10);
  },
};
