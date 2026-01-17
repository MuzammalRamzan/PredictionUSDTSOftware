import { TrendingUp, Clock, Trophy, CheckCircle2, XCircle, Wallet } from 'lucide-react';

export default function UserPositions({ positions, walletConnected, onWithdraw, isLoading = false }) {
  if (!walletConnected) {
    return (
      <section id="positions" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">My Positions</h2>
            <p className="text-gray-600">Connect your wallet to view your betting positions</p>
          </div>
          <div className="flex justify-center">
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-16 max-w-md w-full text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Wallet Connected</h3>
              <p className="text-gray-500 text-sm">Connect your wallet to view and manage your positions</p>
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
    <section id="positions" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">My Positions</h2>
          <p className="text-gray-600">Track your active bets and view your betting history</p>
        </div>

        {positions.length === 0 ? (
          <div className="flex justify-center">
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-16 max-w-md w-full text-center">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Positions Yet</h3>
              <p className="text-gray-500 text-sm mb-4">Place your first bet to get started</p>
              <a
                href="#active"
                className="inline-flex items-center space-x-2 bg-blue-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-950 transition-all"
              >
                <span>Browse Markets</span>
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-900 font-medium">Active Positions</span>
                  <Clock className="w-5 h-5 text-blue-900" />
                </div>
                <p className="text-3xl font-bold text-blue-900">{activePositions.length}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-900 font-medium">Won</span>
                  <Trophy className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-900">{totalWon}</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700 font-medium">Total Staked</span>
                  <TrendingUp className="w-5 h-5 text-gray-700" />
                </div>
                <p className="text-xl font-bold text-gray-900">{totalStaked / 2} <span className="text-sm text-gray-500">OCRO + USDT</span></p>
              </div>
            </div>

            <div className="space-y-8">
              {activePositions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <div className="w-1 h-6 bg-blue-900 rounded"></div>
                      <span>Active Positions</span>
                      <span className="text-blue-900">({activePositions.length})</span>
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
                    <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <div className="w-1 h-6 bg-gray-400 rounded"></div>
                      <span>Settled Positions</span>
                      <span className="text-gray-600">({settledPositions.length})</span>
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
  const getStatusInfo = () => {
    switch (position.status) {
      case 'active':
        return {
          badge: 'Active',
          bg: 'bg-white border-blue-200',
          statusBg: 'bg-blue-100 text-blue-900',
          icon: <Clock className="w-4 h-4" />,
        };
      case 'won':
        return {
          badge: 'Won',
          bg: 'bg-white border-green-200',
          statusBg: 'bg-green-100 text-green-700',
          icon: <Trophy className="w-4 h-4" />,
        };
      case 'lost':
        return {
          badge: 'Lost',
          bg: 'bg-white border-gray-200',
          statusBg: 'bg-gray-100 text-gray-600',
          icon: <XCircle className="w-4 h-4" />,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const sideColor = position.side === 'yes'
    ? 'bg-blue-900 text-white'
    : 'bg-gray-400 text-white';

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

        <h4 className="text-sm font-bold text-gray-900 mb-4 line-clamp-2 leading-snug min-h-[2.5rem]">
          {position.question}
        </h4>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Staked</span>
            </div>
            <div className="font-bold text-gray-900 text-sm">
              {position.ocroStaked} OCRO + {position.usdtStaked} USDT
            </div>
          </div>

          {position.payout && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-green-700 font-semibold">Total Payout</span>
                <Trophy className="w-3.5 h-3.5 text-green-600" />
              </div>
              <div className="font-bold text-green-900 text-sm">
                {position.payout.ocro.toFixed(2)} OCRO + {position.payout.usdt.toFixed(2)} USDT
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
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
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          {position.withdrawn ? (
            <div className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-semibold">
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
