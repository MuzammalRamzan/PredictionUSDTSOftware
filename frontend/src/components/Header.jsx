import { Wallet, Menu, X, TrendingUp, ChevronDown, LogOut, Sun, Moon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function Header({ walletAddress, onConnectWallet, onDisconnectWallet, positionsCount = 0, isLoading = false, isAdmin = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const walletMenuRef = useRef(null);
  const { isDark, toggleTheme } = useTheme();

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target)) {
        setWalletMenuOpen(false);
      }
    };

    if (walletMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [walletMenuOpen]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b ${
      isDark
        ? 'bg-zinc-900/90 border-zinc-700/50'
        : 'bg-white/90 border-red-100'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-red-600 to-red-800 p-2.5 rounded-xl shadow-lg shadow-red-500/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text">
              FTR Predict
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#active" className={`transition-colors font-semibold text-sm ${
              isDark ? 'text-gray-300 hover:text-red-400' : 'text-gray-700 hover:text-red-600'
            }`}>
              Markets
            </a>
            <a href="#positions" className={`transition-colors font-semibold text-sm ${
              isDark ? 'text-gray-300 hover:text-red-400' : 'text-gray-700 hover:text-red-600'
            }`}>
              Positions
            </a>
            {isAdmin && (
              <a href="#admin" className={`transition-colors font-semibold text-sm ${
                isDark ? 'text-gray-300 hover:text-red-400' : 'text-gray-700 hover:text-red-600'
              }`}>
                Admin
              </a>
            )}
            <a href="#how" className={`transition-colors font-semibold text-sm ${
              isDark ? 'text-gray-300 hover:text-red-400' : 'text-gray-700 hover:text-red-600'
            }`}>
              How It Works
            </a>

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-yellow-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className="hidden md:block">
            {walletAddress ? (
              <div className="relative" ref={walletMenuRef}>
                <button
                  onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                  className="flex items-center space-x-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-bold hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg shadow-red-500/30"
                >
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">{formatAddress(walletAddress)}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {walletMenuOpen && (
                  <div className={`absolute right-0 mt-3 w-72 backdrop-blur-xl rounded-xl shadow-2xl py-2 overflow-hidden ${
                    isDark
                      ? 'bg-zinc-800 border border-zinc-700'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className={`px-5 py-4 border-b ${isDark ? 'border-zinc-700' : 'border-gray-200'}`}>
                      <p className={`text-xs mb-2 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Wallet Address</p>
                      <p className={`text-sm font-mono break-all ${isDark ? 'text-white' : 'text-gray-900'}`}>{walletAddress}</p>
                    </div>
                    <div className={`px-5 py-4 border-b ${isDark ? 'border-zinc-700' : 'border-gray-200'}`}>
                      <p className={`text-xs mb-2 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>My Positions</p>
                      <p className="text-2xl font-bold text-red-400">{positionsCount} Active</p>
                    </div>
                    <button
                      onClick={() => {
                        onDisconnectWallet();
                        setWalletMenuOpen(false);
                      }}
                      className="w-full px-5 py-4 flex items-center space-x-3 text-red-400 hover:bg-red-500/10 transition-colors font-semibold"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl font-bold hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg shadow-red-500/30 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Wallet className="w-5 h-5" />
                <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 ${isDark ? 'text-gray-300 hover:text-red-400' : 'text-gray-700 hover:text-red-600'}`}
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className={`md:hidden backdrop-blur-xl border-t ${
          isDark
            ? 'bg-zinc-900/95 border-zinc-700/50'
            : 'bg-white/95 border-red-100'
        }`}>
          <div className="px-4 py-6 space-y-4">
            <a
              href="#active"
              className={`block py-3 transition-colors font-semibold ${
                isDark ? 'text-gray-300 hover:text-red-400' : 'text-gray-700 hover:text-red-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Markets
            </a>
            <a
              href="#positions"
              className={`block py-3 transition-colors font-semibold ${
                isDark ? 'text-gray-300 hover:text-red-400' : 'text-gray-700 hover:text-red-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Positions
            </a>
            {isAdmin && (
              <a
                href="#admin"
                className={`block py-3 transition-colors font-semibold ${
                  isDark ? 'text-gray-300 hover:text-red-400' : 'text-gray-700 hover:text-red-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </a>
            )}
            <a
              href="#how"
              className={`block py-3 transition-colors font-semibold ${
                isDark ? 'text-gray-300 hover:text-red-400' : 'text-gray-700 hover:text-red-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>

            <button
              onClick={toggleTheme}
              className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg transition-all duration-300 font-semibold ${
                isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-yellow-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {isDark ? (
                <>
                  <Sun className="w-5 h-5" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <div className="pt-4 space-y-4">
              {walletAddress ? (
                <>
                  <div className={`backdrop-blur-xl px-5 py-4 rounded-xl border ${
                    isDark
                      ? 'bg-zinc-800/50 border-zinc-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-red-400">Connected</span>
                      </div>
                    </div>
                    <p className={`text-sm font-mono mb-3 break-all ${isDark ? 'text-white' : 'text-gray-900'}`}>{walletAddress}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{positionsCount} Active Positions</p>
                  </div>
                  <button
                    onClick={() => {
                      onDisconnectWallet();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-red-700 transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Disconnect Wallet</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onConnectWallet}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3.5 rounded-xl font-bold hover:from-red-500 hover:to-red-600 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed"
                >
                  <Wallet className="w-5 h-5" />
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
