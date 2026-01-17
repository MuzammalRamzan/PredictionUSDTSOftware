import { Clock, Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

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
      'Crypto': 'from-cyan-500 to-blue-600',
      'Sports': 'from-orange-500 to-orange-600',
      'Politics': 'from-purple-500 to-purple-600',
      'Technology': 'from-cyan-500 to-cyan-600',
      'Finance': 'from-blue-500 to-blue-600',
    };
    return colors[category] || 'from-slate-500 to-slate-600';
  };

  return (
    <div className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
      <div className="p-7">
        <div className="flex items-center justify-between mb-5">
          <span className={`px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r ${getCategoryColor(question.category)} text-white shadow-lg`}>
            {question.category}
          </span>
          <div className="flex items-center space-x-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold">{getTimeRemaining()}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-6 leading-snug min-h-[4rem] group-hover:text-cyan-400 transition-colors">
          {question.question}
        </h3>

        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span className="font-semibold">Market sentiment</span>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="font-bold">{totalParticipants}</span>
            </div>
          </div>

          <div className="relative h-3 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 shadow-lg shadow-cyan-500/50"
              style={{ width: `${yesPercentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"></div>
              <span className="text-sm font-bold text-white">{yesPercentage.toFixed(0)}% Yes</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">{noPercentage.toFixed(0)}% No</span>
              <div className="w-3 h-3 rounded-full bg-slate-600"></div>
            </div>
          </div>
        </div>

        {question.status === 'open' || question.status === 'active' ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onPlaceBet(question.id, 'yes')}
              disabled={!walletConnected || isLoading || isQuestionEnded()}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-3.5 rounded-xl font-bold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/30 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Yes</span>
            </button>
            <button
              onClick={() => onPlaceBet(question.id, 'no')}
              disabled={!walletConnected || isLoading || isQuestionEnded()}
              className="flex items-center justify-center space-x-2 bg-slate-700 text-white px-5 py-3.5 rounded-xl font-bold hover:bg-slate-600 transition-all duration-300 disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              <XCircle className="w-5 h-5" />
              <span>No</span>
            </button>
          </div>
        ) : question.status === 'settled' && question.result ? (
          <div className={`flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl font-bold ${
            question.result === 'yes'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
              : 'bg-slate-700 text-white'
          }`}>
            {question.result === 'yes' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>Settled: {question.result.toUpperCase()}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center px-5 py-3.5 rounded-xl font-bold bg-slate-700/50 text-slate-300 border border-slate-600">
            <Clock className="w-5 h-5 mr-2" />
            <span>Awaiting Result</span>
          </div>
        )}
      </div>

      <div className="bg-slate-900/50 px-7 py-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold">Stake required</span>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-white">1 OCRO + 1 USDT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
