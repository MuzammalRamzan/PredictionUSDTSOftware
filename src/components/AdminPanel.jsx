import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Shield } from 'lucide-react';
import { isAdminAddress } from '../config/admin';

export default function AdminPanel({ walletAddress, onSettleQuestion, isLoading }) {
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
    <section id="admin" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Admin Panel</h2>
          <p className="text-gray-600">Settle ended questions and distribute rewards</p>
        </div>

        {endedQuestions.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-blue-900 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No questions waiting to be settled</p>
          </div>
        ) : (
          <div className="space-y-6">
            {endedQuestions.map((question) => (
              <div
                key={question._id}
                className="bg-white rounded-xl border-2 border-orange-200 overflow-hidden"
              >
                <div className="bg-orange-50 px-6 py-3 border-b border-orange-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-orange-700" />
                      <span className="text-sm font-semibold text-orange-700">
                        Ended {getTimeEnded(question.deadline)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                      {question.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    {question.title}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm font-semibold text-blue-900 mb-2">YES Pool</div>
                      <div className="text-2xl font-bold text-blue-900 mb-1">
                        {question.pool_stats?.[0]?.yes_participants || 0} participants
                      </div>
                      <div className="text-sm text-blue-700">
                        {parseFloat(question.pool_stats?.[0]?.yes_ocro_total || 0).toFixed(2)} OCRO + {parseFloat(question.pool_stats?.[0]?.yes_usdt_total || 0).toFixed(2)} USDT
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">NO Pool</div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {question.pool_stats?.[0]?.no_participants || 0} participants
                      </div>
                      <div className="text-sm text-gray-600">
                        {parseFloat(question.pool_stats?.[0]?.no_ocro_total || 0).toFixed(2)} OCRO + {parseFloat(question.pool_stats?.[0]?.no_usdt_total || 0).toFixed(2)} USDT
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                    <span className="text-sm font-medium text-gray-700">Select the correct outcome:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedResult({ ...selectedResult, [question._id]: 'yes' })}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          selectedResult[question._id] === 'yes'
                            ? 'bg-blue-900 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-900'
                        }`}
                      >
                        YES
                      </button>
                      <button
                        onClick={() => setSelectedResult({ ...selectedResult, [question._id]: 'no' })}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          selectedResult[question._id] === 'no'
                            ? 'bg-gray-700 text-white'
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
                    className="w-full bg-blue-900 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-950 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

                  <p className="text-xs text-gray-500 text-center mt-3">
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
