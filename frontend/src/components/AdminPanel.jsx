import { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle2, XCircle, AlertCircle, Shield, Plus, Calendar, Tag, FileText, 
  Activity, DollarSign, RefreshCw, Users, Wallet, Search, Filter, ChevronLeft, ChevronRight,
  MoreHorizontal, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { isAdminAddress } from '../config/admin';
import { useTheme } from '../contexts/ThemeContext';
import { web3Service } from '../services/web3';
import { API_BASE_URL } from '../services/api';
import { useTranslation } from 'react-i18next';

// Internal Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, isDark }) => (
  <div className={`p-6 rounded-xl border ${
    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  } shadow-sm transition-all hover:shadow-md`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {title}
        </p>
        <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </div>
      </div>
      <div className={`p-3 rounded-lg ${
        isDark ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

// Admin Question Card Component
const AdminQuestionCard = ({ question, isDark, onSettle, onSync, settling, syncing, t }) => {
  const stats = question.pool_stats?.[0] || {};
  const outcomeStats = stats.outcome_stats || [];
  
  const totalParticipants = outcomeStats.reduce((sum, s) => sum + (s.participants || 0), 0);
  const totalVolumeFtr = outcomeStats.reduce((sum, s) => sum + (s.ftr_total || 0), 0);
  const totalVolumeUsdt = outcomeStats.reduce((sum, s) => sum + (s.usdt_total || 0), 0);
  
  const getPercentage = (index) => {
    if (totalParticipants === 0) return 0;
    const participants = outcomeStats[index]?.participants || 0;
    return (participants / totalParticipants) * 100;
  };

  const isPendingSettlement = question.status !== 'settled' && new Date(question.deadline) < new Date();
  
  const getCategoryColor = (category) => {
    const colors = {
      'Crypto': 'from-yellow-600 to-yellow-700',
      'Sports': 'from-yellow-500 to-yellow-600',
      'Politics': 'from-yellow-800 to-yellow-900',
      'Technology': 'from-yellow-400 to-yellow-500',
      'Finance': 'from-yellow-700 to-yellow-800',
    };
    return colors[category] || 'from-zinc-500 to-zinc-600';
  };

  const getTimeStatus = () => {
    const now = new Date();
    const end = new Date(question.deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return { label: 'Ended', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { 
      label: days > 0 ? `${days}d left` : `${hours}h left`, 
      color: 'text-green-500', 
      bg: 'bg-green-500/10 border-green-500/20' 
    };
  };

  const timeStatus = getTimeStatus();

  return (
    <div className={`group relative rounded-2xl p-[1px] transition-all duration-300 ${
      isDark ? 'bg-gradient-to-br from-zinc-700/50 to-zinc-800/50' : 'bg-gradient-to-br from-yellow-300/60 to-orange-300/60 shadow-lg shadow-yellow-900/5'
    }`}>
      <div className={`relative h-full rounded-[0.9rem] p-5 flex flex-col overflow-hidden ${
        isDark ? 'bg-zinc-900/90 backdrop-blur-xl' : 'bg-white/95 backdrop-blur-xl border border-white/50'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black bg-gradient-to-r ${getCategoryColor(question.category)} text-white shadow-lg shadow-yellow-500/10 tracking-widest uppercase`}>
            {question.category}
          </span>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border backdrop-blur-sm ${
            isDark ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-white border-yellow-200'
          } ${timeStatus.color}`}>
            <Clock className="w-3 h-3" />
            <span className="text-xs font-bold tracking-wide">{timeStatus.label}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-lg font-bold mb-4 leading-snug min-h-[3rem] line-clamp-2 ${
          isDark ? 'text-white' : 'text-zinc-900'
        }`}>
          {question.title}
        </h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-50'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Total Volume</div>
            <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <div>{totalVolumeFtr.toFixed(2)} FTR</div>
              <div className="opacity-70">{totalVolumeUsdt.toFixed(2)} USDT</div>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-50'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Participants</div>
            <div className={`font-bold text-sm flex items-center gap-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <Users className="w-3 h-3" />
              {totalParticipants}
            </div>
            {question.status === 'settled' && question.result !== null && (
               <div className="text-xs mt-1 text-green-500">
                 Winner: {question.outcomes?.[question.result] || 'Unknown'}
               </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className={`relative h-3 rounded-full overflow-hidden flex ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
            {question.outcomes?.map((outcome, index) => {
                const percentage = getPercentage(index);
                if (percentage === 0) return null;
                const colors = ['bg-yellow-500', 'bg-zinc-500', 'bg-blue-500'];
                return (
                    <div 
                        key={index} 
                        className={`h-full ${colors[index % colors.length]}`} 
                        style={{ width: `${percentage}%` }} 
                    />
                );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {question.outcomes?.map((outcome, index) => (
                <div key={index} className={index % 2 !== 0 ? 'text-right' : ''}>
                    <span className={`font-bold ${index === 0 ? 'text-yellow-500' : (index === 1 ? (isDark ? 'text-zinc-400' : 'text-zinc-600') : 'text-blue-500')}`}>
                        {getPercentage(index).toFixed(0)}% {outcome}
                    </span>
                    <div className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {outcomeStats[index]?.ftr_total?.toFixed(1) || 0} FTR / {outcomeStats[index]?.usdt_total?.toFixed(1) || 0} USDT
                    </div>
                </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`mt-auto pt-4 border-t border-dashed ${isDark ? 'border-zinc-700/50' : 'border-zinc-200'}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                question.status === 'settled'
                  ? isDark ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-700 border-blue-200'
                  : isPendingSettlement
                    ? isDark ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800/50' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : isDark ? 'bg-green-900/20 text-green-400 border-green-800/50' : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                {question.status === 'settled' 
                    ? `Settled: ${question.outcomes?.[question.result] || 'Unknown'}` 
                    : isPendingSettlement ? 'Pending Settlement' : 'Open'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {isPendingSettlement && (
                <>
                  {question.outcomes?.map((outcome, index) => (
                      <button
                        key={index}
                        onClick={() => onSettle(question._id, index)}
                        disabled={settling[question._id]}
                        className={`p-2 rounded-lg text-white transition-colors disabled:opacity-50 flex items-center gap-1 ${
                            index === 0 ? 'bg-green-500 hover:bg-green-600' : (index === 1 ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600')
                        }`}
                        title={`Settle ${outcome}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-bold">{outcome}</span>
                      </button>
                  ))}
                </>
              )}
              <button
                onClick={() => onSync(question)}
                disabled={syncing[question._id]}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
                }`}
                title="Sync from Blockchain"
              >
                <RefreshCw className={`w-4 h-4 ${syncing[question._id] ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default function AdminPanel({ walletAddress, isLoading, onShowToast, onRefresh }) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  
  // Data State
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    totalPages: 1,
    total: 0
  });
  
  // Filters State
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  // Action States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState('');
  const [settling, setSettling] = useState({});
  const [syncing, setSyncing] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Sports',
    deadline: '',
    outcomes: ['Yes', 'No']
  });
  
  // Stats State
  const [stats, setStats] = useState({
    totalBets: '0',
    totalWinnings: '0',
    totalFees: '0'
  });

  const isAdmin = isAdminAddress(walletAddress);

  useEffect(() => {
    if (isAdmin) {
      fetchQuestions();
      loadStats();
    }
  }, [isAdmin, pagination.page, filters]);

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`${API_BASE_URL}/questions?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setQuestions(data.data);
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            ...data.pagination
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      if (onShowToast) onShowToast('Failed to load questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const loadStats = async () => {
    try {
      const [platformStats, adminFees] = await Promise.all([
        fetch(`${API_BASE_URL}/stats/platform`).then(res => res.json()),
        web3Service.getAdminFees()
      ]);

      if (platformStats.success) {
        setStats({
          totalBets: (
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{platformStats.data.bets.total}</span>
              <div className="flex flex-col mt-1">
                <span className="text-sm opacity-90">{platformStats.data.bets.totalFtrStaked.toFixed(2)} FTR</span>
                <span className="text-sm opacity-70">{platformStats.data.bets.totalUsdtStaked.toFixed(2)} USDT</span>
              </div>
            </div>
          ),
          totalWinnings: (
            <div className="flex flex-col">
              <span>{platformStats.data.withdrawals.totalFtrWithdrawn.toFixed(2)} FTR</span>
              <span className="text-lg opacity-70">{platformStats.data.withdrawals.totalUsdtWithdrawn.toFixed(2)} USDT</span>
            </div>
          ),
          totalFees: (
            <div className="flex flex-col">
              <span>{parseFloat(adminFees.ftr).toFixed(2)} FTR</span>
              <span className="text-lg opacity-70">{parseFloat(adminFees.usdt).toFixed(2)} USDT</span>
            </div>
          )
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSyncQuestion = async (question) => {
    setSyncing(prev => ({ ...prev, [question._id]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/questions/sync/${question.contract_question_id}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        if (onShowToast) onShowToast(t('admin.toast.dbSynced', { result: data.data?.result || 'updated' }));
        fetchQuestions();
      } else {
        if (onShowToast) onShowToast(t('admin.toast.syncFailed', { error: data.error }));
      }
    } catch (error) {
      console.error('Sync failed:', error);
      if (onShowToast) onShowToast(t('admin.toast.syncFailed', { error: error.message }));
    } finally {
      setSyncing(prev => ({ ...prev, [question._id]: false }));
    }
  };

  const handleSettle = async (questionId, result) => {
    setSettling({ ...settling, [questionId]: true });

    try {
      const question = questions.find(q => q._id === questionId);
      if (!question) return;

      // 1. Check Blockchain Status First
      const blockchainQuestion = await web3Service.getQuestion(question.contract_question_id);

      if (blockchainQuestion.isSettled) {
        if (onShowToast) onShowToast(t('admin.toast.alreadySettledBlockchain'));
        await handleSyncQuestion(question);
        return;
      }

      // 2. Settle on Blockchain
      let transactionHash;
      let blockchainSucceeded = false;

      try {
        // Result is now an index (number)
        transactionHash = await web3Service.settleQuestion(
          question.contract_question_id,
          result 
        );
        blockchainSucceeded = true;
      } catch (blockchainError) {
        console.error('Blockchain error:', blockchainError);
        if (blockchainError.message?.includes('Already settled')) {
           await handleSyncQuestion(question);
           return;
        }
        throw blockchainError;
      }

      // 3. Update Database
      const response = await fetch(`${API_BASE_URL}/questions/${questionId}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result,
          adminAddress: walletAddress,
          transactionHash
        })
      });

      const data = await response.json();

      if (data.success) {
        if (onShowToast) onShowToast(t('admin.toast.settledSuccess'));
        fetchQuestions();
        if (onRefresh) onRefresh();
      } else {
        // DB Failed but Blockchain Succeeded -> Try Sync
        if (blockchainSucceeded) {
          if (onShowToast) onShowToast(t('admin.toast.dbUpdateFailed', { error: data.error }));
          await handleSyncQuestion(question);
        } else {
          if (onShowToast) onShowToast(t('admin.toast.settleFailed', { error: data.error }));
        }
      }
    } catch (error) {
      console.error('Failed to settle question:', error);
      if (onShowToast) onShowToast(t('admin.toast.settleFailed', { error: error.message || 'Unknown error' }));
    } finally {
      setSettling({ ...settling, [questionId]: false });
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateMessage('');

    try {
      const deadlineDate = new Date(formData.deadline);
      const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);

      // Validate outcomes
      const validOutcomes = formData.outcomes.filter(o => o.trim() !== '');
      if (validOutcomes.length < 2) {
          throw new Error("At least 2 outcomes are required");
      }

      setCreateMessage(t('admin.toast.signTransaction'));

      const { transactionHash, contractQuestionId } = await web3Service.createQuestion(
        formData.title,
        deadlineTimestamp,
        validOutcomes.length // Pass outcome count
      );

      setCreateMessage(t('admin.toast.creatingDb'));

      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          deadline: deadlineDate.toISOString(),
          outcomes: validOutcomes,
          adminAddress: walletAddress,
          transactionHash,
          contractQuestionId
        })
      });

      const data = await response.json();

      if (data.success) {
        setCreateMessage(t('admin.toast.createSuccess'));
        if (onShowToast) onShowToast(t('admin.toast.createSuccess'));
        if (onRefresh) onRefresh();
        setFormData({ title: '', description: '', category: 'Sports', deadline: '', outcomes: ['Yes', 'No'] });
        setShowCreateForm(false);
        fetchQuestions(); // Refresh list
        setTimeout(() => setCreateMessage(''), 3000);
      } else {
        setCreateMessage(t('admin.toast.createFailed', { error: data.error }));
      }
    } catch (error) {
      console.error('Failed to create question:', error);
      setCreateMessage(t('admin.toast.createFailed', { error: error.message }));
    } finally {
      setCreating(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center ${
        isDark ? 'text-gray-300' : 'text-gray-600'
      }`}>
        <Shield className="w-16 h-16 mb-4 text-red-500" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p>This area is restricted to administrators only.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('admin.title')}
            </h1>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('admin.subtitle')}
            </p>
          </div>
        </div>

        {/* Create Button Row */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 ${
              showCreateForm
                ? isDark ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-white text-zinc-900 border border-zinc-200 shadow-sm'
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white shadow-yellow-500/20'
            }`}
          >
            <Plus className={`w-5 h-5 ${showCreateForm ? 'rotate-45 transition-transform' : ''}`} />
            <span>{showCreateForm ? t('admin.cancelButton') : t('admin.createButton')}</span>
          </button>
        </div>

        {/* Create Message Toast */}
        {createMessage && (
          <div className={`mb-8 rounded-xl p-4 border flex items-center gap-3 ${
            createMessage.includes('successfully') || createMessage === t('admin.toast.createSuccess')
              ? isDark ? 'bg-green-900/30 border-green-700/50 text-green-300' : 'bg-green-50 border-green-200 text-green-700'
              : isDark ? 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
          }`}>
            {(createMessage.includes('successfully') || createMessage === t('admin.toast.createSuccess')) ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="font-medium text-sm">{createMessage}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard 
            title="Total Bets & Volume" 
            value={stats.totalBets} 
            icon={Activity} 
            color="text-blue-500" 
            isDark={isDark} 
          />
          <StatsCard 
            title="Total Winnings Paid" 
            value={stats.totalWinnings} 
            icon={DollarSign} 
            color="text-green-500" 
            isDark={isDark} 
          />
          <StatsCard 
            title="Platform Fees Collected" 
            value={stats.totalFees} 
            icon={Shield} 
            color="text-purple-500" 
            isDark={isDark} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Column: Question Management */}
          <div className={`${showCreateForm ? 'lg:col-span-9' : 'lg:col-span-12'} transition-all duration-300`}>
            
            {/* Filter Bar */}
            <div className={`p-4 rounded-xl border mb-6 flex flex-col md:flex-row gap-4 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-yellow-500 outline-none transition-all ${
                    isDark 
                      ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-600' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                  className={`px-4 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-yellow-500 outline-none transition-all ${
                    isDark 
                      ? 'bg-gray-900 border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="">All Status</option>
                  <option value="active">Active (Open)</option>
                  <option value="pending">Pending Settlement</option>
                  <option value="settled">Settled</option>
                </select>
              </div>
            </div>

            {/* Questions Grid */}
            <div className={`rounded-xl border p-4 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  All Questions
                </h2>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  Total: {pagination.total}
                </span>
              </div>

              {loadingQuestions ? (
                <div className="p-12 text-center">
                   <RefreshCw className={`w-8 h-8 mx-auto mb-4 animate-spin ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                   <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Loading questions...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="p-12 text-center">
                   <FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                   <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>No questions found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {questions.map((q) => (
                    <AdminQuestionCard 
                      key={q._id} 
                      question={q} 
                      isDark={isDark} 
                      onSettle={handleSettle}
                      onSync={handleSyncQuestion}
                      settling={settling}
                      syncing={syncing}
                      t={t}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className={`mt-6 pt-4 border-t flex items-center justify-between ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      pagination.page === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className={`p-2 rounded-lg transition-colors ${
                      pagination.page === pagination.totalPages
                        ? 'opacity-50 cursor-not-allowed'
                        : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Create Form Sidebar */}
          {showCreateForm && (
            <div className={`lg:col-span-3 transition-all duration-300 animate-slide-in`}>
              <div className={`rounded-xl border sticky top-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Create New Question
                  </h2>
                </div>
                <div className="p-6">
                  <form onSubmit={handleCreateQuestion} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Question Title
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-yellow-500 outline-none transition-all ${
                          isDark 
                            ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-600' 
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                        placeholder="e.g. Will BTC hit $100k?"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Outcomes
                      </label>
                      <div className="space-y-2">
                        {formData.outcomes.map((outcome, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              required
                              value={outcome}
                              onChange={(e) => {
                                const newOutcomes = [...formData.outcomes];
                                newOutcomes[index] = e.target.value;
                                setFormData({ ...formData, outcomes: newOutcomes });
                              }}
                              className={`w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all ${
                                isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                              }`}
                              placeholder={`Outcome ${index + 1}`}
                            />
                            {formData.outcomes.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newOutcomes = formData.outcomes.filter((_, i) => i !== index);
                                  setFormData({ ...formData, outcomes: newOutcomes });
                                }}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {formData.outcomes.length < 3 && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, outcomes: [...formData.outcomes, ''] })}
                            className={`text-sm font-bold flex items-center gap-1 ${
                              isDark ? 'text-yellow-500' : 'text-yellow-600'
                            }`}
                          >
                            <Plus className="w-4 h-4" /> Add Outcome
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-yellow-500 outline-none transition-all ${
                          isDark 
                            ? 'bg-gray-900 border-gray-700 text-white' 
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      >
                        <option value="Sports">Sports</option>
                        <option value="Crypto">Crypto</option>
                        <option value="Politics">Politics</option>
                        <option value="Entertainment">Entertainment</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Deadline
                      </label>
                      <div className="relative">
                        <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input
                          type="datetime-local"
                          required
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-yellow-500 outline-none transition-all ${
                            isDark 
                              ? 'bg-gray-900 border-gray-700 text-white [color-scheme:dark]' 
                              : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={creating}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                        creating
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 shadow-yellow-500/25'
                      }`}
                    >
                      {creating ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : (
                        'Create Question'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
