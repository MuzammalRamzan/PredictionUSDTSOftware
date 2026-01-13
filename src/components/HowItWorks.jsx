import { Wallet, TrendingUp, Trophy, Shield, Coins, Target, ArrowRight, Users, Sparkles, TrendingDown } from 'lucide-react';

export default function HowItWorks() {
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

        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-xl mb-12">
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-gray-900 px-8 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Reward Distribution Breakdown</h3>
                <p className="text-blue-100">Clear example of how payouts are calculated</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2">
                <div className="text-white/70 text-xs font-semibold mb-0.5">Admin Fee</div>
                <div className="text-white text-xl font-bold">10%</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                  Initial Pool State
                </h4>

                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5 text-green-700" />
                        <span className="font-bold text-green-900">YES Pool (Winners)</span>
                      </div>
                      <span className="bg-green-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">WIN</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/70 rounded-lg p-3">
                        <div className="text-xs text-green-700 font-medium mb-1">Total Participants</div>
                        <div className="text-2xl font-bold text-green-900">30</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-3">
                        <div className="text-xs text-green-700 font-medium mb-1">Total Staked</div>
                        <div className="text-sm font-bold text-green-900">30 OCRO</div>
                        <div className="text-sm font-bold text-green-900">30 USDT</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="w-5 h-5 text-gray-700" />
                        <span className="font-bold text-gray-900">NO Pool (Losers)</span>
                      </div>
                      <span className="bg-gray-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">LOSE</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/70 rounded-lg p-3">
                        <div className="text-xs text-gray-700 font-medium mb-1">Total Participants</div>
                        <div className="text-2xl font-bold text-gray-900">70</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-3">
                        <div className="text-xs text-gray-700 font-medium mb-1">Total Staked</div>
                        <div className="text-sm font-bold text-gray-900">70 OCRO</div>
                        <div className="text-sm font-bold text-gray-900">70 USDT</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Coins className="w-4 h-4 text-blue-700" />
                      <span className="font-bold text-blue-900">Your Position</span>
                    </div>
                    <div className="text-sm text-blue-800">
                      You bet <span className="font-bold">1 OCRO + 1 USDT</span> on <span className="font-bold text-green-700">YES</span>
                    </div>
                    <div className="text-xs text-blue-700 mt-1">You are 1 of 30 winners</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                  Payout Calculation Steps
                </h4>

                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">A</div>
                      <span className="font-bold text-gray-900">Collect Losing Pool</span>
                    </div>
                    <div className="ml-8">
                      <div className="text-sm text-gray-700 mb-2">All funds from NO pool are collected:</div>
                      <div className="bg-gray-50 rounded-lg p-3 inline-block">
                        <div className="text-lg font-bold text-gray-900">70 OCRO + 70 USDT</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-gray-400 transform rotate-90" />
                  </div>

                  <div className="bg-white border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">B</div>
                      <span className="font-bold text-gray-900">Deduct Admin Fee</span>
                    </div>
                    <div className="ml-8">
                      <div className="text-sm text-gray-700 mb-2">10% fee is taken from losing pool:</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Admin fee (10%):</span>
                          <span className="font-bold text-red-700">7 OCRO + 7 USDT</span>
                        </div>
                        <div className="border-t-2 border-gray-200 pt-2 flex items-center justify-between">
                          <span className="text-gray-700 font-medium">Remaining:</span>
                          <span className="text-lg font-bold text-gray-900">63 OCRO + 63 USDT</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-gray-400 transform rotate-90" />
                  </div>

                  <div className="bg-white border-2 border-green-300 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">C</div>
                      <span className="font-bold text-gray-900">Calculate Your Share</span>
                    </div>
                    <div className="ml-8">
                      <div className="text-sm text-gray-700 mb-2">Your proportion of winning pool:</div>
                      <div className="bg-green-50 rounded-lg p-3 mb-3">
                        <div className="text-sm text-green-800 mb-1">Your stake / Total YES pool = Your share</div>
                        <div className="text-base font-bold text-green-900">1 / 30 = 3.33%</div>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">Your winnings from losing pool:</div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-sm text-green-800 mb-1">63 OCRO × 3.33% = 2.1 OCRO</div>
                        <div className="text-sm text-green-800">63 USDT × 3.33% = 2.1 USDT</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-3 border-green-400 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                  Final Payout Summary
                </h4>
                <Trophy className="w-8 h-8 text-green-600" />
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white/80 rounded-xl p-4 border-2 border-green-200">
                  <div className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">Original Stake</div>
                  <div className="text-xl font-bold text-gray-900">1 OCRO</div>
                  <div className="text-xl font-bold text-gray-900">1 USDT</div>
                  <div className="text-xs text-gray-600 mt-1">Returned to you</div>
                </div>

                <div className="bg-white/80 rounded-xl p-4 border-2 border-green-200">
                  <div className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">Your Winnings</div>
                  <div className="text-xl font-bold text-green-700">+ 2.1 OCRO</div>
                  <div className="text-xl font-bold text-green-700">+ 2.1 USDT</div>
                  <div className="text-xs text-gray-600 mt-1">From losing pool</div>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-4 border-2 border-green-700 text-white">
                  <div className="text-xs font-semibold text-green-100 mb-2 uppercase tracking-wide">Total Payout</div>
                  <div className="text-2xl font-bold">3.1 OCRO</div>
                  <div className="text-2xl font-bold">3.1 USDT</div>
                  <div className="text-xs text-green-100 mt-1 flex items-center justify-between">
                    <span>Net profit</span>
                    <span className="bg-green-500 px-2 py-0.5 rounded font-bold text-white">+210%</span>
                  </div>
                </div>
              </div>

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
