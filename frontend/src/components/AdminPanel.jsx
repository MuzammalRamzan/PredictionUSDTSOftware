import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Shield, Plus, Calendar, Tag, FileText } from 'lucide-react';
import { isAdminAddress } from '../config/admin';
import { useTheme } from '../contexts/ThemeContext';
import { web3Service } from '../services/web3';
import { API_BASE_URL } from '../services/api';

export default function AdminPanel({ walletAddress, isLoading, onShowToast, onRefresh }) {
  const { isDark } = useTheme();
  const [endedQuestions, setEndedQuestions] = useState([]);
  const [selectedResult, setSelectedResult] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState('');
  const [settling, setSettling] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Sports',
    deadline: ''
  });
  const [syncing, setSyncing] = useState(false);

  const isAdmin = isAdminAddress(walletAddress);

  useEffect(() => {
    if (isAdmin) {
      loadEndedQuestions();
    }
  }, [isAdmin]);

  const loadEndedQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions`);
      const data = await response.json();

      if (data.success) {
        const now = new Date();
        const ended = data.data.filter(q => {
          const deadline = new Date(q.deadline);
          return deadline < now && q.status !== 'settled';
        });

        const verifiedEndedQuestions = [];

        for (const question of ended) {
          try {
            const blockchainQuestion = await web3Service.getQuestion(question.contract_question_id);

            if (blockchainQuestion.isSettled) {
              console.log(`Question ${question.contract_question_id} is settled on blockchain, syncing...`);
              await fetch(`${API_BASE_URL}/questions/sync/${question.contract_question_id}`, {
                method: 'POST'
              });
            } else {
              verifiedEndedQuestions.push(question);
            }
          } catch (error) {
            console.error(`Failed to verify question ${question.contract_question_id}:`, error);
            verifiedEndedQuestions.push(question);
          }
        }

        setEndedQuestions(verifiedEndedQuestions);
      }
    } catch (error) {
      console.error('Failed to load ended questions:', error);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/questions`);
      const data = await response.json();

      if (data.success) {
        let syncedCount = 0;
        let errorCount = 0;

        for (const question of data.data) {
          if (question.contract_question_id !== undefined) {
            try {
              const syncResponse = await fetch(`${API_BASE_URL}/questions/sync/${question.contract_question_id}`, {
                method: 'POST'
              });

              if (syncResponse.ok) {
                syncedCount++;
              } else {
                errorCount++;
              }
            } catch (error) {
              console.error(`Failed to sync question ${question.contract_question_id}:`, error);
              errorCount++;
            }
          }
        }

        if (onShowToast) {
          onShowToast(`Sync complete! ${syncedCount} questions synced successfully.${errorCount > 0 ? ` ${errorCount} failed.` : ''}`);
        } else {
          alert(`Sync complete! ${syncedCount} questions synced successfully.${errorCount > 0 ? ` ${errorCount} failed.` : ''}`);
        }
        await loadEndedQuestions();
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Failed to sync questions:', error);
      if (onShowToast) {
        onShowToast('Failed to sync questions: ' + error.message);
      } else {
        alert('Failed to sync questions: ' + error.message);
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleSettle = async (questionId, result) => {
    setSettling({ ...settling, [questionId]: true });

    try {
      const question = endedQuestions.find(q => q._id === questionId);
      if (!question) {
        if (onShowToast) onShowToast('Question not found');
        return;
      }

      const blockchainQuestion = await web3Service.getQuestion(question.contract_question_id);

      if (blockchainQuestion.isSettled) {
        if (onShowToast) onShowToast('This question is already settled on the blockchain. Syncing database...');

        const response = await fetch(`${API_BASE_URL}/questions/sync/${question.contract_question_id}`, {
          method: 'POST'
        });

        if (response.ok) {
          const data = await response.json();
          if (onShowToast) {
            onShowToast(`Database synced! Question settled as: ${data.data?.result || 'unknown'}`);
          }
          await loadEndedQuestions();
          if (onRefresh) onRefresh();
        } else {
          if (onShowToast) onShowToast('Failed to sync database. Please try again.');
        }
        return;
      }

      let transactionHash;
      let blockchainSucceeded = false;

      try {
        transactionHash = await web3Service.settleQuestion(
          question.contract_question_id,
          result === 'yes'
        );
        blockchainSucceeded = true;
      } catch (blockchainError) {
        console.error('Blockchain error:', blockchainError);

        if (blockchainError.message && blockchainError.message.includes('Already settled')) {
          if (onShowToast) onShowToast('Question was already settled on blockchain. Syncing database...');

          const syncResponse = await fetch(`${API_BASE_URL}/questions/sync/${question.contract_question_id}`, {
            method: 'POST'
          });

          if (syncResponse.ok) {
            const data = await syncResponse.json();
            if (onShowToast) {
              onShowToast(`Database synced! Question settled as: ${data.data?.result || 'unknown'}`);
            }
            await loadEndedQuestions();
            if (onRefresh) onRefresh();
          } else {
            if (onShowToast) onShowToast('Failed to sync database. Please try again.');
          }
          return;
        }

        throw blockchainError;
      }

      const response = await fetch(`${API_BASE_URL}/questions/${questionId}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          result,
          adminAddress: walletAddress,
          transactionHash
        })
      });

      const data = await response.json();

      if (data.success) {
        if (onShowToast) onShowToast('Question settled successfully!');
        await loadEndedQuestions();
        if (onRefresh) onRefresh();
      } else {
        console.error('Database update failed:', data);
        if (blockchainSucceeded) {
          console.log('Blockchain succeeded, attempting to sync. Error was:', data.error);
          if (onShowToast) {
            onShowToast(`Blockchain transaction succeeded but database update failed: ${data.error}. Syncing now...`);
          }

          const syncResponse = await fetch(`${API_BASE_URL}/questions/sync/${question.contract_question_id}`, {
            method: 'POST'
          });

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            console.log('Sync successful:', syncData);
            if (onShowToast) onShowToast('Database synced successfully!');
            await loadEndedQuestions();
            if (onRefresh) onRefresh();
          } else {
            const syncError = await syncResponse.json();
            console.error('Sync failed:', syncError);
            if (onShowToast) {
              onShowToast(`Warning: Question is settled on blockchain but database sync failed: ${syncError.error || 'Unknown error'}`);
            }
          }
        } else {
          if (onShowToast) onShowToast('Failed to settle question: ' + (data.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Failed to settle question:', error);
      if (onShowToast) {
        onShowToast('Failed to settle question: ' + (error.message || 'Unknown error'));
      }
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

      setCreateMessage('Sign transaction in MetaMask to create question on blockchain...');

      const { transactionHash, contractQuestionId } = await web3Service.createQuestion(
        formData.title,
        deadlineTimestamp
      );

      setCreateMessage('Creating question in database...');

      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          deadline: deadlineDate.toISOString(),
          adminAddress: walletAddress,
          transactionHash,
          contractQuestionId
        })
      });

      const data = await response.json();

      if (data.success) {
        setCreateMessage('Question created successfully!');
      if (onShowToast) onShowToast('Question created successfully!');
      if (onRefresh) onRefresh();
      setFormData({
        title: '',
        description: '',
        category: 'Sports',
        deadline: ''
      });
      setShowCreateForm(false);
      setTimeout(() => setCreateMessage(''), 3000);
    } else {
      setCreateMessage('Failed to create question: ' + (data.error || 'Unknown error'));
      if (onShowToast) onShowToast('Failed to create question: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Failed to create question:', error);
    setCreateMessage('Failed to create question: ' + (error.message || 'Unknown error'));
    if (onShowToast) onShowToast('Failed to create question: ' + (error.message || 'Unknown error'));
  } finally {
    setCreating(false);
  }
};

  const getTimeEnded = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = now.getTime() - end.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <section id="admin" className="py-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-30' : 'opacity-40'}`}>
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px] mix-blend-screen animate-pulse ${
          isDark ? 'bg-yellow-900/20' : 'bg-yellow-200/40'
        }`}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 mb-6 backdrop-blur-sm border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
            <Shield className={`w-8 h-8 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>
          <h2 className={`text-4xl font-black mb-4 tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Panel</h2>
          <p className={`text-lg font-medium max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage markets, create new questions, and settle outcomes with precision
          </p>
        </div>

        {createMessage && (
          <div className={`mb-8 rounded-2xl p-6 border backdrop-blur-md ${
            createMessage.includes('successfully')
              ? isDark ? 'bg-green-900/30 border-green-700/50 text-green-300' : 'bg-green-50/80 border-green-200 text-green-700'
              : isDark ? 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300' : 'bg-yellow-50/80 border-yellow-200 text-yellow-700'
          } shadow-lg animate-in fade-in slide-in-from-top-4`}>
            <div className="flex items-center space-x-3">
              {createMessage.includes('successfully') ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="font-medium">{createMessage}</p>
            </div>
          </div>
        )}

        <div className="mb-12 flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-black tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 ${
              showCreateForm
                ? isDark ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-white text-zinc-900 border border-zinc-200 shadow-sm'
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white shadow-yellow-500/20'
            }`}
          >
            <Plus className={`w-5 h-5 ${showCreateForm ? 'rotate-45 transition-transform' : ''}`} />
            <span>{showCreateForm ? 'Cancel Creation' : 'Create New Question'}</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className={`flex items-center space-x-2 px-6 py-4 rounded-2xl font-black tracking-wide transition-all duration-300 shadow-lg hover:-translate-y-1 active:scale-95 ${
              syncing
                ? 'bg-gray-400 cursor-not-allowed opacity-70'
                : isDark
                  ? 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm'
            }`}
          >
            <CheckCircle2 className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing Database...' : 'Sync All Questions'}</span>
          </button>
        </div>

        {showCreateForm && (
          <div className={`glass-card rounded-3xl p-10 mb-12 border transition-all duration-300 animate-in fade-in zoom-in-95 ${
            isDark ? 'border-yellow-500/20 bg-zinc-900/60' : 'border-yellow-200 bg-white/95 shadow-xl shadow-yellow-900/5'
          }`}>
            <h3 className={`text-2xl font-black mb-8 flex items-center space-x-3 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <div className="w-1.5 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></div>
              <span>Question Details</span>
            </h3>

            <form onSubmit={handleCreateQuestion} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-zinc-600'}`}>
                    Question Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Will Argentina win the World Cup 2026?"
                    className={`w-full px-6 py-4 rounded-2xl border font-bold transition-all focus:outline-none focus:ring-4 ${
                      isDark
                        ? 'bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-600 focus:border-yellow-500/50 focus:ring-yellow-500/10'
                        : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-yellow-500 focus:ring-yellow-500/20 shadow-sm'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-zinc-600'}`}>
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add context and resolution criteria..."
                    rows="3"
                    className={`w-full px-6 py-4 rounded-2xl border font-bold transition-all focus:outline-none focus:ring-4 ${
                      isDark
                        ? 'bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-600 focus:border-yellow-500/50 focus:ring-yellow-500/10'
                        : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-yellow-500 focus:ring-yellow-500/20 shadow-sm'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className={`block text-sm font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-zinc-600'}`}>
                      Category
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={`w-full px-6 py-4 rounded-2xl border font-bold appearance-none transition-all focus:outline-none focus:ring-4 ${
                          isDark
                            ? 'bg-zinc-900/50 border-zinc-700 text-white focus:border-yellow-500/50 focus:ring-yellow-500/10'
                            : 'bg-white border-zinc-300 text-zinc-900 focus:border-yellow-500 focus:ring-yellow-500/20 shadow-sm'
                        }`}
                      >
                        <option value="Sports">Sports</option>
                        <option value="Crypto">Crypto</option>
                        <option value="Politics">Politics</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                      </select>
                      <div className={`absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-zinc-500'}`}>
                        <Tag className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-zinc-600'}`}>
                      Deadline
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                      className={`w-full px-6 py-4 rounded-2xl border font-bold transition-all focus:outline-none focus:ring-4 ${
                        isDark
                          ? 'bg-zinc-900/50 border-zinc-700 text-white [color-scheme:dark] focus:border-yellow-500/50 focus:ring-yellow-500/10'
                          : 'bg-white border-zinc-300 text-zinc-900 focus:border-yellow-500 focus:ring-yellow-500/20 shadow-sm'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-8 border-t border-dashed border-gray-200 dark:border-zinc-700/50">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className={`px-8 py-4 rounded-2xl font-bold transition-all hover:-translate-y-0.5 active:scale-95 ${
                    isDark
                      ? 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700'
                      : 'bg-gray-100 text-zinc-600 hover:bg-gray-200 border border-zinc-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-4 rounded-2xl font-black tracking-wide hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/30 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {creating ? 'Creating Question...' : 'Launch Market'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex items-center space-x-3 mb-8">
          <div className="w-1.5 h-8 bg-yellow-500 rounded-full"></div>
          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Ready for Settlement</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
            {endedQuestions.length}
          </span>
        </div>

        {endedQuestions.length === 0 ? (
          <div className={`glass-card rounded-3xl p-16 text-center border-2 border-dashed ${
            isDark ? 'bg-zinc-800/30 border-zinc-700/50' : 'bg-white/80 border-zinc-300 shadow-sm'
          }`}>
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-yellow-50'}`}>
              <CheckCircle2 className={`w-10 h-10 ${isDark ? 'text-yellow-500/50' : 'text-yellow-600/50'}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>All Caught Up!</h3>
            <p className={isDark ? 'text-gray-400' : 'text-zinc-500'}>No questions pending settlement</p>
          </div>
        ) : (
          <div className="space-y-8">
            {endedQuestions.map((question) => (
              <div
                key={question._id}
                className={`glass-card rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  isDark
                    ? 'border-yellow-500/30 hover:border-yellow-500/50'
                    : 'border-yellow-200 hover:border-yellow-300 bg-white/95 shadow-lg shadow-yellow-900/5'
                }`}
              >
                <div className={`px-8 py-4 border-b ${
                  isDark
                    ? 'bg-gradient-to-r from-yellow-900/20 to-transparent border-yellow-500/20'
                    : 'bg-gradient-to-r from-yellow-50/80 to-white border-yellow-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                        <Clock className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`} />
                      </div>
                      <span className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                        Ended {getTimeEnded(question.deadline)}
                      </span>
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border ${
                      isDark
                        ? 'text-yellow-300 bg-yellow-900/30 border-yellow-500/30'
                        : 'text-yellow-800 bg-yellow-50 border-yellow-200'
                    }`}>
                      {question.category}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {question.title}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className={`rounded-2xl p-6 border transition-all ${
                      isDark
                        ? 'bg-yellow-900/10 border-yellow-500/30 hover:bg-yellow-900/20'
                        : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100/50'
                    }`}>
                      <div className={`text-sm font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-yellow-500' : 'text-yellow-800'}`}>YES Pool</div>
                      <div className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {question.pool_stats?.[0]?.yes_participants || 0} <span className="text-base font-medium opacity-60">participants</span>
                      </div>
                      <div className={`text-sm font-mono font-medium ${isDark ? 'text-yellow-200' : 'text-yellow-900'}`}>
                        {parseFloat(question.pool_stats?.[0]?.yes_ftr_total || 0).toFixed(2)} FTR + {parseFloat(question.pool_stats?.[0]?.yes_usdt_total || 0).toFixed(2)} USDT
                      </div>
                    </div>

                    <div className={`rounded-2xl p-6 border transition-all ${
                      isDark
                        ? 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}>
                      <div className={`text-sm font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-zinc-500'}`}>NO Pool</div>
                      <div className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {question.pool_stats?.[0]?.no_participants || 0} <span className="text-base font-medium opacity-60">participants</span>
                      </div>
                      <div className={`text-sm font-mono font-medium ${isDark ? 'text-gray-400' : 'text-zinc-600'}`}>
                        {parseFloat(question.pool_stats?.[0]?.no_ftr_total || 0).toFixed(2)} FTR + {parseFloat(question.pool_stats?.[0]?.no_usdt_total || 0).toFixed(2)} USDT
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-2xl p-6 mb-8 border ${
                    isDark ? 'bg-zinc-900/50 border-zinc-700' : 'bg-gray-50/80 border-gray-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <Shield className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-zinc-500'}`} />
                        <span className={`font-bold ${isDark ? 'text-gray-300' : 'text-zinc-700'}`}>Determine Outcome:</span>
                      </div>
                      <div className="flex items-center p-1.5 rounded-xl bg-gray-200/50 dark:bg-zinc-800">
                        <button
                          onClick={() => setSelectedResult({ ...selectedResult, [question._id]: 'yes' })}
                          className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
                            selectedResult[question._id] === 'yes'
                              ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg shadow-yellow-500/20'
                              : isDark
                                ? 'text-gray-400 hover:text-white hover:bg-zinc-700'
                                : 'text-zinc-500 hover:text-zinc-900 hover:bg-white'
                          }`}
                        >
                          YES WINS
                        </button>
                        <button
                          onClick={() => setSelectedResult({ ...selectedResult, [question._id]: 'no' })}
                          className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
                            selectedResult[question._id] === 'no'
                              ? 'bg-zinc-600 text-white shadow-lg'
                              : isDark
                                ? 'text-gray-400 hover:text-white hover:bg-zinc-700'
                                : 'text-zinc-500 hover:text-zinc-900 hover:bg-white'
                          }`}
                        >
                          NO WINS
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSettle(question._id, selectedResult[question._id])}
                    disabled={!selectedResult[question._id] || settling[question._id]}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-5 rounded-xl font-black text-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-xl hover:shadow-yellow-500/20 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none flex items-center justify-center space-x-3 group"
                  >
                    {settling[question._id] ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing Settlement...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span>Settle Market & Distribute</span>
                      </>
                    )}
                  </button>

                  <p className={`text-xs text-center mt-4 font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Action is irreversible. Rewards are distributed immediately via smart contract.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
