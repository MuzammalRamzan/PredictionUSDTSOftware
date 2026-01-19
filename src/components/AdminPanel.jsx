import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Shield, Plus, Calendar, Tag, FileText } from 'lucide-react';
import { isAdminAddress } from '../config/admin';
import { useTheme } from '../contexts/ThemeContext';
import { web3Service } from '../services/web3';

export default function AdminPanel({ walletAddress, isLoading }) {
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
      const response = await fetch('http://localhost:3001/api/questions');
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
              await fetch(`http://localhost:3001/api/questions/sync/${question.contract_question_id}`, {
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
      const response = await fetch('http://localhost:3001/api/questions');
      const data = await response.json();

      if (data.success) {
        let syncedCount = 0;
        let errorCount = 0;

        for (const question of data.data) {
          if (question.contract_question_id !== undefined) {
            try {
              const syncResponse = await fetch(`http://localhost:3001/api/questions/sync/${question.contract_question_id}`, {
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

        alert(`Sync complete! ${syncedCount} questions synced successfully.${errorCount > 0 ? ` ${errorCount} failed.` : ''}`);
        await loadEndedQuestions();
      }
    } catch (error) {
      console.error('Failed to sync questions:', error);
      alert('Failed to sync questions: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleSettle = async (questionId, result) => {
    setSettling({ ...settling, [questionId]: true });

    try {
      const question = endedQuestions.find(q => q._id === questionId);
      if (!question) {
        alert('Question not found');
        return;
      }

      const blockchainQuestion = await web3Service.getQuestion(question.contract_question_id);

      if (blockchainQuestion.isSettled) {
        alert('This question is already settled on the blockchain. Syncing database...');

        const response = await fetch(`http://localhost:3001/api/questions/sync/${question.contract_question_id}`, {
          method: 'POST'
        });

        if (response.ok) {
          const data = await response.json();
          alert(`Database synced! Question settled as: ${data.data?.result || 'unknown'}`);
          await loadEndedQuestions();
        } else {
          alert('Failed to sync database. Please try again.');
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
          alert('Question was already settled on blockchain. Syncing database...');

          const syncResponse = await fetch(`http://localhost:3001/api/questions/sync/${question.contract_question_id}`, {
            method: 'POST'
          });

          if (syncResponse.ok) {
            const data = await syncResponse.json();
            alert(`Database synced! Question settled as: ${data.data?.result || 'unknown'}`);
            await loadEndedQuestions();
          } else {
            alert('Failed to sync database. Please try again.');
          }
          return;
        }

        throw blockchainError;
      }

      const response = await fetch(`http://localhost:3001/api/questions/${questionId}/settle`, {
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
        alert('Question settled successfully!');
        await loadEndedQuestions();
      } else {
        console.error('Database update failed:', data);
        if (blockchainSucceeded) {
          console.log('Blockchain succeeded, attempting to sync. Error was:', data.error);
          alert(`Blockchain transaction succeeded but database update failed: ${data.error}\nSyncing now...`);

          const syncResponse = await fetch(`http://localhost:3001/api/questions/sync/${question.contract_question_id}`, {
            method: 'POST'
          });

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            console.log('Sync successful:', syncData);
            alert('Database synced successfully!');
            await loadEndedQuestions();
          } else {
            const syncError = await syncResponse.json();
            console.error('Sync failed:', syncError);
            alert(`Warning: Question is settled on blockchain but database sync failed: ${syncError.error || 'Unknown error'}`);
          }
        } else {
          alert('Failed to settle question: ' + (data.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Failed to settle question:', error);
      alert('Failed to settle question: ' + (error.message || 'Unknown error'));
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

      const response = await fetch('http://localhost:3001/api/questions', {
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
      }
    } catch (error) {
      console.error('Failed to create question:', error);
      setCreateMessage('Failed to create question: ' + (error.message || 'Unknown error'));
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
    <section id="admin" className={`py-16 ${isDark ? 'bg-transparent' : 'bg-gradient-to-b from-white to-red-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Shield className="w-8 h-8 text-red-500" />
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Panel</h2>
          </div>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Create questions and settle ended markets</p>
        </div>

        {createMessage && (
          <div className={`mb-6 rounded-lg p-4 ${
            createMessage.includes('successfully')
              ? isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
              : isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-medium ${
              createMessage.includes('successfully')
                ? isDark ? 'text-green-300' : 'text-green-700'
                : isDark ? 'text-red-300' : 'text-red-700'
            }`}>{createMessage}</p>
          </div>
        )}

        <div className="mb-8 flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-bold hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>{showCreateForm ? 'Cancel' : 'Create New Question'}</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg ${
              syncing
                ? 'bg-gray-400 cursor-not-allowed'
                : isDark
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500'
            } text-white`}
          >
            <CheckCircle2 className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync All Questions'}</span>
          </button>
        </div>

        {showCreateForm && (
          <div className={`rounded-xl border-2 p-6 mb-8 ${
            isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-red-100'
          }`}>
            <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create New Question</h3>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4" />
                    <span>Question Title *</span>
                  </div>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Will Argentina win the World Cup 2026?"
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-gray-500'
                      : 'bg-white border-red-200 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any additional details..."
                  rows="3"
                  className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-gray-500'
                      : 'bg-white border-red-200 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Tag className="w-4 h-4" />
                      <span>Category *</span>
                    </div>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-white'
                        : 'bg-white border-red-200 text-gray-900'
                    }`}
                  >
                    <option value="Sports">Sports</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Politics">Politics</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline *</span>
                    </div>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                    className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-white'
                        : 'bg-white border-red-200 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-bold hover:from-red-500 hover:to-red-600 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Question'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className={`px-6 py-4 rounded-xl font-bold transition-all ${
                    isDark
                      ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Settle Questions</h3>

        {endedQuestions.length === 0 ? (
          <div className={`rounded-xl border-2 p-12 text-center ${
            isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-red-100'
          }`}>
            <CheckCircle2 className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>All Caught Up!</h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No questions waiting to be settled</p>
          </div>
        ) : (
          <div className="space-y-6">
            {endedQuestions.map((question) => (
              <div
                key={question._id}
                className={`rounded-xl border-2 overflow-hidden ${
                  isDark
                    ? 'bg-zinc-800 border-orange-700/50'
                    : 'bg-white border-orange-200'
                }`}
              >
                <div className={`px-6 py-3 border-b ${
                  isDark
                    ? 'bg-orange-900/30 border-orange-700/50'
                    : 'bg-orange-50 border-orange-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-700'}`} />
                      <span className={`text-sm font-semibold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                        Ended {getTimeEnded(question.deadline)}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      isDark
                        ? 'text-orange-300 bg-orange-900/50'
                        : 'text-orange-600 bg-orange-100'
                    }`}>
                      {question.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {question.title}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className={`rounded-lg p-4 ${
                      isDark
                        ? 'bg-red-900/30 border border-red-700/50'
                        : 'bg-red-50'
                    }`}>
                      <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-red-300' : 'text-red-900'}`}>YES Pool</div>
                      <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-red-200' : 'text-red-900'}`}>
                        {question.pool_stats?.[0]?.yes_participants || 0} participants
                      </div>
                      <div className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                        {parseFloat(question.pool_stats?.[0]?.yes_ocro_total || 0).toFixed(2)} FTR + {parseFloat(question.pool_stats?.[0]?.yes_usdt_total || 0).toFixed(2)} USDT
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 ${
                      isDark
                        ? 'bg-zinc-700 border border-zinc-600'
                        : 'bg-gray-50'
                    }`}>
                      <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>NO Pool</div>
                      <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {question.pool_stats?.[0]?.no_participants || 0} participants
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {parseFloat(question.pool_stats?.[0]?.no_ocro_total || 0).toFixed(2)} FTR + {parseFloat(question.pool_stats?.[0]?.no_usdt_total || 0).toFixed(2)} USDT
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-lg mb-6 ${
                    isDark ? 'bg-zinc-700' : 'bg-red-50'
                  }`}>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Select the correct outcome:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedResult({ ...selectedResult, [question._id]: 'yes' })}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          selectedResult[question._id] === 'yes'
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                            : isDark
                              ? 'bg-zinc-600 text-gray-300 hover:bg-zinc-500'
                              : 'bg-white text-gray-700 border border-red-200 hover:border-red-500'
                        }`}
                      >
                        YES
                      </button>
                      <button
                        onClick={() => setSelectedResult({ ...selectedResult, [question._id]: 'no' })}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          selectedResult[question._id] === 'no'
                            ? 'bg-gray-700 text-white'
                            : isDark
                              ? 'bg-zinc-600 text-gray-300 hover:bg-zinc-500'
                              : 'bg-white text-gray-700 border border-red-200 hover:border-gray-700'
                        }`}
                      >
                        NO
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSettle(question._id, selectedResult[question._id])}
                    disabled={!selectedResult[question._id] || settling[question._id]}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-lg font-bold text-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {settling[question._id] ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Settle Question & Distribute Rewards</span>
                      </>
                    )}
                  </button>

                  <p className={`text-xs text-center mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    This will settle the question on-chain and allow winners to claim rewards
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
