import { Wallet, TrendingUp, Trophy, Shield, Coins, Target, Users, TrendingDown, Calculator, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function HowItWorks() {
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
      icon: <Wallet className="w-8 h-8" />,
      title: 'Connect Wallet',
      description: 'Connect your BSC-compatible wallet with OCRO and USDT tokens.',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Choose Pool',
      description: 'Browse World Cup predictions and select an outcome.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: 'Place Bet',
      description: 'Stake 1 OCRO + 1 USDT on your predicted outcome.',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Withdraw Winnings',
      description: 'After settlement, winners withdraw their share of the pool.',
      color: 'from-amber-500 to-amber-600',
    },
  ];

  const features = [
    {
      icon: <Shield className="w-7 h-7" />,
      title: 'Transparent & Secure',
      description: 'Smart contract on BSC ensures all transactions are transparent and tamper-proof.',
    },
    {
      icon: <Coins className="w-7 h-7" />,
      title: 'Dual Token System',
      description: 'Stake both OCRO and USDT tokens for balanced participation.',
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: 'Fair Distribution',
      description: 'Winners receive proportional shares based on their stake.',
    },
  ];

  return (
    <section id="how" className="py-20 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05),transparent_50%)]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text text-sm font-bold tracking-wider uppercase">Simple Process</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Simple, transparent pools powered by blockchain technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all h-full">
                <div className={`bg-gradient-to-br ${step.color} w-16 h-16 rounded-xl flex items-center justify-center text-white mb-5 shadow-lg`}>
                  {step.icon}
                </div>
                <div className="absolute -top-3 -left-3 w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/50">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-cyan-400/50" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto mb-20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Calculator className="w-10 h-10 text-cyan-400" />
              <h3 className="text-4xl font-bold text-white">Profit Calculator</h3>
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
            <p className="text-lg text-slate-300">Estimate your potential winnings in real-time</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-700">
            <div className="mb-8">
              <div className="text-center mb-5">
                <div className="text-sm text-slate-400 mb-3 font-semibold">Select Winning Outcome</div>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setWinningOutcome('yes')}
                  className={`group flex-1 max-w-xs px-8 py-5 rounded-2xl font-bold text-xl transition-all ${
                    winningOutcome === 'yes'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-2xl shadow-green-500/50 scale-105'
                      : 'bg-slate-800/50 border-2 border-slate-700 text-slate-400 hover:border-green-500/50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Trophy className="w-6 h-6" />
                    <span>YES</span>
                    {winningOutcome === 'yes' && <Sparkles className="w-5 h-5" />}
                  </div>
                </button>
                <button
                  onClick={() => setWinningOutcome('no')}
                  className={`group flex-1 max-w-xs px-8 py-5 rounded-2xl font-bold text-xl transition-all ${
                    winningOutcome === 'no'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-2xl shadow-red-500/50 scale-105'
                      : 'bg-slate-800/50 border-2 border-slate-700 text-slate-400 hover:border-red-500/50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Trophy className="w-6 h-6" />
                    <span>NO</span>
                    {winningOutcome === 'no' && <Sparkles className="w-5 h-5" />}
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-xl rounded-2xl p-8 mb-6 border border-cyan-400/20">
              <div className="text-center mb-5">
                <div className="text-sm text-cyan-400 mb-3 font-semibold uppercase tracking-wider">Total Payout</div>
                <div className="text-5xl font-extrabold text-white mb-2">{totalPayoutOcro} OCRO</div>
                <div className="text-4xl font-extrabold text-white mb-4">{totalPayoutUsdt} USDT</div>
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full shadow-lg shadow-green-500/50">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-2xl font-bold">+{profitPercentage}% Profit</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-5 border border-slate-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <Trophy className="w-5 h-5 text-green-400" />
                    <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">YES Participants</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={yesParticipants}
                    onChange={(e) => setYesParticipants(Math.max(1, Number(e.target.value)))}
                    className="w-full text-3xl font-bold text-white bg-slate-900/50 border-2 border-slate-700 rounded-xl px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent cursor-pointer hover:border-cyan-400/50 transition-colors"
                  />
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-5 border border-slate-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">NO Participants</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={noParticipants}
                    onChange={(e) => setNoParticipants(Math.max(1, Number(e.target.value)))}
                    className="w-full text-3xl font-bold text-white bg-slate-900/50 border-2 border-slate-700 rounded-xl px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent cursor-pointer hover:border-cyan-400/50 transition-colors"
                  />
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-5 border border-slate-700">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-5 h-5 text-orange-400" />
                  <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Admin Fee %</span>
                </div>
                <div className="w-full text-3xl font-bold text-slate-400 bg-slate-900/30 border-2 border-slate-700/50 rounded-xl px-4 py-3 text-center">
                  {adminFee}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Your Stake</div>
                  <div className="text-lg font-bold text-white">{yourBets} OCRO</div>
                  <div className="text-lg font-bold text-white">{yourBets} USDT</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Winnings</div>
                  <div className="text-lg font-bold text-green-400">+{yourWinningsOcro} OCRO</div>
                  <div className="text-lg font-bold text-green-400">+{yourWinningsUsdt} USDT</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Your Share</div>
                  <div className="text-2xl font-bold text-cyan-400">{yourShare}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-slate-800/30 backdrop-blur-xl rounded-xl p-5 border border-slate-700">
            <div className="text-xs text-slate-300 text-center leading-relaxed">
              <span className="font-bold text-cyan-400">How it works:</span> If <span className={`font-bold ${winningOutcome === 'yes' ? 'text-green-400' : 'text-red-400'}`}>{winningOutcome.toUpperCase()}</span> wins, {adminFee}% admin fee is taken from the <span className={`font-bold ${winningOutcome === 'yes' ? 'text-red-400' : 'text-green-400'}`}>{winningOutcome === 'yes' ? 'NO' : 'YES'}</span> pool ({adminFeeOcro} OCRO + {adminFeeUsdt} USDT). The remaining {remainingOcro} OCRO + {remainingUsdt} USDT is distributed proportionally to all <span className={`font-bold ${winningOutcome === 'yes' ? 'text-green-400' : 'text-red-400'}`}>{winningOutcome.toUpperCase()}</span> bettors based on their stake.
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center text-white mb-5 shadow-lg shadow-cyan-500/30">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
