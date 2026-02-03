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
      color: 'from-yellow-600 to-yellow-700',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Choose Pool',
      description: 'Browse World Cup predictions and select an outcome.',
      color: 'from-yellow-700 to-yellow-800',
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: 'Place Bet',
      description: 'Stake 1 FTR + 1 USDT on your predicted outcome.',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Withdraw Winnings',
      description: 'After settlement, winners withdraw their share of the pool.',
      color: 'from-yellow-400 to-yellow-500',
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
    <section id="how" className={`py-24 relative overflow-hidden ${isDark ? 'bg-transparent' : 'bg-gradient-to-b from-white to-yellow-50/50'}`}>
      {/* Background Ambience */}
      <div className={`absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none ${isDark ? 'opacity-30' : 'opacity-40'}`}>
        <div className={`absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 animate-pulse ${
          isDark ? 'bg-yellow-900/20' : 'bg-yellow-200/40'
        }`}></div>
        <div className={`absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 animate-pulse delay-1000 ${
          isDark ? 'bg-yellow-900/20' : 'bg-yellow-200/40'
        }`}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6 backdrop-blur-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 tracking-widest uppercase">Simple Process</span>
          </div>
          <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            How It Works
          </h2>
          <p className={`text-xl max-w-2xl mx-auto font-medium leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Join the next generation of decentralized prediction markets in four simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32 relative">
          {/* Connecting Line (Desktop) */}
          <div className={`hidden lg:block absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 z-0 ${
            isDark ? 'bg-gradient-to-r from-transparent via-zinc-700 to-transparent' : 'bg-gradient-to-r from-transparent via-yellow-200 to-transparent'
          }`}></div>

          {steps.map((step, index) => (
            <div key={index} className="relative group z-10">
              <div className={`glass-card h-full p-8 rounded-[2rem] border transition-all duration-500 hover:-translate-y-2 overflow-hidden ${
                isDark
                  ? 'bg-zinc-900/60 border-zinc-700/50 hover:border-yellow-500/50 hover:shadow-[0_0_40px_rgba(234,179,8,0.15)]'
                  : 'bg-white/80 border-white/60 hover:border-yellow-400 hover:shadow-xl hover:shadow-yellow-500/20'
              }`}>
                {/* Watermark Number */}
                <div className={`absolute -right-4 -bottom-8 text-[10rem] font-black opacity-[0.03] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110 ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}>
                  {index + 1}
                </div>

                <div className={`relative w-16 h-16 mb-8 rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 bg-gradient-to-br ${step.color} shadow-yellow-500/20`}>
                  {step.icon}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center font-black text-sm border-2 border-transparent group-hover:border-yellow-500 transition-colors shadow-sm z-10">
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-yellow-500 to-yellow-700">{index + 1}</span>
                  </div>
                </div>
                
                <h3 className={`text-xl font-bold mb-3 relative z-10 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{step.title}</h3>
                <p className={`text-sm leading-relaxed font-medium relative z-10 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mb-32">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-zinc-800 shadow-inner' : 'bg-white shadow-lg'}`}>
                <Calculator className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>Profit Calculator</h3>
            </div>
            <p className={`text-lg ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Estimate your potential winnings based on pool participation</p>
          </div>

          <div className={`glass-card rounded-[2.5rem] p-1 shadow-2xl overflow-hidden ${
            isDark ? 'bg-zinc-800/30' : 'bg-white/60'
          }`}>
            <div className={`rounded-[2.25rem] border overflow-hidden ${
              isDark
                ? 'bg-zinc-900/80 border-zinc-700/50 backdrop-blur-xl'
                : 'bg-white/90 border-white/80 backdrop-blur-xl shadow-inner'
            }`}>
              {/* Calculator Header */}
              <div className={`px-8 py-6 border-b flex items-center justify-between ${
                isDark ? 'border-zinc-800 bg-zinc-800/50' : 'border-zinc-100 bg-zinc-50/50'
              }`}>
                <div className="flex items-center space-x-3">
                   <div className={`p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-white shadow-sm'}`}>
                     <Calculator className="w-5 h-5 text-yellow-500" />
                   </div>
                   <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-zinc-900'}`}>Profit Simulator</span>
                </div>
                <div className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'
                }`}>
                  Live Estimates
                </div>
              </div>

              {/* Calculator Content */}
              <div className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {/* Controls */}
                  <div className="space-y-8">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Predicted Outcome
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setWinningOutcome('yes')}
                          className={`relative overflow-hidden group p-4 rounded-2xl border transition-all duration-300 ${
                            winningOutcome === 'yes'
                              ? 'bg-yellow-500 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
                              : isDark
                                ? 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                                : 'bg-white border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="relative z-10 flex flex-col items-center space-y-2">
                            <span className={`text-sm font-bold ${winningOutcome === 'yes' ? 'text-yellow-100' : 'text-zinc-500'}`}>WIN</span>
                            <span className={`text-2xl font-black tracking-tight ${winningOutcome === 'yes' ? 'text-white' : isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>YES</span>
                          </div>
                          {winningOutcome === 'yes' && (
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent"></div>
                          )}
                        </button>

                        <button
                          onClick={() => setWinningOutcome('no')}
                          className={`relative overflow-hidden group p-4 rounded-2xl border transition-all duration-300 ${
                            winningOutcome === 'no'
                              ? 'bg-zinc-600 border-zinc-500 shadow-[0_0_30px_rgba(82,82,91,0.3)]'
                              : isDark
                                ? 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                                : 'bg-white border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="relative z-10 flex flex-col items-center space-y-2">
                            <span className={`text-sm font-bold ${winningOutcome === 'no' ? 'text-zinc-100' : 'text-zinc-500'}`}>WIN</span>
                            <span className={`text-2xl font-black tracking-tight ${winningOutcome === 'no' ? 'text-white' : isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>NO</span>
                          </div>
                          {winningOutcome === 'no' && (
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-400/20 to-transparent"></div>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>YES Pool Size</span>
                          <span className={`font-mono font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{yesParticipants} Users</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="1000"
                          value={yesParticipants}
                          onChange={(e) => setYesParticipants(Number(e.target.value))}
                          className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400 transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>NO Pool Size</span>
                          <span className={`font-mono font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{noParticipants} Users</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="1000"
                          value={noParticipants}
                          onChange={(e) => setNoParticipants(Number(e.target.value))}
                          className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-500 hover:accent-zinc-400 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Results Card */}
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 blur-3xl rounded-full ${isDark ? 'opacity-20' : 'opacity-30'}`}></div>
                    <div className={`relative rounded-3xl p-8 border backdrop-blur-xl ${
                      isDark
                        ? 'bg-zinc-900/80 border-zinc-700/50 shadow-2xl'
                        : 'bg-white/90 border-zinc-200 shadow-xl'
                    }`}>
                      <div className="flex items-center justify-between mb-8">
                        <div className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          Estimated Returns
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {profitPercentage}% ROI
                        </div>
                      </div>
                      
                      <div className="space-y-6 text-center">
                        <div className="space-y-2">
                          <div className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Total Payout</div>
                          <div className={`text-6xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {totalPayoutOcro}<span className="text-3xl text-yellow-500 ml-2">FTR</span>
                          </div>
                        </div>

                        <div className={`h-px w-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}></div>

                        <div className="flex items-center justify-center space-x-2">
                          <span className={`text-2xl font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>+</span>
                          <span className={`text-3xl font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            {totalPayoutUsdt}<span className="text-lg ml-1">USDT</span>
                          </span>
                        </div>
                      </div>

                      <div className={`mt-8 p-4 rounded-xl text-xs leading-relaxed font-medium text-center ${
                        isDark ? 'bg-zinc-800/50 text-zinc-500' : 'bg-zinc-50 text-zinc-500'
                      }`}>
                        Based on a standard 1 FTR + 1 USDT bet. Platform fee ({adminFee}%) is deducted from the losing pool before distribution.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className={`glass-card p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
              isDark
                ? 'bg-zinc-900/40 border-zinc-700/50 hover:border-yellow-500/30 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]'
                : 'bg-white/60 border-white/60 hover:border-yellow-300 hover:shadow-xl hover:shadow-yellow-500/10'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-inner transition-colors duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 text-yellow-500 group-hover:from-yellow-500/20 group-hover:to-yellow-400/20' 
                  : 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-600 group-hover:from-yellow-100 group-hover:to-yellow-200'
              }`}>
                {feature.icon}
              </div>
              <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{feature.title}</h3>
              <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
