import { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function BettingQuestionCard({
  question,
  onPlaceBet,
  walletConnected,
  isLoading = false,
}) {
  const { isDark } = useTheme();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const totalParticipants = question.yesPool.participants + question.noPool.participants;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const yesPercentage = totalParticipants > 0
    ? (question.yesPool.participants / totalParticipants) * 100
    : 50;
  const noPercentage = 100 - yesPercentage;

  const isQuestionEnded = () => {
    const end = new Date(question.endTime);
    return end.getTime() - currentTime <= 0;
  };

  const getTimeRemaining = () => {
    const end = new Date(question.endTime);
    const diff = end.getTime() - currentTime;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    if (minutes > 0) return `${minutes}m ${seconds}s left`;
    return `${seconds}s left`;
  };

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

  return (
    <div className={`group relative rounded-[2rem] p-[1px] transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(234,179,8,0.2)] hover:-translate-y-2 ${
      isDark ? 'bg-gradient-to-br from-zinc-700/50 to-zinc-800/50' : 'bg-gradient-to-br from-yellow-300/60 to-orange-300/60 shadow-lg shadow-yellow-900/5'
    }`}>
      <div className={`relative h-full rounded-[1.9rem] p-7 flex flex-col overflow-hidden ${
        isDark ? 'bg-zinc-900/90 backdrop-blur-xl' : 'bg-white/95 backdrop-blur-xl border border-white/50'
      }`}>
        {/* Decorative background glow */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-20 transition-opacity duration-500 group-hover:opacity-30 ${
          isDark ? 'bg-yellow-500' : 'bg-yellow-400'
        }`}></div>

        <div className="relative flex items-center justify-between mb-8">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black bg-gradient-to-r ${getCategoryColor(question.category)} text-white shadow-lg shadow-yellow-500/10 tracking-widest uppercase`}>
            {question.category}
          </span>
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border backdrop-blur-sm ${
            isDark 
              ? 'bg-zinc-800/50 text-yellow-500 border-zinc-700/50' 
              : 'bg-white text-yellow-700 border-yellow-200 shadow-sm font-medium'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-bold tracking-wide tabular-nums">{getTimeRemaining()}</span>
          </div>
        </div>

        <h3 className={`text-xl font-bold mb-8 leading-snug min-h-[3.5rem] line-clamp-2 transition-colors duration-300 ${
          isDark ? 'text-white group-hover:text-yellow-400' : 'text-zinc-900 group-hover:text-yellow-700'
        }`}>
          {question.question}
        </h3>

        <div className="mt-auto space-y-6">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold tracking-wide uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Pool Volume</span>
            <div className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800/50 px-2.5 py-1 rounded-lg">
              <Users className={`w-3.5 h-3.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`} />
              <span className={`font-black ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{totalParticipants}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className={`relative h-4 rounded-full overflow-hidden flex shadow-inner p-0.5 ${
              isDark ? 'bg-zinc-800' : 'bg-zinc-200'
            }`}>
              <div
                className="h-full rounded-l-full bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)] relative group/bar transition-all duration-1000 ease-out"
                style={{ width: `${yesPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover/bar:translate-x-[100%] transition-transform duration-1000"></div>
              </div>
              <div
                className="h-full rounded-r-full bg-zinc-500 shadow-[0_0_15px_rgba(113,113,122,0.3)] relative group/bar transition-all duration-1000 ease-out"
                style={{ width: `${noPercentage}%` }}
              >
                 <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover/bar:translate-x-[100%] transition-transform duration-1000"></div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-500 font-black text-xl drop-shadow-sm">{yesPercentage.toFixed(0)}%</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Yes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>No</span>
                <span className="text-zinc-500 font-black text-xl drop-shadow-sm">{noPercentage.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-dashed border-zinc-200 dark:border-zinc-700/50">
          {question.status === 'open' || question.status === 'active' ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onPlaceBet(question.id, 'yes')}
                disabled={!walletConnected || isLoading || isQuestionEnded()}
                className="group/btn relative overflow-hidden flex items-center justify-center space-x-2 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-4 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                <CheckCircle2 className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Yes</span>
              </button>
              <button
                onClick={() => onPlaceBet(question.id, 'no')}
                disabled={!walletConnected || isLoading || isQuestionEnded()}
                className="group/btn relative overflow-hidden flex items-center justify-center space-x-2 bg-zinc-600 text-white px-4 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-zinc-500/20 hover:bg-zinc-500 hover:shadow-zinc-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                <XCircle className="w-4 h-4 relative z-10" />
                <span className="relative z-10">No</span>
              </button>
            </div>
          ) : question.status === 'settled' && question.result ? (
            <div className={`flex items-center justify-center space-x-2 px-4 py-4 rounded-xl font-bold border ${
              question.result === 'yes'
                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
            }`}>
              {question.result === 'yes' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span>Settled: {question.result.toUpperCase()}</span>
            </div>
          ) : (
            <div className={`flex items-center justify-center px-4 py-4 rounded-xl font-bold border ${
              isDark
                ? 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50'
                : 'bg-zinc-100 text-zinc-600 border-zinc-300'
            }`}>
              <Clock className="w-5 h-5 mr-2" />
              <span>Awaiting Result</span>
            </div>
          )}
        </div>

        <div className={`mt-5 pt-5 border-t ${
          isDark ? 'border-zinc-700/30' : 'border-zinc-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Stake Amount</span>
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-full ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-100'}`}>
                <TrendingUp className="w-3 h-3 text-yellow-500" />
              </div>
              <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>1 FTR + 1 USDT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
