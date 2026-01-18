import { Wallet, TrendingUp, Trophy, Shield, Coins, Target, TrendingDown, Calculator, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function HowItWorks() {
  const { isDark } = useTheme();
  const [yesParticipants, setYesParticipants] = useState(30);
  const [noParticipants, setNoParticipants] = useState(70);
  const [adminFee, setAdminFee] = useState(10);
  const [winningOutcome, setWinningOutcome] = useState('yes');

  const yourBets = 1;

  const totalYesOcro = yesParticipants;
  const totalYesUsdt = yesParticipants;
  const totalNoOcro = noParticipants;
  const totalNoUsdt = noParticipants;

  const losingPoolOcro = winningOutcome === 'yes' ? totalNoOcro : totalYesOcro;
  const losingPoolUsdt = winningOutcome === 'yes' ? totalNoUsdt : totalYesUsdt;
  const winningPoolTotal = winningOutcome === 'yes' ? totalYesOcro : totalNoOcro;

  const adminFeeOcro = (losingPoolOcro * adminFee / 100).toFixed(2);
  const adminFeeUsdt = (losingPoolUsdt * adminFee / 100).toFixed(2);

  const remainingOcro = (losingPoolOcro - adminFeeOcro).toFixed(2);
  const remainingUsdt = (losingPoolUsdt - adminFeeUsdt).toFixed(2);

  const yourShare = ((yourBets / winningPoolTotal) * 100).toFixed(2);
  const yourWinningsOcro = (remainingOcro * yourBets / winningPoolTotal).toFixed(2);
  const yourWinningsUsdt = (remainingUsdt * yourBets / winningPoolTotal).toFixed(2);

  const totalPayoutOcro = (parseFloat(yourBets) + parseFloat(yourWinningsOcro)).toFixed(2);
  const totalPayoutUsdt = (parseFloat(yourBets) + parseFloat(yourWinningsUsdt)).toFixed(2);

  const profitPercentage = ((parseFloat(yourWinningsOcro) / yourBets) * 100).toFixed(0);

  const steps = [
    {
      icon: <Wallet className="w-6 h-6" />,
      title: 'Connect Wallet',
      description: 'Connect your BSC-compatible wallet with FTR and USDT tokens.',
      color: 'from-red-600 to-red-700',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Choose Pool',
      description: 'Browse World Cup predictions and select an outcome.',
      color: 'from-red-700 to-red-800',
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: 'Place Bet',
      description: 'Stake 1 FTR + 1 USDT on your predicted outcome.',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Withdraw Winnings',
      description: 'After settlement, winners withdraw their share of the pool.',
      color: 'from-amber-500 to-amber-600',
    },
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Transparent & Secure',
      description: 'Smart contract on BSC ensures all transactions are transparent and tamper-proof.',
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: 'Dual Token System',
      description: 'Stake both FTR and USDT tokens for balanced participation.',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Fair Distribution',
      description: 'Winners receive proportional shares based on their stake.',
    },
  ];

  return (
    <section id="how" className={`py-16 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-b from-white to-red-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-700 text-transparent bg-clip-text text-sm font-bold tracking-wider uppercase">Simple Process</span>
          </div>
          <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            How It Works
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Simple, transparent pools powered by blockchain technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className={`rounded-xl p-6 border-2 hover:shadow-lg transition-all h-full ${
                isDark
                  ? 'bg-slate-800 border-slate-700 hover:border-red-500'
                  : 'bg-white border-gray-200 hover:border-red-500'
              }`}>
                <div className={`bg-gradient-to-br ${step.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 shadow-md`}>
                  {step.icon}
                </div>
                <div className="absolute -top-2 -left-2 w-7 h-7 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {index + 1}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className={`w-5 h-5 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Calculator className="w-7 h-7 text-red-600" />
              <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profit Calculator</h3>
            </div>
            <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Estimate your potential winnings in real-time</p>
          </div>

          <div className={`rounded-2xl p-6 shadow-lg border-2 ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
          }`}>
            <div className="mb-5">
              <div className="text-center mb-3">
                <div className={`text-sm mb-2 font-semibold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Select Winning Outcome</div>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setWinningOutcome('yes')}
                  className={`flex-1 max-w-[200px] px-6 py-3 rounded-xl font-bold transition-all ${
                    winningOutcome === 'yes'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                      : isDark
                        ? 'bg-slate-700 border-2 border-slate-600 text-slate-300 hover:border-green-500'
                        : 'bg-gray-100 border-2 border-gray-200 text-gray-600 hover:border-green-500'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Trophy className="w-4 h-4" />
                    <span>YES</span>
                  </div>
                </button>
                <button
                  onClick={() => setWinningOutcome('no')}
                  className={`flex-1 max-w-[200px] px-6 py-3 rounded-xl font-bold transition-all ${
                    winningOutcome === 'no'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                      : isDark
                        ? 'bg-slate-700 border-2 border-slate-600 text-slate-300 hover:border-red-500'
                        : 'bg-gray-100 border-2 border-gray-200 text-gray-600 hover:border-red-500'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Trophy className="w-4 h-4" />
                    <span>NO</span>
                  </div>
                </button>
              </div>
            </div>

            <div className={`rounded-xl p-5 mb-5 border ${
              isDark
                ? 'bg-gradient-to-br from-red-900/30 to-red-900/30 border-red-700/50'
                : 'bg-gradient-to-br from-red-50 to-red-50 border-red-200'
            }`}>
              <div className="text-center">
                <div className={`text-xs mb-2 font-semibold uppercase tracking-wider ${
                  isDark ? 'text-red-400' : 'text-red-700'
                }`}>Total Payout</div>
                <div className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalPayoutOcro} FTR</div>
                <div className={`text-2xl font-extrabold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalPayoutUsdt} USDT</div>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm shadow-md">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-bold">+{profitPercentage}% Profit</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-lg p-3 border ${
                  isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center space-x-1.5 mb-2">
                    <Trophy className="w-3.5 h-3.5 text-green-500" />
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>YES</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={yesParticipants}
                    onChange={(e) => setYesParticipants(Math.max(1, Number(e.target.value)))}
                    className={`w-full text-xl font-bold border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      isDark
                        ? 'bg-slate-600 border-slate-500 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className={`rounded-lg p-3 border ${
                  isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center space-x-1.5 mb-2">
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>NO</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={noParticipants}
                    onChange={(e) => setNoParticipants(Math.max(1, Number(e.target.value)))}
                    className={`w-full text-xl font-bold border rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      isDark
                        ? 'bg-slate-600 border-slate-500 text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className={`rounded-lg p-3 border ${
                isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center space-x-1.5 mb-2">
                  <Shield className="w-3.5 h-3.5 text-orange-500" />
                  <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Admin Fee %</span>
                </div>
                <div className={`w-full text-xl font-bold border rounded-lg px-3 py-2 text-center ${
                  isDark
                    ? 'bg-slate-600 border-slate-500 text-slate-400'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                  {adminFee}
                </div>
              </div>
            </div>

            <div className={`rounded-lg p-4 border ${
              isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
            }`}>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className={`text-xs mb-1 font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Your Stake</div>
                  <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{yourBets} FTR</div>
                  <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{yourBets} USDT</div>
                </div>
                <div>
                  <div className={`text-xs mb-1 font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Winnings</div>
                  <div className="text-sm font-bold text-green-600">+{yourWinningsOcro}</div>
                  <div className="text-sm font-bold text-green-600">+{yourWinningsUsdt}</div>
                </div>
                <div>
                  <div className={`text-xs mb-1 font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Your Share</div>
                  <div className="text-lg font-bold text-red-600">{yourShare}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-4 rounded-lg p-4 border ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`text-xs text-center leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              <span className="font-bold text-red-600">How it works:</span> If <span className={`font-bold ${winningOutcome === 'yes' ? 'text-green-600' : 'text-red-600'}`}>{winningOutcome.toUpperCase()}</span> wins, {adminFee}% admin fee is taken from the <span className={`font-bold ${winningOutcome === 'yes' ? 'text-red-600' : 'text-green-600'}`}>{winningOutcome === 'yes' ? 'NO' : 'YES'}</span> pool ({adminFeeOcro} FTR + {adminFeeUsdt} USDT). The remaining {remainingOcro} FTR + {remainingUsdt} USDT is distributed proportionally to all <span className={`font-bold ${winningOutcome === 'yes' ? 'text-green-600' : 'text-red-600'}`}>{winningOutcome.toUpperCase()}</span> bettors.
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className={`rounded-xl p-6 border-2 hover:shadow-lg transition-all ${
              isDark
                ? 'bg-slate-800 border-slate-700 hover:border-red-500'
                : 'bg-white border-gray-200 hover:border-red-500'
            }`}>
              <div className="bg-gradient-to-br from-red-600 to-red-700 w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 shadow-md">
                {feature.icon}
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
