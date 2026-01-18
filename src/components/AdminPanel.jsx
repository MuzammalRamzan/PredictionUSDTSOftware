import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Shield } from 'lucide-react';
import { isAdminAddress } from '../config/admin';
import { useTheme } from '../contexts/ThemeContext';

export default function AdminPanel({ walletAddress, onSettleQuestion, isLoading }) {
  const { isDark } = useTheme();
  const [endedQuestions, setEndedQuestions] = useState([]);
  const [selectedResult, setSelectedResult] = useState({});

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
        setEndedQuestions(ended);
      }
    } catch (error) {
      console.error('Failed to load ended questions:', error);
    }
  };

  const handleSettle = async (questionId, result) => {
    await onSettleQuestion(questionId, result);
    await loadEndedQuestions();
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
    <section id="admin" className={`py-16 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Panel</h2>
          <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>Settle ended questions and distribute rewards</p>
        </div>

        {endedQuestions.length === 0 ? (
          <div className={`rounded-xl border-2 p-12 text-center ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <CheckCircle2 className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-cyan-400' : 'text-blue-900'}`} />
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>All Caught Up!</h3>
            <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>No questions waiting to be settled</p>
          </div>
        ) : (
          <div className="space-y-6">
            {endedQuestions.map((question) => (
              <div
                key={question._id}
                className={`rounded-xl border-2 overflow-hidden ${
                  isDark
                    ? 'bg-slate-800 border-orange-700/50'
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
                        ? 'bg-blue-900/30 border border-blue-700/50'
                        : 'bg-blue-50'
                    }`}>
                      <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>YES Pool</div>
                      <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-blue-200' : 'text-blue-900'}`}>
                        {question.pool_stats?.[0]?.yes_participants || 0} participants
                      </div>
                      <div className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                        {parseFloat(question.pool_stats?.[0]?.yes_ocro_total || 0).toFixed(2)} FTR + {parseFloat(question.pool_stats?.[0]?.yes_usdt_total || 0).toFixed(2)} USDT
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 ${
                      isDark
                        ? 'bg-slate-700 border border-slate-600'
                        : 'bg-gray-50'
                    }`}>
                      <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>NO Pool</div>
                      <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {question.pool_stats?.[0]?.no_participants || 0} participants
                      </div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {parseFloat(question.pool_stats?.[0]?.no_ocro_total || 0).toFixed(2)} FTR + {parseFloat(question.pool_stats?.[0]?.no_usdt_total || 0).toFixed(2)} USDT
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-lg mb-6 ${
                    isDark ? 'bg-slate-700' : 'bg-gray-50'
                  }`}>
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Select the correct outcome:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedResult({ ...selectedResult, [question._id]: 'yes' })}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          selectedResult[question._id] === 'yes'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                            : isDark
                              ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                              : 'bg-white text-gray-700 border border-gray-300 hover:border-cyan-500'
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
                              ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-700'
                        }`}
                      >
                        NO
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSettle(question._id, selectedResult[question._id])}
                    disabled={!selectedResult[question._id] || isLoading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Settle Question & Distribute Rewards</span>
                      </>
                    )}
                  </button>

                  <p className={`text-xs text-center mt-3 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
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
