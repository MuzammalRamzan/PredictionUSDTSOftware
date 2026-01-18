import { Clock, Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function BettingQuestionCard({
  question,
  onPlaceBet,
  walletConnected,
  isLoading = false,
}) {
  const { isDark } = useTheme();
  const totalParticipants = question.yesPool.participants + question.noPool.participants;

  const yesPercentage = totalParticipants > 0
    ? (question.yesPool.participants / totalParticipants) * 100
    : 50;
  const noPercentage = 100 - yesPercentage;

  const isQuestionEnded = () => {
    const now = new Date();
    const end = new Date(question.endTime);
    return end.getTime() - now.getTime() <= 0;
  };

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
      'Crypto': 'from-red-600 to-red-700',
      'Sports': 'from-orange-500 to-orange-600',
      'Politics': 'from-pink-500 to-pink-600',
      'Technology': 'from-red-500 to-red-600',
      'Finance': 'from-red-700 to-red-800',
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className={`group rounded-xl border-2 overflow-hidden hover:border-red-500 hover:shadow-xl transition-all duration-300 ${
      isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-red-100'
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r ${getCategoryColor(question.category)} text-white shadow-md`}>
            {question.category}
          </span>
          <div className={`flex items-center space-x-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold">{getTimeRemaining()}</span>
          </div>
        </div>

        <h3 className={`text-lg font-bold mb-5 leading-snug min-h-[3.5rem] group-hover:text-red-400 transition-colors ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {question.question}
        </h3>

        <div className="mb-5">
          <div className={`flex items-center justify-between text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className="font-semibold">Market sentiment</span>
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5" />
              <span className="font-bold">{totalParticipants}</span>
            </div>
          </div>

          <div className={`relative h-2.5 rounded-full overflow-hidden border ${
            isDark ? 'bg-zinc-700 border-zinc-600' : 'bg-red-50 border-red-100'
          }`}>
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-700 transition-all duration-500"
              style={{ width: `${yesPercentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700"></div>
              <span className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{yesPercentage.toFixed(0)}% Yes</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{noPercentage.toFixed(0)}% No</span>
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
            </div>
          </div>
        </div>

        {question.status === 'open' || question.status === 'active' ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onPlaceBet(question.id, 'yes')}
              disabled={!walletConnected || isLoading || isQuestionEnded()}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg font-bold hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-md disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Yes</span>
            </button>
            <button
              onClick={() => onPlaceBet(question.id, 'no')}
              disabled={!walletConnected || isLoading || isQuestionEnded()}
              className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-gray-700 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4" />
              <span>No</span>
            </button>
          </div>
        ) : question.status === 'settled' && question.result ? (
          <div className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-bold ${
            question.result === 'yes'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
              : 'bg-gray-600 text-white'
          }`}>
            {question.result === 'yes' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>Settled: {question.result.toUpperCase()}</span>
          </div>
        ) : (
          <div className={`flex items-center justify-center px-4 py-3 rounded-lg font-bold border ${
            isDark
              ? 'bg-zinc-700 text-gray-300 border-zinc-600'
              : 'bg-red-50 text-gray-600 border-red-100'
          }`}>
            <Clock className="w-5 h-5 mr-2" />
            <span>Awaiting Result</span>
          </div>
        )}
      </div>

      <div className={`px-6 py-3 border-t ${
        isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-red-50 border-red-100'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Stake required</span>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>1 FTR + 1 USDT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
