import { TrendingUp, Shield, Coins, Users } from 'lucide-react';

export default function Hero({ stats }) {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-gray-100 pt-24 pb-16">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200">
            <Shield className="w-4 h-4" />
            <span>Powered by Binance Smart Chain</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            World Cup 2026
            <span className="block text-blue-900">
              Prediction Pools
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Stake OCRO and USDT on World Cup matches. Pools settle after each match with transparent payouts.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#active"
              className="inline-flex items-center space-x-2 bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-950 transition-all duration-200 shadow-lg shadow-blue-900/20"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Explore Markets</span>
            </a>
            <a
              href="#how"
              className="inline-flex items-center space-x-2 bg-white text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 border-2 border-gray-300"
            >
              <span>Learn More</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-900 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Coins className="w-6 h-6 text-blue-900" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalVolume.ocro.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">OCRO Volume</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-900 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Coins className="w-6 h-6 text-blue-900" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalVolume.usdt.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">USDT Volume</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-900 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-900" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.activeQuestions}
            </div>
            <div className="text-sm text-gray-500">Active Markets</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-900 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalParticipants.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Participants</div>
          </div>
        </div>
      </div>
    </div>
  );
}
