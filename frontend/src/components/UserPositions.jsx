import { useState } from 'react';
import { TrendingUp, Clock, Trophy, CheckCircle2, XCircle, Wallet, ChevronLeft, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function UserPositions({ positions, walletConnected, onWithdraw, isLoading = false, onConnectWallet }) {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [activePositionsPage, setActivePositionsPage] = useState(0);
  const [settledPositionsPage, setSettledPositionsPage] = useState(0);

  if (!walletConnected) {
    return (
      <section id="positions" className="py-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className={`absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none ${isDark ? 'opacity-30' : 'opacity-40'}`}>
        <div className={`absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] mix-blend-screen animate-pulse ${
          isDark ? 'bg-yellow-900/20' : 'bg-yellow-200/40'
        }`}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-black mb-4 tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('positions.title')}</h2>
          <p className={`text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-600'}`}>{t('positions.connectToView')}</p>
        </div>
        <div className="flex justify-center">
          <div className={`glass-card rounded-3xl p-16 max-w-lg w-full text-center border relative overflow-hidden ${
            isDark ? 'bg-zinc-800/30 border-zinc-700/50' : 'bg-white/80 border-yellow-300/50 shadow-xl shadow-yellow-900/5'
          }`}>
            <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none ${isDark ? 'opacity-20' : 'opacity-50'}`}></div>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-yellow-500/10 relative z-10 ${
              isDark ? 'bg-zinc-800 border border-zinc-700' : 'bg-gradient-to-br from-yellow-50 to-white border border-yellow-200'
            }`}>
              <Wallet className={`w-10 h-10 ${isDark ? 'text-gray-300' : 'text-yellow-600'}`} />
            </div>
            <h3 className={`text-2xl font-black mb-3 tracking-tight relative z-10 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t('positions.connectTitle')}</h3>
            <p className={`text-base font-medium relative z-10 ${isDark ? 'text-gray-200' : 'text-zinc-600'} mb-8`}>{t('positions.connectSubtitle')}</p>
            <button
              onClick={onConnectWallet}
              disabled={isLoading}
              className="relative z-10 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white font-black tracking-wide py-4 px-10 rounded-2xl transition-all shadow-lg hover:shadow-yellow-500/30 hover:-translate-y-1 active:scale-95"
            >
              {t('header.connectWallet')}
            </button>
          </div>
        </div>
      </div>
    </section>
    );
  }

  const activePositions = positions.filter(p => p.status === 'active');
  const settledPositions = positions.filter(p => p.status !== 'active');
  const totalUsdtStaked = positions.reduce((acc, p) => acc + p.usdtStaked, 0);
  const totalWon = settledPositions.filter(p => p.status === 'won').length;

  return (
    <section id="positions" className="py-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className={`absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none ${isDark ? 'opacity-30' : 'opacity-40'}`}>
        <div className={`absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] mix-blend-screen animate-pulse ${
          isDark ? 'bg-yellow-900/20' : 'bg-yellow-200/40'
        }`}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className={`text-4xl font-black mb-4 tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t('positions.title')}</h2>
          <p className={`text-lg font-medium ${isDark ? 'text-gray-200' : 'text-zinc-600'}`}>{t('positions.subtitle')}</p>
        </div>

        {positions.length === 0 ? (
          <div className="flex justify-center">
            <div className={`glass-card rounded-3xl p-16 max-w-lg w-full text-center border relative overflow-hidden ${
              isDark ? 'bg-zinc-800/30 border-zinc-700/50' : 'bg-white/80 border-yellow-300/50 shadow-xl shadow-yellow-900/5'
            }`}>
              <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none ${isDark ? 'opacity-20' : 'opacity-50'}`}></div>
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-yellow-500/10 relative z-10 ${
                isDark ? 'bg-zinc-800 border border-zinc-700' : 'bg-gradient-to-br from-yellow-50 to-white border border-yellow-200'
              }`}>
                <TrendingUp className={`w-10 h-10 ${isDark ? 'text-gray-300' : 'text-yellow-600'}`} />
              </div>
              <h3 className={`text-2xl font-black mb-3 tracking-tight relative z-10 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t('positions.noPositionsTitle')}</h3>
              <p className={`text-base mb-8 font-medium relative z-10 ${isDark ? 'text-gray-200' : 'text-zinc-600'}`}>{t('positions.noPositionsSubtitle')}</p>
              <a
                href="#active"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-8 py-4 rounded-2xl font-black tracking-wide hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-yellow-500/30 hover:-translate-y-1 active:scale-95 relative z-10"
              >
                <span>{t('positions.browseMarkets')}</span>
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className={`glass-card rounded-3xl p-8 border hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group ${
                isDark
                  ? 'bg-gradient-to-br from-yellow-900/10 to-yellow-800/10 border-yellow-500/20'
                  : 'bg-gradient-to-br from-yellow-50/90 to-yellow-100/90 border-yellow-300/50 shadow-lg shadow-yellow-900/5'
              }`}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity duration-500 group-hover:opacity-70 ${isDark ? 'opacity-30' : 'opacity-50'}`}></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-yellow-500' : 'text-yellow-800'}`}>{t('positions.activePositionsCard')}</span>
                  <div className={`p-2 rounded-xl ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-200'}`}>
                    <Clock className={`w-6 h-6 ${isDark ? 'text-yellow-500' : 'text-yellow-800'}`} />
                  </div>
                </div>
                <p className={`text-4xl font-black tracking-tight relative z-10 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{activePositions.length}</p>
              </div>

              <div className={`glass-card rounded-3xl p-8 border hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group ${
                isDark
                  ? 'bg-gradient-to-br from-emerald-900/10 to-emerald-800/10 border-emerald-500/20'
                  : 'bg-gradient-to-br from-emerald-50/90 to-emerald-100/90 border-emerald-300/50 shadow-lg shadow-emerald-900/5'
              }`}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity duration-500 group-hover:opacity-70 ${isDark ? 'opacity-30' : 'opacity-50'}`}></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500' : 'text-emerald-800'}`}>{t('positions.wonCard')}</span>
                  <div className={`p-2 rounded-xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-200'}`}>
                    <Trophy className={`w-6 h-6 ${isDark ? 'text-emerald-500' : 'text-emerald-800'}`} />
                  </div>
                </div>
                <p className={`text-4xl font-black tracking-tight relative z-10 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{totalWon}</p>
              </div>

              <div className={`glass-card rounded-3xl p-8 border hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group ${
                isDark
                  ? 'bg-zinc-800/30 border-zinc-700/50 hover:border-yellow-500/30'
                  : 'bg-white/80 border-zinc-200 hover:border-yellow-300 shadow-lg shadow-zinc-900/5 hover:shadow-yellow-500/10'
              }`}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity duration-500 group-hover:opacity-100 opacity-0`}></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-zinc-200 group-hover:text-yellow-500/80' : 'text-zinc-600 group-hover:text-yellow-700'} transition-colors`}>{t('positions.totalStaked')}</span>
                  <div className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-zinc-800 group-hover:bg-yellow-500/10' : 'bg-zinc-100 group-hover:bg-yellow-50'}`}>
                    <TrendingUp className={`w-6 h-6 transition-colors ${isDark ? 'text-zinc-400 group-hover:text-yellow-500' : 'text-zinc-600 group-hover:text-yellow-600'}`} />
                  </div>
                </div>
                <p className={`text-4xl font-black tracking-tight relative z-10 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {totalUsdtStaked} <span className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-zinc-600'}`}>USDT</span>
                </p>
              </div>
            </div>

            <div className="space-y-12">
              {activePositions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-2xl font-black flex items-center space-x-3 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      <div className="w-1.5 h-8 bg-yellow-500 rounded-full"></div>
                      <span>{t('positions.activePositionsSection')}</span>
                      <span className="text-sm font-bold px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                        {activePositions.length}
                      </span>
                    </h3>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {activePositions.slice(activePositionsPage * 3, (activePositionsPage + 1) * 3).map((position) => (
                      <PositionCard key={position.questionId} position={position} onWithdraw={onWithdraw} isLoading={isLoading} />
                    ))}
                  </div>

                  {activePositions.length > 3 && (
                    <div className="flex items-center justify-center mt-8 space-x-4">
                      <button
                        onClick={() => setActivePositionsPage(p => Math.max(0, p - 1))}
                        disabled={activePositionsPage === 0}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all duration-200 ${
                          activePositionsPage === 0
                            ? isDark
                              ? 'bg-zinc-800/50 text-gray-600 cursor-not-allowed border border-zinc-800'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : isDark
                              ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 hover:border-yellow-600 shadow-lg hover:shadow-yellow-500/10 hover:-translate-y-1'
                              : 'bg-white text-zinc-900 hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-400 shadow-sm hover:shadow-md hover:-translate-y-1'
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span>{t('positions.previous')}</span>
                      </button>

                      <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-black text-lg ${
                        isDark ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-white text-zinc-900 border border-yellow-200'
                      }`}>
                        <span className="text-yellow-600">{activePositionsPage + 1}</span>
                        <span className="opacity-30">/</span>
                        <span>{Math.ceil(activePositions.length / 3)}</span>
                      </div>

                      <button
                        onClick={() => setActivePositionsPage(p => Math.min(Math.ceil(activePositions.length / 3) - 1, p + 1))}
                        disabled={activePositionsPage >= Math.ceil(activePositions.length / 3) - 1}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all duration-200 ${
                          activePositionsPage >= Math.ceil(activePositions.length / 3) - 1
                            ? isDark
                              ? 'bg-zinc-800/50 text-gray-600 cursor-not-allowed border border-zinc-800'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : isDark
                              ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 hover:border-yellow-600 shadow-lg hover:shadow-yellow-500/10 hover:-translate-y-1'
                              : 'bg-white text-zinc-900 hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-400 shadow-sm hover:shadow-md hover:-translate-y-1'
                        }`}
                      >
                        <span>{t('positions.next')}</span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {settledPositions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-2xl font-black flex items-center space-x-3 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      <div className={`w-1.5 h-8 rounded-full ${isDark ? 'bg-yellow-800' : 'bg-yellow-600/50'}`}></div>
                      <span>{t('positions.settledPositionsSection')}</span>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full border ${isDark ? 'bg-yellow-900/20 text-yellow-600 border-yellow-800/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                        {settledPositions.length}
                      </span>
                    </h3>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {settledPositions.slice(settledPositionsPage * 3, (settledPositionsPage + 1) * 3).map((position) => (
                      <PositionCard key={position.questionId} position={position} onWithdraw={onWithdraw} isLoading={isLoading} />
                    ))}
                  </div>

                  {settledPositions.length > 3 && (
                    <div className="flex items-center justify-center mt-8 space-x-4">
                      <button
                        onClick={() => setSettledPositionsPage(p => Math.max(0, p - 1))}
                        disabled={settledPositionsPage === 0}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all duration-200 ${
                          settledPositionsPage === 0
                            ? isDark
                              ? 'bg-zinc-800/50 text-gray-600 cursor-not-allowed border border-zinc-800'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : isDark
                              ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 hover:border-yellow-600 shadow-lg hover:shadow-yellow-500/10 hover:-translate-y-1'
                              : 'bg-white text-gray-900 hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-400 shadow-sm hover:shadow-md hover:-translate-y-1'
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span>{t('positions.previous')}</span>
                      </button>

                      <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-black text-lg ${
                        isDark ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-white text-gray-900 border border-yellow-200'
                      }`}>
                        <span className="text-yellow-600">{settledPositionsPage + 1}</span>
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>/</span>
                        <span>{Math.ceil(settledPositions.length / 3)}</span>
                      </div>

                      <button
                        onClick={() => setSettledPositionsPage(p => Math.min(Math.ceil(settledPositions.length / 3) - 1, p + 1))}
                        disabled={settledPositionsPage >= Math.ceil(settledPositions.length / 3) - 1}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all duration-200 ${
                          settledPositionsPage >= Math.ceil(settledPositions.length / 3) - 1
                            ? isDark
                              ? 'bg-zinc-800/50 text-gray-600 cursor-not-allowed border border-zinc-800'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : isDark
                              ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 hover:border-yellow-600 shadow-lg hover:shadow-yellow-500/10 hover:-translate-y-1'
                              : 'bg-white text-gray-900 hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-400 shadow-sm hover:shadow-md hover:-translate-y-1'
                        }`}
                      >
                        <span>{t('positions.next')}</span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function PositionCard({ position, onWithdraw, isLoading = false }) {
  const { isDark } = useTheme();
  const { t, i18n } = useTranslation();

  const getStatusInfo = () => {
    switch (position.status) {
      case 'active':
        return {
          badge: t('positions.activeBadge'),
          containerClass: isDark 
            ? 'glass-card border-yellow-500/30 hover:border-yellow-500/50 bg-gradient-to-br from-yellow-900/10 to-yellow-800/10' 
            : 'glass-card border-yellow-300/50 hover:border-yellow-400 bg-gradient-to-br from-yellow-50/80 to-yellow-100/80',
          statusBadge: isDark 
            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200',
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case 'cancelled':
        return {
          badge: t('positions.cancelled') || 'Cancelled',
          containerClass: isDark 
            ? 'glass-card border-red-500/50 hover:border-red-500/70 bg-gradient-to-br from-red-900/20 to-red-800/20' 
            : 'glass-card border-red-400/60 hover:border-red-500 bg-gradient-to-br from-red-100/90 to-red-200/90',
          statusBadge: isDark 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : 'bg-red-200 text-red-900 border border-red-300',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
      case 'won':
        return {
          badge: t('positions.wonBadge'),
          containerClass: isDark 
            ? 'glass-card border-emerald-500/30 hover:border-emerald-500/50 bg-gradient-to-br from-emerald-900/10 to-emerald-800/10' 
            : 'glass-card border-emerald-300/50 hover:border-emerald-400 bg-gradient-to-br from-emerald-50/80 to-emerald-100/80',
          statusBadge: isDark 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-emerald-100 text-emerald-800 border border-emerald-200',
          icon: <Trophy className="w-3.5 h-3.5" />,
        };
      case 'lost':
        return {
          badge: t('positions.lost'),
          containerClass: isDark 
            ? 'glass-card border-red-500/50 hover:border-red-500/70 bg-gradient-to-br from-red-900/20 to-red-800/20' 
            : 'glass-card border-red-400/60 hover:border-red-500 bg-gradient-to-br from-red-100/90 to-red-200/90',
          statusBadge: isDark 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : 'bg-red-200 text-red-900 border border-red-300',
          icon: <XCircle className="w-3.5 h-3.5" />,
        };
      default:
        return {
          badge: position.status,
          containerClass: isDark ? 'glass-card' : 'glass-card',
          statusBadge: '',
          icon: null
        };
    }
  };

  const statusInfo = getStatusInfo();
  
  // Dynamic color based on outcome index
  const getSideColor = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg shadow-yellow-500/20 ring-1 ring-yellow-500/50';
    if (index === 1) return 'bg-zinc-600 text-white shadow-lg shadow-zinc-500/20 ring-1 ring-zinc-500/50';
    return 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/50';
  };
  
  const sideColor = getSideColor(position.side);
  const outcomeName = position.outcomes?.[position.side] || `Option ${position.side + 1}`;

  return (
    <div className={`rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group ${statusInfo.containerClass}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black tracking-wide ${sideColor}`}>
             <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{outcomeName.toUpperCase()}</span>
          </span>
          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${statusInfo.statusBadge}`}>
            {statusInfo.icon}
            <span>{statusInfo.badge}</span>
          </span>
        </div>

        <h4 className={`text-lg font-bold mb-6 line-clamp-2 leading-snug min-h-[3.5rem] ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {position.question}
        </h4>

        <div className="space-y-4">
          <div className={`rounded-2xl p-4 transition-colors ${isDark ? 'bg-zinc-900/60 border border-zinc-700/50 group-hover:bg-zinc-900/80' : 'bg-white/90 border border-gray-200 group-hover:bg-white'}`}>
            <div className={`flex items-center justify-between text-xs mb-2 font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>{t('positions.totalStaked')}</span>
            </div>
            <div className={`flex items-baseline justify-between ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-black">{position.usdtStaked}</span>
                <span className={`text-xs font-extrabold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>USDT</span>
              </div>
            </div>
          </div>

          {position.payout && (
            <div className={`rounded-2xl p-4 border relative overflow-hidden ${
              isDark ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-200/50'
            }`}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl -mr-10 -mt-10 animate-pulse"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className={`font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{t('positions.payout')}</span>
                  <Trophy className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <div className={`font-bold text-sm flex items-center justify-between ${isDark ? 'text-emerald-100' : 'text-emerald-900'}`}>
                  <span>{position.payout.usdt.toFixed(2)} USDT</span>
                </div>
              </div>
            </div>
          )}

          <div className={`flex items-center justify-between text-xs pt-4 border-t ${
            isDark ? 'text-gray-500 border-zinc-700/50' : 'text-gray-400 border-gray-100'
          }`}>
            <span>{t('positions.placedOn')}</span>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {new Date(position.timestamp).toLocaleDateString(i18n.language, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      {position.status === 'won' && position.payout && (
        <div className={`px-6 pb-6 pt-0`}>
          {position.withdrawn ? (
            <div className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold border ${
              isDark ? 'bg-zinc-800/50 text-gray-400 border-zinc-700/50' : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('positions.withdrawn')}</span>
            </div>
          ) : (!position.payout || position.payout.usdt > 0) && (
            <button
              onClick={() => onWithdraw(position.questionId)}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-yellow-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
            >
              <span>{t('positions.withdrawWinnings')}</span>
              <Trophy className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
      )}

      {position.status === 'cancelled' && (
        <div className={`px-6 pb-6 pt-0`}>
          {position.withdrawn ? (
            <div className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold border ${
              isDark ? 'bg-zinc-800/50 text-gray-400 border-zinc-700/50' : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('positions.refunded') || "Refunded"}</span>
            </div>
          ) : (!position.payout || position.payout.usdt > 0) && (
            <button
              onClick={() => onWithdraw(position.questionId)}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
            >
              <span>{t('positions.claimRefund') || "Claim Refund"}</span>
              <AlertCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
      )}

      {position.status === 'lost' && (
        <div className="px-6 pb-6 pt-0">
          <div className={`relative overflow-hidden rounded-2xl p-5 text-center border group/msg transition-all duration-300 ${
             isDark ? 'bg-gradient-to-br from-red-500/5 to-orange-500/5 border-red-500/20 hover:border-red-500/30' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-100 hover:border-red-200'
          }`}>
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-700 group-hover/msg:scale-125"></div>
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -ml-16 -mb-16 transition-transform duration-700 group-hover/msg:scale-125"></div>
             
             <div className="relative z-10 flex flex-col items-center gap-3">
                <div className={`p-3 rounded-full shadow-lg transform transition-transform duration-300 group-hover/msg:rotate-12 ${isDark ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 text-red-400 shadow-red-900/20' : 'bg-white text-red-500 shadow-red-100'}`}>
                   <Sparkles className="w-5 h-5" /> 
                </div>
                <p className={`text-sm font-bold italic leading-relaxed max-w-[90%] mx-auto ${isDark ? 'text-red-200/90' : 'text-red-700/90'}`}>
                  "{t('positions.lostMessage')}"
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
