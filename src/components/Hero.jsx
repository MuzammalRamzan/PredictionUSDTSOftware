import { TrendingUp, Shield, Coins, Users, Sparkles, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Hero({ stats }) {
  const { isDark } = useTheme();

  return (
    <div className={`relative pt-32 pb-24 overflow-hidden ${
      isDark
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-white via-gray-50 to-white'
    }`}>
      <div className={`absolute inset-0 ${
        isDark
          ? 'bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)]'
          : 'bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.08),transparent_50%)]'
      }`}></div>
      <div className={`absolute inset-0 ${
        isDark
          ? 'bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]'
          : 'bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)]'
      }`}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold mb-8 shadow-lg">
            <Shield className="w-4 h-4" />
            <span>Powered by Binance Smart Chain</span>
            <Sparkles className="w-4 h-4" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight">
            <span className={isDark ? 'text-white' : 'text-gray-900'}>World Cup 2026</span>
            <span className={`block bg-gradient-to-r text-transparent bg-clip-text ${
              isDark
                ? 'from-cyan-400 via-blue-500 to-cyan-400'
                : 'from-cyan-600 via-blue-600 to-cyan-600'
            }`}>
              Prediction Pools
            </span>
          </h1>

          <p className={`text-xl sm:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-gray-700'
          }`}>
            Stake OCRO and USDT on World Cup matches. Transparent, trustless settlements powered by smart contracts.
          </p>

          <div className="flex flex-wrap justify-center gap-5">
            <a
              href="#active"
              className="group inline-flex items-center space-x-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <TrendingUp className="w-6 h-6" />
              <span>Explore Markets</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#how"
              className={`inline-flex items-center space-x-3 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
                isDark
                  ? 'bg-slate-800/80 backdrop-blur-xl border-2 border-slate-700 text-white hover:bg-slate-700/80 hover:border-cyan-400/50'
                  : 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-cyan-500'
              }`}
            >
              <span>Learn More</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className={`group rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
            isDark
              ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20'
              : 'bg-white border-gray-200 hover:border-cyan-500 hover:shadow-xl'
          }`}>
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-xl mb-4 inline-block shadow-md">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalVolume.ocro.toLocaleString()}
            </div>
            <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>OCRO Volume</div>
          </div>

          <div className={`group rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
            isDark
              ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20'
              : 'bg-white border-gray-200 hover:border-cyan-500 hover:shadow-xl'
          }`}>
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-xl mb-4 inline-block shadow-md">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalVolume.usdt.toLocaleString()}
            </div>
            <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>USDT Volume</div>
          </div>

          <div className={`group rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
            isDark
              ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20'
              : 'bg-white border-gray-200 hover:border-cyan-500 hover:shadow-xl'
          }`}>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl mb-4 inline-block shadow-md">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.activeQuestions}
            </div>
            <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Active Markets</div>
          </div>

          <div className={`group rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
            isDark
              ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20'
              : 'bg-white border-gray-200 hover:border-cyan-500 hover:shadow-xl'
          }`}>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl mb-4 inline-block shadow-md">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalParticipants.toLocaleString()}
            </div>
            <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Participants</div>
          </div>
        </div>
      </div>
    </div>
  );
}
