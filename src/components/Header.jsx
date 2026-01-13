import { Wallet, Menu, X, TrendingUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Header({ walletAddress, onConnectWallet, positionsCount = 0, isLoading = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-blue-900 to-blue-950 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              OCRO Predict
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#active" className="text-gray-600 hover:text-blue-900 transition-colors font-medium">
              Markets
            </a>
            <a href="#positions" className="text-gray-600 hover:text-blue-900 transition-colors font-medium">
              Positions
            </a>
            <a href="#how" className="text-gray-600 hover:text-blue-900 transition-colors font-medium">
              How It Works
            </a>
          </div>

          <div className="hidden md:block">
            {walletAddress ? (
              <div className="relative">
                <button
                  onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                  className="flex items-center space-x-2 bg-blue-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-950 transition-all duration-200"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm">{formatAddress(walletAddress)}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {walletMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                      <p className="text-sm font-mono text-gray-900">{walletAddress}</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-xs text-gray-500 mb-1">My Positions</p>
                      <p className="text-lg font-bold text-gray-900">{positionsCount} Active</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-blue-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-950 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Wallet className="w-4 h-4" />
                <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <a
              href="#active"
              className="block py-2 text-gray-600 hover:text-blue-900 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Markets
            </a>
            <a
              href="#positions"
              className="block py-2 text-gray-600 hover:text-blue-900 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Positions
            </a>
            <a
              href="#how"
              className="block py-2 text-gray-600 hover:text-blue-900 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <div className="pt-3">
              {walletAddress ? (
                <div className="bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs font-medium text-blue-900">Connected</span>
                    </div>
                  </div>
                  <p className="text-sm font-mono text-gray-900 mb-2">{walletAddress}</p>
                  <p className="text-xs text-gray-500">{positionsCount} Active Positions</p>
                </div>
              ) : (
                <button
                  onClick={onConnectWallet}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-950 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
