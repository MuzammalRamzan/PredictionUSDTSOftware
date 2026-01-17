import { TrendingUp, Shield, Coins, Users, Sparkles, ArrowRight } from 'lucide-react';

export default function Hero({ stats }) {
  return (
    <div className="relative bg-gradient-to-br from-white via-gray-50 to-white pt-32 pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold mb-8 shadow-lg">
            <Shield className="w-4 h-4" />
            <span>Powered by Binance Smart Chain</span>
            <Sparkles className="w-4 h-4" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight">
            <span className="text-gray-900">World Cup 2026</span>
            <span className="block bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 text-transparent bg-clip-text">
              Prediction Pools
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
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
              className="inline-flex items-center space-x-3 bg-white border-2 border-gray-300 text-gray-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 hover:border-cyan-500 transition-all duration-300 shadow-lg"
            >
              <span>Learn More</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-cyan-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-xl mb-4 inline-block shadow-md">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.totalVolume.ocro.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 font-medium">OCRO Volume</div>
          </div>

          <div className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-cyan-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-xl mb-4 inline-block shadow-md">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.totalVolume.usdt.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 font-medium">USDT Volume</div>
          </div>

          <div className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-cyan-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl mb-4 inline-block shadow-md">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.activeQuestions}
            </div>
            <div className="text-sm text-gray-600 font-medium">Active Markets</div>
          </div>

          <div className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-cyan-500 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl mb-4 inline-block shadow-md">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.totalParticipants.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 font-medium">Participants</div>
          </div>
        </div>
      </div>
    </div>
  );
}
