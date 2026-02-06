import { TrendingUp, Shield, Coins, Users, Sparkles, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function Hero({ stats }) {
  const { isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <div className={`relative pt-32 pb-24 overflow-hidden ${
      isDark
        ? 'bg-transparent'
        : 'bg-gradient-to-br from-yellow-50/80 via-white to-yellow-50/50'
    }`}>
      {/* Background Gradients */}
      <div className={`absolute top-20 left-10 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 animate-pulse ${
        isDark ? 'bg-yellow-600' : 'bg-yellow-400'
      }`}></div>
      <div className={`absolute bottom-20 right-10 w-[600px] h-[600px] rounded-full blur-[140px] opacity-15 animate-pulse delay-1000 ${
        isDark ? 'bg-yellow-600' : 'bg-yellow-400'
      }`}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <div className={`inline-flex items-center space-x-2 backdrop-blur-xl border px-6 py-2.5 rounded-full text-sm font-bold mb-10 shadow-lg hover:scale-105 transition-transform duration-300 ring-1 cursor-default ${
            isDark 
              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 ring-yellow-500/20'
              : 'bg-yellow-500/10 border-yellow-600/20 text-yellow-700 ring-yellow-600/20'
          }`}>
            <Shield className="w-4 h-4" />
            <span className="tracking-wide">{t('hero.poweredBy')}</span>
            <Sparkles className="w-4 h-4" />
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black mb-8 leading-[0.9] tracking-tighter">
            <span className={`inline-block ${isDark ? 'text-white' : 'text-zinc-900'} drop-shadow-sm`}>
              {t('hero.titleLine1')}
            </span>
            <span className={`block bg-gradient-to-r text-transparent bg-clip-text pb-4 ${
              isDark
                ? 'from-yellow-300 via-yellow-400 to-yellow-300 text-glow animate-text-shimmer bg-[length:200%_auto]'
                : 'from-yellow-600 via-yellow-700 to-yellow-600'
            }`}>
              {t('hero.titleLine2')}
            </span>
          </h1>

          <p className={`text-xl sm:text-2xl max-w-3xl mx-auto mb-14 leading-relaxed font-medium ${
            isDark ? 'text-zinc-200' : 'text-zinc-600'
          }`}>
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <a
              href="#active"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(234,179,8,0.6)] hover:shadow-[0_0_60px_-15px_rgba(234,179,8,0.8)] hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full duration-700 transition-transform -skew-x-12 -translate-x-full"></div>
              <TrendingUp className="w-6 h-6 relative z-10" />
              <span className="relative z-10">{t('hero.exploreMarkets')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            </a>
            <a
              href="#how"
              className={`w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 backdrop-blur-md border ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-yellow-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/5'
                  : 'bg-white/80 border-yellow-300/50 text-zinc-900 hover:bg-white hover:border-yellow-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-500/10'
      }`}
    >
      <span>{t('hero.learnMore')}</span>
    </a>
  </div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* USDT Volume */}
        <div className={`group relative p-8 rounded-3xl transition-all duration-500 hover:scale-[1.02] border backdrop-blur-xl ${
          isDark 
            ? 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800/60 hover:border-green-500/30' 
            : 'bg-white/60 border-white/80 hover:bg-white/80 hover:border-green-400/50 shadow-xl shadow-green-900/5'
        }`}>
     <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-green-500/10 via-transparent to-transparent' 
        : 'bg-gradient-to-br from-green-500/5 via-transparent to-transparent'
    }`}></div>
    <div className="relative">
      <div className="bg-gradient-to-br from-green-500 to-green-600 p-3.5 rounded-2xl mb-6 inline-block shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-500">
        <Coins className="w-7 h-7 text-white" />
      </div>
      <div className={`text-4xl font-black mb-2 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
        {stats.totalVolume.usdt.toLocaleString()}
      </div>
      <div className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-200' : 'text-zinc-600 group-hover:text-green-700'} transition-colors`}>{t('hero.usdtVolume')}</div>
    </div>
  </div>

  {/* Active Markets */}
  <div className={`group relative p-8 rounded-3xl transition-all duration-500 hover:scale-[1.02] border backdrop-blur-xl ${
    isDark 
      ? 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800/60 hover:border-blue-500/30' 
      : 'bg-white/60 border-white/80 hover:bg-white/80 hover:border-blue-400/50 shadow-xl shadow-blue-900/5'
  }`}>
     <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-blue-500/10 via-transparent to-transparent' 
        : 'bg-gradient-to-br from-blue-500/5 via-transparent to-transparent'
    }`}></div>
    <div className="relative">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3.5 rounded-2xl mb-6 inline-block shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
        <TrendingUp className="w-7 h-7 text-white" />
      </div>
      <div className={`text-4xl font-black mb-2 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
        {stats.activeQuestions}
      </div>
      <div className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-300' : 'text-zinc-600 group-hover:text-blue-700'} transition-colors`}>{t('hero.activeMarkets')}</div>
    </div>
  </div>

  {/* Participants */}
  <div className={`group relative p-8 rounded-3xl transition-all duration-500 hover:scale-[1.02] border backdrop-blur-xl ${
    isDark 
      ? 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800/60 hover:border-purple-500/30' 
      : 'bg-white/60 border-white/80 hover:bg-white/80 hover:border-purple-400/50 shadow-xl shadow-purple-900/5'
  }`}>
     <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-purple-500/10 via-transparent to-transparent' 
        : 'bg-gradient-to-br from-purple-500/5 via-transparent to-transparent'
    }`}></div>
    <div className="relative">
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3.5 rounded-2xl mb-6 inline-block shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-500">
        <Users className="w-7 h-7 text-white" />
      </div>
      <div className={`text-4xl font-black mb-2 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
        {stats.totalParticipants}
      </div>
      <div className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-300' : 'text-zinc-600 group-hover:text-purple-700'} transition-colors`}>{t('hero.participants')}</div>
    </div>
  </div>
        </div>
      </div>
    </div>
  );
}
