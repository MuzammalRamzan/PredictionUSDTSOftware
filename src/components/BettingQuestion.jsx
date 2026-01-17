import { Clock, Users, CheckCircle2, XCircle } from 'lucide-react';

export default function BettingQuestionCard({
  question,
  onPlaceBet,
  walletConnected,
  isLoading = false,
}) {
  const totalParticipants = question.yesPool.participants + question.noPool.participants;

  const yesPercentage = totalParticipants > 0
    ? (question.yesPool.participants / totalParticipants) * 100
    : 50;
  const noPercentage = 100 - yesPercentage;

  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(question.endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Crypto': 'bg-blue-50 text-blue-700 border-blue-200',
      'Sports': 'bg-orange-50 text-orange-700 border-orange-100',
      'Politics': 'bg-purple-50 text-purple-700 border-purple-100',
      'Technology': 'bg-cyan-50 text-cyan-700 border-cyan-100',
      'Finance': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    };
    return colors[category] || 'bg-gray-50 text-gray-700 border-gray-100';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-900 hover:shadow-lg transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${getCategoryColor(question.category)}`}>
            {question.category}
          </span>
          <div className="flex items-center space-x-1.5 text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{getTimeRemaining()}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-6 leading-snug min-h-[3.5rem]">
          {question.question}
        </h3>

        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Market sentiment</span>
            <div className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>{totalParticipants}</span>
            </div>
          </div>

          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-800 to-blue-900 transition-all duration-500"
              style={{ width: `${yesPercentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-800"></div>
              <span className="text-xs font-semibold text-gray-700">{yesPercentage.toFixed(0)}% Yes</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-gray-700">{noPercentage.toFixed(0)}% No</span>
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            </div>
          </div>
        </div>

        {question.status === 'open' || question.status === 'active' ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onPlaceBet(question.id, 'yes')}
              disabled={!walletConnected || isLoading}
              className="flex items-center justify-center space-x-2 bg-blue-900 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-950 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Yes</span>
            </button>
            <button
              onClick={() => onPlaceBet(question.id, 'no')}
              disabled={!walletConnected || isLoading}
              className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4" />
              <span>No</span>
            </button>
          </div>
        ) : question.status === 'settled' && question.result ? (
          <div className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold ${
            question.result === 'yes'
              ? 'bg-blue-50 text-blue-900 border border-blue-200'
              : 'bg-gray-100 text-gray-700 border border-gray-300'
          }`}>
            {question.result === 'yes' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>Settled: {question.result.toUpperCase()}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center px-4 py-3 rounded-lg font-semibold bg-gray-50 text-gray-600 border border-gray-200">
            <Clock className="w-5 h-5 mr-2" />
            <span>Awaiting Result</span>
          </div>
        )}
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Stake required</span>
          <span className="text-sm font-bold text-gray-900">1 OCRO + 1 USDT</span>
        </div>
      </div>
    </div>
  );
}
