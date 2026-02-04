import { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function BettingQuestionCard({
  question,
  onPlaceBet,
  walletConnected,
  isLoading = false,
}) {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Calculate total participants from all outcomes
  const totalParticipants = question.outcomeStats?.reduce((sum, stat) => sum + stat.participants, 0) || 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getPercentage = (index) => {
    if (totalParticipants === 0) return 0;
    const participants = question.outcomeStats?.[index]?.participants || 0;
    return (participants / totalParticipants) * 100;
  };

  const isQuestionEnded = () => {
    const end = new Date(question.endTime);
    return end.getTime() - currentTime <= 0;
  };

  const getTimeRemaining = () => {
    const end = new Date(question.endTime);
    const diff = end.getTime() - currentTime;

    if (diff <= 0) return t('bettingCard.ended');

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let timeString = '';
    if (days > 0) timeString = `${days}d ${hours}h`;
    else if (hours > 0) timeString = `${hours}h ${minutes}m`;
    else if (minutes > 0) timeString = `${minutes}m ${seconds}s`;
    else timeString = `${seconds}s`;

    return t('bettingCard.timeLeft', { time: timeString });
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
    <div className={`group relative rounded-2xl p-[1px] transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(234,179,8,0.2)] hover:-translate-y-2 ${
      isDark ? 'bg-gradient-to-br from-zinc-700/50 to-zinc-800/50' : 'bg-gradient-to-br from-yellow-300/60 to-orange-300/60 shadow-lg shadow-yellow-900/5'
    }`}>
      <div className={`relative h-full rounded-[0.9rem] p-6 flex flex-col overflow-hidden ${
        isDark ? 'bg-zinc-900/90 backdrop-blur-xl' : 'bg-white/95 backdrop-blur-xl border border-white/50'
      }`}>
        {/* Decorative background glow */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-20 transition-opacity duration-500 group-hover:opacity-30 ${
          isDark ? 'bg-yellow-500' : 'bg-yellow-400'
        }`}></div>

        <div className="relative flex items-center justify-between mb-6">
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

        <h3 className={`text-xl font-bold mb-6 leading-snug min-h-[3.5rem] line-clamp-2 transition-colors duration-300 ${
          isDark ? 'text-white group-hover:text-yellow-400' : 'text-zinc-900 group-hover:text-yellow-700'
        }`}>
          {question.question}
        </h3>

        <div className="mt-auto space-y-6">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold tracking-wide uppercase ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{t('bettingCard.poolVolume')}</span>
            <div className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800/50 px-2.5 py-1 rounded-lg">
              <Users className={`w-3.5 h-3.5 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`} />
              <span className={`font-black ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{totalParticipants}</span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Progress Bar */}
            <div className={`relative h-4 rounded-full overflow-hidden flex shadow-inner p-0.5 ${
              isDark ? 'bg-zinc-800' : 'bg-zinc-200'
            }`}>
              {question.outcomes?.map((outcome, index) => {
                const percentage = getPercentage(index);
                // Colors for up to 3 outcomes
                const colors = [
                    'from-yellow-500 to-yellow-400',
                    'from-zinc-500 to-zinc-400', 
                    'from-blue-500 to-blue-400'
                ];
                const colorClass = colors[index % colors.length];
                
                if (percentage === 0) return null;

                return (
                  <div
                    key={index}
                    className={`h-full ${index === 0 ? 'rounded-l-full' : ''} ${index === question.outcomes.length - 1 ? 'rounded-r-full' : ''} bg-gradient-to-r ${colorClass} relative group/bar transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                  >
                     <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover/bar:translate-x-[100%] transition-transform duration-1000"></div>
                  </div>
                );
              })}
            </div>

            {/* Percentages and Labels */}
            <div className="flex items-center justify-between px-1 text-xs">
                {question.outcomes?.map((outcome, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <span className={`font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{outcome}</span>
                        <span className={`font-black text-lg drop-shadow-sm ${index === 0 ? 'text-yellow-500' : (index === 1 ? 'text-zinc-500' : 'text-blue-500')}`}>
                            {getPercentage(index).toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-dashed border-zinc-200 dark:border-zinc-700/50">
          {question.status === 'open' || question.status === 'active' ? (
            <div className={`grid gap-4 ${question.outcomes?.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {question.outcomes?.map((outcome, index) => (
                  <button
                    key={index}
                    onClick={() => onPlaceBet(question.id, index, outcome)}
                    disabled={!walletConnected || isLoading || isQuestionEnded()}
                    className={`group/btn relative overflow-hidden flex flex-col items-center justify-center space-y-1 px-2 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none ${
                        index === 0 
                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-yellow-500/20 hover:shadow-yellow-500/40' 
                        : (index === 1 
                            ? 'bg-zinc-600 text-white shadow-zinc-500/20 hover:bg-zinc-500 hover:shadow-zinc-500/40'
                            : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-500 hover:shadow-blue-500/40')
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10 text-xs uppercase">{outcome}</span>
                  </button>
              ))}
            </div>
          ) : question.status === 'settled' && question.result !== null ? (
            <div className={`flex items-center justify-center space-x-2 px-4 py-4 rounded-xl font-bold border ${
              question.result === 0 // Assuming 0 is usually the "positive" outcome
                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {t('bettingCard.settledWithResult', { 
                  result: (question.outcomes?.[question.result] || 'UNKNOWN').toUpperCase() 
                })}
              </span>
            </div>
          ) : (
            <div className={`flex items-center justify-center px-4 py-4 rounded-xl font-bold border ${
              isDark
                ? 'bg-zinc-800/50 text-zinc-200 border-zinc-700/50'
                : 'bg-zinc-100 text-zinc-600 border-zinc-300'
            }`}>
              <Clock className="w-5 h-5 mr-2" />
              <span>{t('bettingCard.awaitingResult')}</span>
            </div>
          )}
        </div>

        <div className={`mt-5 pt-5 border-t ${
          isDark ? 'border-zinc-700/30' : 'border-zinc-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>{t('bettingCard.stakeAmount')}</span>
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-full ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-100'}`}>
                <TrendingUp className="w-3 h-3 text-yellow-500" />
              </div>
              <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>Flexible (Min 1 FTR/USDT)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
