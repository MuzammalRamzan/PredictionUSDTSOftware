import { Wallet, TrendingUp, Trophy, Shield, Coins, Target, ArrowRight, Users, Sparkles, TrendingDown, Calculator } from 'lucide-react';
import { useState } from 'react';

export default function HowItWorks() {
  const [yesParticipants, setYesParticipants] = useState(30);
  const [noParticipants, setNoParticipants] = useState(70);
  const [adminFee, setAdminFee] = useState(10);
  const [yourBets, setYourBets] = useState(1);
  const [winningOutcome, setWinningOutcome] = useState('yes'); // 'yes' or 'no'

  // Calculations
  const totalYesOcro = yesParticipants;
  const totalYesUsdt = yesParticipants;
  const totalNoOcro = noParticipants;
  const totalNoUsdt = noParticipants;

  // Determine winning and losing pools based on selected outcome
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
      icon: <Wallet className="w-7 h-7" />,
      title: 'Connect Wallet',
      description: 'Connect your BSC-compatible wallet with OCRO and USDT tokens.',
      color: 'from-blue-800 to-blue-900',
    },
    {
      icon: <Target className="w-7 h-7" />,
      title: 'Choose Pool',
      description: 'Browse World Cup predictions and select an outcome.',
      color: 'from-gray-600 to-gray-700',
    },
    {
      icon: <Coins className="w-7 h-7" />,
      title: 'Place Bet',
      description: 'Stake 1 OCRO + 1 USDT on your predicted outcome.',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: <Trophy className="w-7 h-7" />,
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
      description: 'Stake both OCRO and USDT tokens for balanced participation.',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Fair Distribution',
      description: 'Winners receive proportional shares based on their stake.',
    },
  ];

  return (
    <section id="how" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple, transparent pools powered by blockchain
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-900 hover:shadow-lg transition-all h-full">
                <div className={`bg-gradient-to-br ${step.color} w-14 h-14 rounded-lg flex items-center justify-center text-white mb-4`}>
                  {step.icon}
                </div>
                <div className="absolute -top-2 -left-2 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Calculator className="w-8 h-8 text-blue-900" />
              <h3 className="text-3xl font-bold text-gray-900">Profit Calculator</h3>
            </div>
            <p className="text-gray-600">Estimate your potential winnings</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-2xl">
            <div className="mb-4">
              <div className="text-center mb-3">
                <div className="text-sm text-white/60 mb-2">If the winning outcome is:</div>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setWinningOutcome('yes')}
                  className={`flex-1 max-w-xs px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                    winningOutcome === 'yes'
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/50 scale-105'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>YES</span>
                  </div>
                </button>
                <button
                  onClick={() => setWinningOutcome('no')}
                  className={`flex-1 max-w-xs px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                    winningOutcome === 'no'
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 scale-105'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>NO</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 mb-4">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-600 mb-2">Estimated Profit</div>
                <div className="text-4xl font-bold text-gray-900">{totalPayoutOcro} OCRO</div>
                <div className="text-3xl font-bold text-gray-900">{totalPayoutUsdt} USDT</div>
                <div className="mt-2 inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-full">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-lg font-bold">+{profitPercentage}% Profit</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-white/80 font-medium">YES Participants</span>
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={yesParticipants}
                  onChange={(e) => setYesParticipants(Math.max(1, Number(e.target.value)))}
                  className="w-full text-2xl font-bold text-white bg-white/5 border-2 border-white/20 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent cursor-pointer hover:bg-white/10 transition-colors"
                />
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-white/80 font-medium">NO Participants</span>
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={noParticipants}
                  onChange={(e) => setNoParticipants(Math.max(1, Number(e.target.value)))}
                  className="w-full text-2xl font-bold text-white bg-white/5 border-2 border-white/20 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent cursor-pointer hover:bg-white/10 transition-colors"
                />
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Coins className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-white/80 font-medium">Your Bets on {winningOutcome.toUpperCase()}</span>
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={yourBets}
                  onChange={(e) => setYourBets(Math.max(1, Math.min(winningPoolTotal, Number(e.target.value))))}
                  className="w-full text-2xl font-bold text-white bg-white/5 border-2 border-white/20 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer hover:bg-white/10 transition-colors"
                />
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-white/80 font-medium">Admin Fee %</span>
                </div>
                <div className="w-full text-2xl font-bold text-white bg-white/5 border-2 border-white/10 rounded-lg px-3 py-2 text-center opacity-75">
                  {adminFee}
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xs text-white/60 mb-1">Your Stake</div>
                  <div className="text-sm font-bold text-white">{yourBets} OCRO</div>
                  <div className="text-sm font-bold text-white">{yourBets} USDT</div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Winnings</div>
                  <div className="text-sm font-bold text-green-400">+{yourWinningsOcro} OCRO</div>
                  <div className="text-sm font-bold text-green-400">+{yourWinningsUsdt} USDT</div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Your Share</div>
                  <div className="text-lg font-bold text-blue-400">{yourShare}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <span className="font-semibold">How it works:</span> If <span className={`font-bold ${winningOutcome === 'yes' ? 'text-green-600' : 'text-red-600'}`}>{winningOutcome.toUpperCase()}</span> wins, {adminFee}% admin fee taken from <span className={`font-bold ${winningOutcome === 'yes' ? 'text-red-600' : 'text-green-600'}`}>{winningOutcome === 'yes' ? 'NO' : 'YES'}</span> pool ({adminFeeOcro} OCRO + {adminFeeUsdt} USDT). Remaining {remainingOcro} OCRO + {remainingUsdt} USDT distributed to <span className={`font-bold ${winningOutcome === 'yes' ? 'text-green-600' : 'text-red-600'}`}>{winningOutcome.toUpperCase()}</span> bettors based on their stake proportion.
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-900 hover:shadow-lg transition-all">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-900 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
