import { TrendingUp, Shield, Coins, Users, Sparkles, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Hero({ stats }) {
  const { isDark } = useTheme();

  return (
    <div className={`relative pt-32 pb-24 overflow-hidden ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-zinc-900 to-gray-900'
        : 'bg-gradient-to-br from-red-50 via-white to-orange-50'
    }`}>
      <div className={`absolute inset-0 ${
        isDark
          ? 'bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.1),transparent_50%)]'
          : 'bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.08),transparent_50%)]'
      }`}></div>
      <div className={`absolute inset-0 ${
        isDark
          ? 'bg-[radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.1),transparent_50%)]'
          : 'bg-[radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.08),transparent_50%)]'
      }`}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-2.5 rounded-full text-sm font-bold mb-8 shadow-lg">
            <Shield className="w-4 h-4" />
            <span>Powered by Binance Smart Chain</span>
            <Sparkles className="w-4 h-4" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight">
            <span className={isDark ? 'text-white' : 'text-gray-900'}>World Cup 2026</span>
            <span className={`block bg-gradient-to-r text-transparent bg-clip-text ${
              isDark
                ? 'from-red-500 via-red-600 to-red-500'
                : 'from-red-600 via-red-700 to-red-600'
            }`}>
              Prediction Pools
            </span>
          </h1>

          <p className={`text-xl sm:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Stake FTR and USDT on World Cup matches. Transparent, trustless settlements powered by smart contracts.
          </p>

          <div className="flex flex-wrap justify-center gap-5">
            <a
              href="#active"
              className="group inline-flex items-center space-x-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <TrendingUp className="w-6 h-6" />
              <span>Explore Markets</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#how"
              className={`inline-flex items-center space-x-3 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
                isDark
                  ? 'bg-zinc-800/80 backdrop-blur-xl border-2 border-zinc-700 text-white hover:bg-zinc-700/80 hover:border-red-400/50'
                  : 'bg-white border-2 border-red-200 text-gray-900 hover:bg-red-50 hover:border-red-500'
              }`}
            >
              <span>Learn More</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className={`group rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
            isDark
              ? 'bg-zinc-800/50 backdrop-blur-xl border-zinc-700 hover:border-red-400/50 hover:shadow-2xl hover:shadow-red-500/20'
              : 'bg-white border-red-100 hover:border-red-500 hover:shadow-xl hover:shadow-red-500/10'
          }`}>
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-4 rounded-xl mb-4 inline-block shadow-md">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalVolume.ocro.toLocaleString()}
            </div>
            <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>FTR Volume</div>
          </div>

          <div className={`group rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
            isDark
              ? 'bg-zinc-800/50 backdrop-blur-xl border-zinc-700 hover:border-red-400/50 hover:shadow-2xl hover:shadow-red-500/20'
              : 'bg-white border-red-100 hover:border-red-500 hover:shadow-xl hover:shadow-red-500/10'
          }`}>
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-4 rounded-xl mb-4 inline-block shadow-md">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalVolume.usdt.toLocaleString()}
            </div>
            <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>USDT Volume</div>
          </div>

          <div className={`group rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
            isDark
              ? 'bg-zinc-800/50 backdrop-blur-xl border-zinc-700 hover:border-red-400/50 hover:shadow-2xl hover:shadow-red-500/20'
              : 'bg-white border-red-100 hover:border-red-500 hover:shadow-xl hover:shadow-red-500/10'
          }`}>
            <div className="bg-gradient-to-br from-red-700 to-red-800 p-4 rounded-xl mb-4 inline-block shadow-md">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.activeQuestions}
            </div>
            <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Markets</div>
          </div>

          <div className={`group rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
            isDark
              ? 'bg-zinc-800/50 backdrop-blur-xl border-zinc-700 hover:border-red-400/50 hover:shadow-2xl hover:shadow-red-500/20'
              : 'bg-white border-red-100 hover:border-red-500 hover:shadow-xl hover:shadow-red-500/10'
          }`}>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl mb-4 inline-block shadow-md">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalParticipants.toLocaleString()}
            </div>
            <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Participants</div>
          </div>
        </div>
      </div>
    </div>
  );
}
