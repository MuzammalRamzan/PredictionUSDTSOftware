import { TrendingUp, Clock, Trophy, CheckCircle2, XCircle, Wallet } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function UserPositions({ positions, walletConnected, onWithdraw, isLoading = false }) {
  const { isDark } = useTheme();

  if (!walletConnected) {
    return (
      <section id="positions" className={`py-16 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>My Positions</h2>
            <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>Connect your wallet to view your betting positions</p>
          </div>
          <div className="flex justify-center">
            <div className={`border-2 border-dashed rounded-xl p-16 max-w-md w-full text-center ${
              isDark ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-300'
            }`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-slate-700' : 'bg-gray-100'
              }`}>
                <Wallet className={`w-10 h-10 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Wallet Connected</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Connect your wallet to view and manage your positions</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const activePositions = positions.filter(p => p.status === 'active');
  const settledPositions = positions.filter(p => p.status !== 'active');
  const totalStaked = positions.reduce((acc, p) => acc + p.ocroStaked + p.usdtStaked, 0);
  const totalWon = settledPositions.filter(p => p.status === 'won').length;

  return (
    <section id="positions" className={`py-16 ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>My Positions</h2>
          <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>Track your active bets and view your betting history</p>
        </div>

        {positions.length === 0 ? (
          <div className="flex justify-center">
            <div className={`border-2 border-dashed rounded-xl p-16 max-w-md w-full text-center ${
              isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-300'
            }`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-slate-600' : 'bg-gray-100'
              }`}>
                <TrendingUp className={`w-10 h-10 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Positions Yet</h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Place your first bet to get started</p>
              <a
                href="#active"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                <span>Browse Markets</span>
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className={`rounded-xl p-6 border ${
                isDark
                  ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-700/50'
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>Active Positions</span>
                  <Clock className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-900'}`} />
                </div>
                <p className={`text-3xl font-bold ${isDark ? 'text-blue-200' : 'text-blue-900'}`}>{activePositions.length}</p>
              </div>

              <div className={`rounded-xl p-6 border ${
                isDark
                  ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-700/50'
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-900'}`}>Won</span>
                  <Trophy className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <p className={`text-3xl font-bold ${isDark ? 'text-green-200' : 'text-green-900'}`}>{totalWon}</p>
              </div>

              <div className={`rounded-xl p-6 border ${
                isDark
                  ? 'bg-slate-700 border-slate-600'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Total Staked</span>
                  <TrendingUp className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-700'}`} />
                </div>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {totalStaked / 2} <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>OCRO + USDT</span>
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {activePositions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <div className="w-1 h-6 bg-cyan-500 rounded"></div>
                      <span>Active Positions</span>
                      <span className="text-cyan-500">({activePositions.length})</span>
                    </h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activePositions.map((position) => (
                      <PositionCard key={position.questionId} position={position} onWithdraw={onWithdraw} isLoading={isLoading} />
                    ))}
                  </div>
                </div>
              )}

              {settledPositions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <div className={`w-1 h-6 rounded ${isDark ? 'bg-slate-500' : 'bg-gray-400'}`}></div>
                      <span>Settled Positions</span>
                      <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>({settledPositions.length})</span>
                    </h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {settledPositions.map((position) => (
                      <PositionCard key={position.questionId} position={position} onWithdraw={onWithdraw} isLoading={isLoading} />
                    ))}
                  </div>
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

  const getStatusInfo = () => {
    switch (position.status) {
      case 'active':
        return {
          badge: 'Active',
          bg: isDark ? 'bg-slate-700 border-blue-700/50' : 'bg-white border-blue-200',
          statusBg: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-900',
          icon: <Clock className="w-4 h-4" />,
        };
      case 'won':
        return {
          badge: 'Won',
          bg: isDark ? 'bg-slate-700 border-green-700/50' : 'bg-white border-green-200',
          statusBg: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700',
          icon: <Trophy className="w-4 h-4" />,
        };
      case 'lost':
        return {
          badge: 'Lost',
          bg: isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200',
          statusBg: isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-100 text-gray-600',
          icon: <XCircle className="w-4 h-4" />,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const sideColor = position.side === 'yes'
    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
    : 'bg-gray-500 text-white';

  return (
    <div className={`rounded-xl border-2 ${statusInfo.bg} overflow-hidden hover:shadow-lg transition-all`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold ${sideColor}`}>
            {position.side === 'yes' ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            <span>{position.side.toUpperCase()}</span>
          </span>
          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusInfo.statusBg}`}>
            {statusInfo.icon}
            <span>{statusInfo.badge}</span>
          </span>
        </div>

        <h4 className={`text-sm font-bold mb-4 line-clamp-2 leading-snug min-h-[2.5rem] ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {position.question}
        </h4>

        <div className="space-y-3">
          <div className={`rounded-lg p-3 ${isDark ? 'bg-slate-600' : 'bg-gray-50'}`}>
            <div className={`flex items-center justify-between text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              <span>Staked</span>
            </div>
            <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {position.ocroStaked} OCRO + {position.usdtStaked} USDT
            </div>
          </div>

          {position.payout && (
            <div className={`rounded-lg p-3 border ${
              isDark ? 'bg-green-900/30 border-green-700/50' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-semibold ${isDark ? 'text-green-300' : 'text-green-700'}`}>Total Payout</span>
                <Trophy className={`w-3.5 h-3.5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div className={`font-bold text-sm ${isDark ? 'text-green-200' : 'text-green-900'}`}>
                {position.payout.ocro.toFixed(2)} OCRO + {position.payout.usdt.toFixed(2)} USDT
              </div>
            </div>
          )}

          <div className={`flex items-center justify-between text-xs pt-2 border-t ${
            isDark ? 'text-slate-400 border-slate-600' : 'text-gray-500 border-gray-100'
          }`}>
            <span>Placed</span>
            <span className="font-medium">
              {new Date(position.timestamp).toLocaleDateString('en-US', {
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
        <div className={`px-5 pb-5 border-t pt-4 ${isDark ? 'border-slate-600' : 'border-gray-100'}`}>
          {position.withdrawn ? (
            <div className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold ${
              isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-100 text-gray-600'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>Withdrawn</span>
            </div>
          ) : (
            <button
              onClick={() => onWithdraw(position.questionId)}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
            >
              <Trophy className="w-4 h-4" />
              <span>{isLoading ? 'Processing...' : 'Withdraw Winnings'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
