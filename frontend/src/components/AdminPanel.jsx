import { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle2, XCircle, AlertCircle, AlertTriangle, Shield, Plus, Calendar, Tag, FileText, 
  Activity, DollarSign, RefreshCw, Users, Wallet, Search, Filter, ChevronLeft, ChevronRight,
  MoreHorizontal, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { isAdminAddress, isSuperAdmin } from '../config/admin';
import { useTheme } from '../contexts/ThemeContext';
import { web3Service } from '../services/web3';
import { API_BASE_URL } from '../services/api';
import { useTranslation } from 'react-i18next';

const CATEGORIES = {
  'Crypto': ['Bitcoin', 'Ethereum', 'Altcoins', 'DeFi', 'NFTs', 'Regulation', 'Other'],
  'Sports': ['Cricket', 'Football', 'Basketball', 'Tennis', 'Baseball', 'Esports', 'Other'],
  'Politics': ['US Elections', 'UK Politics', 'EU Politics', 'Global', 'Other'],
  'Technology': ['AI', 'Hardware', 'Software', 'Space', 'Other'],
  'Finance': ['Stocks', 'Economy', 'Forex', 'Commodities', 'Other'],
  'Entertainment': ['Movies', 'Music', 'Awards', 'Celebrities', 'Other'],
  'Other': ['Other']
};

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
const AdminQuestionCard = ({ question, isDark, onSettle, onSync, onEdit, onToggleVisibility, onCancel, onChangeOutcome, settling, syncing, canceling, changingOutcome, t, userAddress }) => {
  const stats = question.pool_stats?.[0] || {};
  const outcomeStats = stats.outcome_stats || [];
  const canPerformActions = isSuperAdmin(userAddress);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const totalParticipants = outcomeStats.reduce((sum, s) => sum + (s.participants || 0), 0);
  const totalVolumeUsdt = outcomeStats.reduce((sum, s) => sum + (s.usdt_total || 0), 0);
  
  const getPercentage = (index) => {
    if (totalVolumeUsdt === 0) return 0;
    const volume = outcomeStats[index]?.usdt_total || 0;
    return (volume / totalVolumeUsdt) * 100;
  };

  const isPendingSettlement = question.status !== 'settled' && question.status !== 'cancelled' && new Date(question.deadline) < new Date();
  
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
    const end = new Date(question.deadline);
    const diff = end.getTime() - currentTime;

    if (diff <= 0) return { label: 'Ended', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    let timeLabel = '';
    if (days > 0) timeLabel = `${days}d ${hours}h left`;
    else if (hours > 0) timeLabel = `${hours}h ${minutes}m left`;
    else if (minutes > 0) timeLabel = `${minutes}m ${seconds}s left`;
    else timeLabel = `${seconds}s left`;

    return { 
      label: timeLabel, 
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
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black bg-gradient-to-r ${getCategoryColor(question.category)} text-white shadow-lg shadow-yellow-500/10 tracking-widest uppercase`}>
              {question.category}
            </span>
            {question.isHidden && (
                <span className="px-2 py-1 rounded-full text-[10px] font-black bg-red-500 text-white uppercase tracking-wider">
                    DISABLED
                </span>
            )}
            {question.status === 'cancelled' && (
                <span className="px-2 py-1 rounded-full text-[10px] font-black bg-red-600 text-white uppercase tracking-wider animate-pulse">
                    CANCELLED
                </span>
            )}
          </div>
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
              <div>{totalVolumeUsdt.toFixed(2)} USDT</div>
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
                        {outcomeStats[index]?.usdt_total?.toFixed(1) || 0} USDT
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
                question.status === 'cancelled'
                  ? isDark ? 'bg-red-900/20 text-red-400 border-red-800/50' : 'bg-red-50 text-red-700 border-red-200'
                  : question.status === 'settled'
                  ? isDark ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-700 border-blue-200'
                  : isPendingSettlement
                    ? isDark ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800/50' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : isDark ? 'bg-green-900/20 text-green-400 border-green-800/50' : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                {question.status === 'cancelled'
                    ? 'Cancelled'
                    : question.status === 'settled' 
                    ? `Settled: ${question.outcomes?.[question.result] || 'Unknown'}` 
                    : isPendingSettlement ? 'Pending Settlement' : 'Open'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {canPerformActions ? (
                <>
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

                  {question.status === 'settled' && (
                    <>
                      {question.outcomes?.map((outcome, index) => (
                          index !== question.result && (
                            <button
                                key={index}
                                onClick={() => onChangeOutcome(question._id, index)}
                                disabled={changingOutcome?.[question._id]}
                                className={`p-2 rounded-lg text-white transition-colors disabled:opacity-50 flex items-center gap-1 bg-orange-500 hover:bg-orange-600`}
                                title={`Change result to ${outcome}`}
                            >
                                <RefreshCw className={`w-4 h-4 ${changingOutcome?.[question._id] ? 'animate-spin' : ''}`} />
                                <span className="text-xs font-bold">{outcome}</span>
                            </button>
                          )
                      ))}
                    </>
                  )}
                  
                  {question.contract_question_id !== undefined && question.contract_question_id !== null && question.status !== 'settled' && question.status !== 'cancelled' && (
                      <button
                        onClick={() => onCancel(question)}
                        disabled={canceling?.[question._id]}
                        className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            canceling?.[question._id] ? 'animate-pulse' : ''
                        } bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20`}
                        title="Cancel Market (Refund All)"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-bold">Cancel</span>
                      </button>
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

                  {question.status !== 'cancelled' && (
                    <button
                      onClick={() => onEdit(question)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
                      }`}
                      title="Edit Question"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => onToggleVisibility(question)}
                    className={`p-2 rounded-lg transition-colors ${
                        question.isHidden 
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        : (isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900')
                    }`}
                    title={question.isHidden ? "Enable Question" : "Disable Question"}
                  >
                    {question.isHidden ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                </>
              ) : (
                <span className="text-xs text-gray-400">View Only</span>
              )}
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
  const [withdrawingFees, setWithdrawingFees] = useState(false);
  const [canceling, setCanceling] = useState({});
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [questionToCancel, setQuestionToCancel] = useState(null);
  const [settleConfirm, setSettleConfirm] = useState(null);
  const [changeOutcomeConfirm, setChangeOutcomeConfirm] = useState(null);
  const [changingOutcome, setChangingOutcome] = useState({});
  
  // Withdrawal Settings State
  const [withdrawalSettings, setWithdrawalSettings] = useState({
    delay: 0,
    globalPaused: false,
    userPausedAddress: '',
    userPausedStatus: false
  });
  const [updatingSettings, setUpdatingSettings] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Sports',
    subcategory: '',
    country: '',
    level: '',
    deadline: '',
    outcomes: ['Yes', 'No'],
    totalLimit: 0,
    betAmountLimit: 0,
    minBetAmount: 0
  });
  
  // Stats State
  const [stats, setStats] = useState({
    totalBets: '0',
    totalWinnings: '0',
    totalFees: '0'
  });

  const isAdmin = isAdminAddress(walletAddress);
  const canPerformActions = isSuperAdmin(walletAddress);

  useEffect(() => {
    if (isAdmin) {
      fetchQuestions();
      loadStats();
      loadWithdrawalSettings();
    }
  }, [isAdmin, pagination.page, filters]);

  const loadWithdrawalSettings = async () => {
    try {
        const settings = await web3Service.getWithdrawalSettings(withdrawalSettings.userPausedAddress || null);
        setWithdrawalSettings(prev => ({
            ...prev,
            delay: settings.withdrawalDelay,
            globalPaused: settings.globalWithdrawalPaused,
            userPausedStatus: settings.userWithdrawalPaused
        }));
    } catch (error) {
        console.error("Failed to load withdrawal settings:", error);
    }
  };

  const handleUpdateWithdrawalDelay = async () => {
      try {
          setUpdatingSettings(true);
          await web3Service.setWithdrawalDelay(withdrawalSettings.delay);
          if (onShowToast) onShowToast("Withdrawal delay updated", "success");
      } catch (error) {
          console.error("Failed to update delay:", error);
          if (onShowToast) onShowToast("Failed to update delay", "error");
      } finally {
          setUpdatingSettings(false);
      }
  };

  const handleToggleGlobalPause = async () => {
      try {
          setUpdatingSettings(true);
          const newStatus = !withdrawalSettings.globalPaused;
          await web3Service.setGlobalWithdrawalPaused(newStatus);
          setWithdrawalSettings(prev => ({ ...prev, globalPaused: newStatus }));
          if (onShowToast) onShowToast(`Global withdrawals ${newStatus ? 'PAUSED' : 'RESUMED'}`, "success");
      } catch (error) {
          console.error("Failed to toggle global pause:", error);
          if (onShowToast) onShowToast("Failed to toggle global pause", "error");
      } finally {
          setUpdatingSettings(false);
      }
  };

  const handleCheckUserPause = async () => {
      if (!withdrawalSettings.userPausedAddress) return;
      try {
          const settings = await web3Service.getWithdrawalSettings(withdrawalSettings.userPausedAddress);
          setWithdrawalSettings(prev => ({ ...prev, userPausedStatus: settings.userWithdrawalPaused }));
      } catch (error) {
          console.error("Failed to check user:", error);
      }
  };

  const handleToggleUserPause = async () => {
      if (!withdrawalSettings.userPausedAddress) return;
      try {
          setUpdatingSettings(true);
          const newStatus = !withdrawalSettings.userPausedStatus;
          await web3Service.setUserWithdrawalPaused(withdrawalSettings.userPausedAddress, newStatus);
          setWithdrawalSettings(prev => ({ ...prev, userPausedStatus: newStatus }));
          if (onShowToast) onShowToast(`User withdrawals ${newStatus ? 'PAUSED' : 'RESUMED'}`, "success");
      } catch (error) {
          console.error("Failed to toggle user pause:", error);
          if (onShowToast) onShowToast("Failed to toggle user pause", "error");
      } finally {
          setUpdatingSettings(false);
      }
  };

  const handleCancelQuestion = (question) => {
    setQuestionToCancel(question);
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    if (!questionToCancel) return;
    
    const question = questionToCancel;
    setShowCancelConfirm(false);
    setQuestionToCancel(null);

    try {
      setCanceling(prev => ({ ...prev, [question._id]: true }));
      // 1. Cancel on Blockchain
      if (question.contract_question_id !== undefined && question.contract_question_id !== null) {
         await web3Service.cancelQuestion(question.contract_question_id);
      }
      
      // 2. Sync/Update DB
      await handleSyncQuestion(question);
      if (onShowToast) onShowToast("Market cancelled successfully", "success");
      
    } catch (error) {
      console.error("Cancel failed:", error);
      if (onShowToast) onShowToast("Failed to cancel market", "error");
    } finally {
      setCanceling(prev => ({ ...prev, [question._id]: false }));
    }
  };

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        includeHidden: 'true',
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

  const handleWithdrawFees = async () => {
    try {
      setWithdrawingFees(true);
      await web3Service.withdrawAdminFees();
      if (onShowToast) onShowToast(t('admin.toast.feesWithdrawnSuccess') || 'Fees withdrawn successfully', 'success');
      loadStats();
    } catch (error) {
      console.error('Failed to withdraw fees:', error);
      if (onShowToast) onShowToast(t('admin.toast.feesWithdrawFailed') || 'Failed to withdraw fees', 'error');
    } finally {
      setWithdrawingFees(false);
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
                <span className="text-sm opacity-70">{platformStats.data.bets.totalUsdtStaked.toFixed(2)} USDT</span>
              </div>
            </div>
          ),
          totalWinnings: (
            <div className="flex flex-col">
              <span className="text-lg opacity-70">{platformStats.data.withdrawals.totalUsdtWithdrawn.toFixed(2)} USDT</span>
            </div>
          ),
          totalFees: (
            <div className="flex flex-col">
              <span className="text-lg opacity-70">{parseFloat(adminFees.usdt).toFixed(2)} USDT</span>
              {parseFloat(adminFees.usdt) > 0 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWithdrawFees();
                  }}
                  disabled={withdrawingFees}
                  className="mt-2 text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-bold"
                >
                  {withdrawingFees ? 'Processing...' : 'Withdraw Fees'}
                </button>
              )}
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

  const handleSettle = (questionId, result) => {
    const question = questions.find(q => q._id === questionId);
    if (!question) return;
    
    setSettleConfirm({
        questionId,
        result,
        questionTitle: question.title,
        outcomeName: question.outcomes?.[result] || 'Unknown'
    });
  };

  const executeSettle = async () => {
    if (!settleConfirm) return;
    const { questionId, result } = settleConfirm;
    setSettleConfirm(null);

    setSettling(prev => ({ ...prev, [questionId]: true }));

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

  const handleChangeOutcome = (questionId, result) => {
    const question = questions.find(q => q._id === questionId);
    if (!question) return;

    setChangeOutcomeConfirm({
        questionId,
        result,
        questionTitle: question.title,
        outcomeName: question.outcomes?.[result] || 'Unknown'
    });
  };

  const executeChangeOutcome = async () => {
    if (!changeOutcomeConfirm) return;
    const { questionId, result } = changeOutcomeConfirm;
    setChangeOutcomeConfirm(null);

    setChangingOutcome(prev => ({ ...prev, [questionId]: true }));

    try {
      const question = questions.find(q => q._id === questionId);
      if (!question) return;

      // Call Blockchain
      if (onShowToast) onShowToast("Updating outcome on blockchain...", "info");
      await web3Service.changeOutcome(question.contract_question_id, result);
      
      if (onShowToast) onShowToast("Outcome updated on blockchain", "success");

      // Sync DB
      await handleSyncQuestion(question);

    } catch (error) {
      console.error('Failed to change outcome:', error);
      
      let errorMessage = error.message || 'Unknown error';
      
      // Parse detailed error message for better user experience
      if (errorMessage.includes("Withdrawals already started") || 
          (error.reason && error.reason.includes("Withdrawals already started")) ||
          (error.data && typeof error.data === 'string' && error.data.includes("Withdrawals already started"))) {
        errorMessage = "Cannot change outcome: Withdrawals have already started for this market. The settlement is final once a user has withdrawn.";
      } else if (errorMessage.includes("execution reverted")) {
        // Try to clean up generic revert messages
        if (errorMessage.includes("Withdrawals already started")) {
             errorMessage = "Cannot change outcome: Withdrawals have already started.";
        }
      }

      if (onShowToast) onShowToast(errorMessage, "error");
    } finally {
      setChangingOutcome(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const toLocalISOString = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setEditFormData({
        title: question.title,
        description: question.description || '',
        category: question.category,
        subcategory: question.subcategory || '',
        country: question.country || '',
        level: question.level || '',
        deadline: question.deadline ? toLocalISOString(question.deadline) : '',
        totalLimit: question.totalLimit || 0,
        betAmountLimit: question.betAmountLimit || 0,
        minBetAmount: question.minBetAmount || 0,
        outcomes: question.outcomes || []
    });
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
        // Check for deadline update if on-chain
        if (editingQuestion.contract_question_id !== undefined && editingQuestion.contract_question_id !== null) {
            const oldDeadline = new Date(editingQuestion.deadline).getTime();
            const newDeadline = new Date(editFormData.deadline).getTime();
            const now = Date.now();

            console.log("Debug Deadline Update:", {
                oldDeadline,
                newDeadline,
                diff: Math.abs(newDeadline - oldDeadline),
                editingQuestionDeadline: editingQuestion.deadline,
                editFormDataDeadline: editFormData.deadline,
                contractId: editingQuestion.contract_question_id
            });
            
            if (editingQuestion.isSettled) {
                if (onShowToast) onShowToast("Cannot update deadline for settled questions", "error");
                return;
            }

            // Check if deadline changed
            const timeDiff = Math.abs(newDeadline - oldDeadline);
            if (timeDiff > 0) {
                 // Ensure new deadline is in the future
                 if (newDeadline <= now) {
                     if (onShowToast) onShowToast("New deadline must be in the future", "error");
                     return;
                 }

                 if (onShowToast) onShowToast(t('admin.toast.updatingBlockchain') || "Updating deadline on blockchain...", "info");
                 const deadlineTimestamp = Math.floor(newDeadline / 1000);
                 try {
                     await web3Service.updateQuestionDeadline(editingQuestion.contract_question_id, deadlineTimestamp);
                     if (onShowToast) onShowToast(t('admin.toast.blockchainUpdated') || "Blockchain deadline updated", "success");
                     
                     // Wait a bit for blockchain to update before syncing/updating DB
                     await new Promise(resolve => setTimeout(resolve, 2000));
                 } catch (chainError) {
                     console.error("Blockchain update failed:", chainError);
                     let errorMessage = chainError.reason || chainError.message || "Unknown blockchain error";
                     if (errorMessage.includes("New deadline must be in future")) {
                         errorMessage = "New deadline must be in the future (relative to now).";
                     } else if (errorMessage.includes("user rejected")) {
                         errorMessage = "Transaction rejected by user.";
                     }
                     if (onShowToast) onShowToast(`Failed to update blockchain: ${errorMessage}`, "error");
                     return; // Stop DB update if blockchain update fails
                 }
            }
        }

        const response = await fetch(`${API_BASE_URL}/questions/${editingQuestion._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...editFormData,
                deadline: new Date(editFormData.deadline).toISOString()
            })
        });
        const data = await response.json();
        if (data.success) {
            if (onShowToast) onShowToast("Question updated successfully", "success");
            setEditingQuestion(null);
            fetchQuestions();
        } else {
             if (onShowToast) onShowToast(data.error || "Failed to update", "error");
        }
    } catch (err) {
        console.error(err);
        if (onShowToast) onShowToast("Failed to update question", "error");
    }
  };

  const handleToggleVisibility = async (question) => {
      try {
          const newStatus = !question.isHidden;
          const response = await fetch(`${API_BASE_URL}/questions/${question._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isHidden: newStatus })
          });
          const data = await response.json();
          if (data.success) {
              if (onShowToast) onShowToast(newStatus ? "Question disabled" : "Question enabled", "success");
              fetchQuestions();
          } else {
               if (onShowToast) onShowToast(data.error || "Failed to update visibility", "error");
          }
      } catch (err) {
          console.error(err);
          if (onShowToast) onShowToast("Failed to update visibility", "error");
      }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    console.log("[AdminPanel] handleCreateQuestion started");
    setCreating(true);
    setCreateMessage('');

    try {
      console.log("[AdminPanel] Validating inputs...");
      const deadlineDate = new Date(formData.deadline);
      const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);

      // Validate outcomes
      const validOutcomes = formData.outcomes.filter(o => o.trim() !== '');
      if (validOutcomes.length < 2) {
          throw new Error("At least 2 outcomes are required");
      }
      console.log("[AdminPanel] Inputs valid. Outcomes:", validOutcomes.length);

      setCreateMessage(t('admin.toast.signTransaction'));

      console.log("[AdminPanel] Calling web3Service.createQuestion...");
      const { transactionHash, contractQuestionId } = await web3Service.createQuestion(
        formData.title,
        deadlineTimestamp,
        validOutcomes.length // Pass outcome count
      );
      console.log("[AdminPanel] Web3 creation successful:", { transactionHash, contractQuestionId });

      setCreateMessage(t('admin.toast.creatingDb'));

      console.log("[AdminPanel] Sending POST to /questions...");
      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory,
          country: formData.country,
          level: formData.level,
          deadline: deadlineDate.toISOString(),
          outcomes: validOutcomes,
          adminAddress: walletAddress,
          transactionHash,
          contractQuestionId,
          totalLimit: formData.totalLimit,
          betAmountLimit: formData.betAmountLimit,
          minBetAmount: formData.minBetAmount
        })
      });
      console.log("[AdminPanel] Backend response status:", response.status);

      const data = await response.json();
      console.log("[AdminPanel] Backend data:", data);

      if (data.success) {
        setCreateMessage(t('admin.toast.createSuccess'));
        if (onShowToast) onShowToast(t('admin.toast.createSuccess'));
        if (onRefresh) onRefresh();
        setFormData({ title: '', description: '', category: 'Sports', subcategory: '', country: '', level: '', deadline: '', outcomes: ['Yes', 'No'], totalLimit: 0, betAmountLimit: 0, minBetAmount: 0 });
        setShowCreateForm(false);
        fetchQuestions(); // Refresh list
        setTimeout(() => setCreateMessage(''), 3000);
      } else {
        setCreateMessage(t('admin.toast.createFailed', { error: data.error }));
      }
    } catch (error) {
      console.error('Failed to create question:', error);
      let errorMessage = error.message || 'Unknown error';
      
      // Handle common blockchain/wallet errors
      if (errorMessage.includes("Failed to fetch") || (error.data && error.data.cause && error.data.cause.message === "Failed to fetch")) {
        errorMessage = "Network Error: Unable to connect to blockchain. Please check your internet or wallet RPC settings.";
      } else if (errorMessage.includes("user rejected") || error.code === 4001) {
        errorMessage = "Transaction rejected by user.";
      } else if (error.code === -32603) {
        errorMessage = "Internal JSON-RPC Error. Possible network issue or contract revert.";
      }

      setCreateMessage(t('admin.toast.createFailed', { error: errorMessage }));
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
          {canPerformActions && (
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
          )}
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

        {/* Withdrawal Settings Section */}
        {canPerformActions && (
            <div className={`mb-8 p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Wallet className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                    <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Withdrawal Controls</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Withdrawal Delay */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Withdrawal Delay (Seconds)
                        </label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                value={withdrawalSettings.delay}
                                onChange={(e) => setWithdrawalSettings({...withdrawalSettings, delay: parseInt(e.target.value) || 0})}
                                className={`w-full px-3 py-2 rounded-lg text-sm border outline-none ${
                                    isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                                }`}
                            />
                            <button 
                                onClick={handleUpdateWithdrawalDelay}
                                disabled={updatingSettings}
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                            >
                                Save
                            </button>
                        </div>
                        <p className={`text-[10px] mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Time users must wait after settlement to withdraw.
                        </p>
                    </div>

                    {/* Global Pause */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Global Withdrawal Status
                        </label>
                        <div className="flex items-center justify-between">
                            <span className={`font-bold ${withdrawalSettings.globalPaused ? 'text-red-500' : 'text-green-500'}`}>
                                {withdrawalSettings.globalPaused ? 'PAUSED' : 'ACTIVE'}
                            </span>
                            <button 
                                onClick={handleToggleGlobalPause}
                                disabled={updatingSettings}
                                className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50 ${
                                    withdrawalSettings.globalPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                {withdrawalSettings.globalPaused ? 'RESUME' : 'PAUSE ALL'}
                            </button>
                        </div>
                         <p className={`text-[10px] mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Stop ALL user withdrawals instantly.
                        </p>
                    </div>

                    {/* User Pause */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            User Specific Restriction
                        </label>
                        <div className="flex flex-col gap-2">
                            <input 
                                type="text" 
                                placeholder="User Address (0x...)"
                                value={withdrawalSettings.userPausedAddress}
                                onChange={(e) => setWithdrawalSettings({...withdrawalSettings, userPausedAddress: e.target.value})}
                                onBlur={handleCheckUserPause}
                                className={`w-full px-3 py-2 rounded-lg text-xs border outline-none ${
                                    isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                                }`}
                            />
                            <div className="flex items-center justify-between mt-1">
                                <span className={`text-xs ${withdrawalSettings.userPausedStatus ? 'text-red-500' : 'text-green-500'}`}>
                                    {withdrawalSettings.userPausedStatus ? 'Blocked' : 'Allowed'}
                                </span>
                                <button 
                                    onClick={handleToggleUserPause}
                                    disabled={updatingSettings || !withdrawalSettings.userPausedAddress}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors disabled:opacity-50 ${
                                        withdrawalSettings.userPausedStatus ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                    }`}
                                >
                                    {withdrawalSettings.userPausedStatus ? 'Unblock' : 'Block'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

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
                  <option value="cancelled">Cancelled</option>
                  <option value="disabled">Disabled (Hidden)</option>
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
                      onEdit={handleEdit}
                      onToggleVisibility={handleToggleVisibility}
                      onCancel={handleCancelQuestion}
                      onChangeOutcome={handleChangeOutcome}
                      settling={settling}
                      syncing={syncing}
                      canceling={canceling}
                      changingOutcome={changingOutcome}
                      t={t}
                      userAddress={walletAddress}
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
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Total Participants Limit
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.totalLimit}
                                onChange={(e) => setFormData({ ...formData, totalLimit: parseFloat(e.target.value) || 0 })}
                                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-yellow-500 outline-none transition-all no-spinner ${
                                isDark 
                                    ? 'bg-gray-900 border-gray-700 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-900'
                                }`}
                                placeholder="0 for unlimited"
                            />
                            <p className="text-xs text-gray-500 mt-1">0 = Unlimited participants</p>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Min Bet Amount (USDT)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.minBetAmount}
                                onChange={(e) => setFormData({ ...formData, minBetAmount: parseFloat(e.target.value) || 0 })}
                                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-yellow-500 outline-none transition-all no-spinner ${
                                isDark 
                                    ? 'bg-gray-900 border-gray-700 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-900'
                                }`}
                                placeholder="0 for any"
                            />
                             <p className="text-xs text-gray-500 mt-1">0 = Any amount</p>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Max Bet Amount (USDT)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.betAmountLimit}
                                onChange={(e) => setFormData({ ...formData, betAmountLimit: parseFloat(e.target.value) || 0 })}
                                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-yellow-500 outline-none transition-all no-spinner ${
                                isDark 
                                    ? 'bg-gray-900 border-gray-700 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-900'
                                }`}
                                placeholder="0 for unlimited"
                            />
                             <p className="text-xs text-gray-500 mt-1">0 = Unlimited</p>
                        </div>
                    </div>

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
                        onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '', country: '', level: '' })}
                        className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-yellow-500 outline-none transition-all ${
                          isDark 
                            ? 'bg-gray-900 border-gray-700 text-white' 
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      >
                        {Object.keys(CATEGORIES).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Subcategory
                        </label>
                        <select
                            required
                            value={formData.subcategory}
                            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-yellow-500 outline-none transition-all ${
                            isDark 
                                ? 'bg-gray-900 border-gray-700 text-white' 
                                : 'bg-gray-50 border-gray-200 text-gray-900'
                            }`}
                        >
                            <option value="">Select Subcategory</option>
                            {CATEGORIES[formData.category]?.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>

                    {formData.category === 'Politics' && (
                        <>
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Country
                            </label>
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-yellow-500 outline-none transition-all ${
                                isDark 
                                    ? 'bg-gray-900 border-gray-700 text-white' 
                                    : 'bg-gray-50 border-gray-200 text-gray-900'
                                }`}
                            >
                                <option value="">Select Country</option>
                                <option value="USA">USA</option>
                                <option value="India">India</option>
                                <option value="UK">UK</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        {formData.country && (
                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Level
                                </label>
                                <select
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-yellow-500 outline-none transition-all ${
                                    isDark 
                                        ? 'bg-gray-900 border-gray-700 text-white' 
                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                                >
                                    <option value="">Select Level</option>
                                    <option value="Government">Government</option>
                                    <option value="Local">Local</option>
                                </select>
                            </div>
                        )}
                        </>
                    )}

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

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border ${
            isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
             <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Question</h2>
                <button 
                    onClick={() => setEditingQuestion(null)}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                    <XCircle className="w-6 h-6" />
                </button>
             </div>
             <form onSubmit={handleUpdateQuestion} className="p-6 space-y-4">
                {/* Title */}
                <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Question Title</label>
                    <input 
                        type="text" 
                        value={editFormData.title} 
                        onChange={e => setEditFormData({...editFormData, title: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                    <textarea 
                        value={editFormData.description} 
                        onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 min-h-[100px] ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    />
                </div>

                {/* Outcomes */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Outcomes
                  </label>
                  <div className="space-y-2">
                    {editFormData.outcomes && editFormData.outcomes.map((outcome, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={outcome}
                          onChange={(e) => {
                            const newOutcomes = [...editFormData.outcomes];
                            newOutcomes[index] = e.target.value;
                            setEditFormData({ ...editFormData, outcomes: newOutcomes });
                          }}
                          className={`w-full px-4 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all ${
                            isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                          }`}
                          placeholder={`Outcome ${index + 1}`}
                        />
                        {editFormData.outcomes.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newOutcomes = editFormData.outcomes.filter((_, i) => i !== index);
                              setEditFormData({ ...editFormData, outcomes: newOutcomes });
                            }}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {editFormData.outcomes && editFormData.outcomes.length < 5 && (
                      <button
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, outcomes: [...editFormData.outcomes, ''] })}
                        className={`text-sm font-bold flex items-center gap-1 ${
                          isDark ? 'text-yellow-500' : 'text-yellow-600'
                        }`}
                      >
                        <Plus className="w-4 h-4" /> Add Outcome
                      </button>
                    )}
                  </div>
                </div>

                {/* Category & Subcategory */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                        <select 
                            value={editFormData.category} 
                            onChange={e => setEditFormData({...editFormData, category: e.target.value, subcategory: '', country: '', level: ''})}
                            className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        >
                            {Object.keys(CATEGORIES).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Subcategory</label>
                        <select 
                            required
                            value={editFormData.subcategory} 
                            onChange={e => setEditFormData({...editFormData, subcategory: e.target.value})}
                            className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        >
                            <option value="">Select Subcategory</option>
                            {CATEGORIES[editFormData.category]?.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Country & Level */}
                {editFormData.category === 'Politics' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Country</label>
                            <select 
                                value={editFormData.country} 
                                onChange={e => setEditFormData({...editFormData, country: e.target.value})}
                                className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                            >
                                <option value="">Select Country</option>
                                <option value="USA">USA</option>
                                <option value="India">India</option>
                                <option value="UK">UK</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        {editFormData.country && (
                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Level</label>
                                <select 
                                    value={editFormData.level} 
                                    onChange={e => setEditFormData({...editFormData, level: e.target.value})}
                                    className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                                >
                                    <option value="">Select Level</option>
                                    <option value="Government">Government</option>
                                    <option value="Local">Local</option>
                                </select>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Limits */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Participants Limit</label>
                        <input 
                            type="number" 
                            min="0"
                            value={editFormData.totalLimit} 
                            onChange={e => setEditFormData({...editFormData, totalLimit: parseFloat(e.target.value) || 0})}
                            className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 no-spinner ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        />
                         <p className="text-xs text-gray-500 mt-1">0 = Unlimited participants</p>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Min Bet Amount</label>
                        <input 
                            type="number" 
                            min="0"
                            value={editFormData.minBetAmount} 
                            onChange={e => setEditFormData({...editFormData, minBetAmount: parseFloat(e.target.value) || 0})}
                            className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 no-spinner ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        />
                         <p className="text-xs text-gray-500 mt-1">0 = Any amount</p>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Max Bet Amount</label>
                        <input 
                            type="number" 
                            min="0"
                            value={editFormData.betAmountLimit} 
                            onChange={e => setEditFormData({...editFormData, betAmountLimit: parseFloat(e.target.value) || 0})}
                            className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 no-spinner ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        />
                         <p className="text-xs text-gray-500 mt-1">0 = Unlimited</p>
                    </div>
                </div>

                {/* Deadline */}
                 <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Deadline</label>
                    <div className="flex flex-col gap-2">
                        <input 
                            type="datetime-local" 
                            value={editFormData.deadline} 
                            onChange={e => setEditFormData({...editFormData, deadline: e.target.value})}
                            className={`w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-yellow-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white [color-scheme:dark]' : 'bg-white border-gray-200 text-gray-900'}`}
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    // Set to 2 minutes from now
                                    const now = new Date();
                                    const newTime = new Date(now.getTime() + 2 * 60 * 1000);
                                    // Format for datetime-local: YYYY-MM-DDTHH:mm
                                    const formatted = new Date(newTime.getTime() - (newTime.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                                    setEditFormData({...editFormData, deadline: formatted});
                                }}
                                className="px-3 py-1 text-xs font-bold rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                            >
                                Set to 2 Mins
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    // Extend by 10 minutes
                                    const current = new Date(editFormData.deadline || Date.now());
                                    const newTime = new Date(current.getTime() + 10 * 60 * 1000);
                                    const formatted = new Date(newTime.getTime() - (newTime.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                                    setEditFormData({...editFormData, deadline: formatted});
                                }}
                                className="px-3 py-1 text-xs font-bold rounded bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                            >
                                +10 Mins
                            </button>
                             <button
                                type="button"
                                onClick={() => {
                                    // Extend by 1 hour
                                    const current = new Date(editFormData.deadline || Date.now());
                                    const newTime = new Date(current.getTime() + 60 * 60 * 1000);
                                    const formatted = new Date(newTime.getTime() - (newTime.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                                    setEditFormData({...editFormData, deadline: formatted});
                                }}
                                className="px-3 py-1 text-xs font-bold rounded bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                            >
                                +1 Hour
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex gap-3 justify-between items-center">
                    <div>
                        {editingQuestion.contract_question_id && !editingQuestion.isSettled && (
                            <button
                                type="button"
                                onClick={() => {
                                    handleCancelQuestion(editingQuestion);
                                    setEditingQuestion(null);
                                }}
                                className="px-4 py-2 rounded-lg font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all active:scale-95 text-sm"
                            >
                                CANCEL MARKET (REFUND)
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setEditingQuestion(null)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                        >
                            Close
                        </button>
                        <button 
                            type="submit"
                            className="px-6 py-2 rounded-lg font-bold bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/20 transition-all active:scale-95"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl border ${
              isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirm Market Cancel</h2>
                <button 
                  onClick={() => setShowCancelConfirm(false)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-8 h-8 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>CRITICAL ACTION</p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Are you sure you want to CANCEL this market? This will allow all users to claim full refunds for their bets.
                      This action cannot be undone and will permanently close the market.
                    </p>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Market Details
                  </p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {questionToCancel?.title || 'Unknown Market'}
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => setShowCancelConfirm(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleConfirmCancel}
                    className="px-6 py-2 rounded-lg font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all active:scale-95"
                  >
                    CONFIRM CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Settlement Confirmation Modal */}
      {settleConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl border ${
              isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirm Settlement</h2>
                <button 
                  onClick={() => setSettleConfirm(null)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Declare Winner: <span className="text-green-500">{settleConfirm.outcomeName}</span>
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Are you sure you want to settle this market? 
                    </p>
                    <p className="text-xs text-red-500 mt-2 font-bold">
                      WARNING: This action is irreversible. The outcome cannot be changed once settled on the blockchain.
                    </p>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Market Details
                  </p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {settleConfirm.questionTitle}
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => setSettleConfirm(null)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={executeSettle}
                    className="px-6 py-2 rounded-lg font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 transition-all active:scale-95"
                  >
                    CONFIRM SETTLEMENT
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Change Outcome Confirmation Modal */}
      {changeOutcomeConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl border ${
              isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirm Outcome Change</h2>
                <button 
                  onClick={() => setChangeOutcomeConfirm(null)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-8 h-8 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Change Winner To: <span className="text-orange-500">{changeOutcomeConfirm.outcomeName}</span>
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Are you sure you want to change the outcome?
                    </p>
                    <p className="text-xs text-red-500 mt-2 font-bold">
                      WARNING: This action is only possible if no withdrawals have been made yet.
                    </p>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Market Details
                  </p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {changeOutcomeConfirm.questionTitle}
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => setChangeOutcomeConfirm(null)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={executeChangeOutcome}
                    className="px-6 py-2 rounded-lg font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                  >
                    CONFIRM CHANGE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
