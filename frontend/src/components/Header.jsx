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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isDark
        ? 'bg-zinc-900/60 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-yellow-900/5'
        : 'bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-lg shadow-yellow-500/5'
    }`}>
      <div className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent opacity-70`}></div>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
              <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 group-hover:opacity-60 transition-opacity duration-500 ${isDark ? 'bg-yellow-500' : 'bg-yellow-400'}`}></div>
              <img src="/ProPred.png" alt="ProPred" className="relative h-12 w-auto object-contain drop-shadow-lg" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-yellow-500 to-yellow-600 text-transparent bg-clip-text tracking-tighter group-hover:from-yellow-400 group-hover:to-yellow-500 transition-all duration-300 drop-shadow-sm">
              ProPred
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {['Markets', 'Positions', 'Admin', 'How It Works'].map((item) => {
              const href = item === 'How It Works' ? '#how' : `#${item.toLowerCase()}`;
              if (item === 'Admin' && !isAdmin) return null;
              
              return (
                <a
                  key={item}
                  href={href}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 group ${
                    isDark 
                      ? 'text-zinc-400 hover:text-white hover:bg-white/5' 
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-yellow-50/50 hover:shadow-sm'
                  }`}
                >
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300 inline-block">{item}</span>
                  {isDark && <div className="absolute inset-0 rounded-full bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>}
                  <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                    isDark ? 'bg-yellow-500' : 'bg-yellow-500'
                  }`}></div>
                </a>
              );
            })}

            <div className="w-px h-8 bg-gradient-to-b from-transparent via-zinc-300 dark:via-zinc-700 to-transparent mx-6"></div>

            <button
              onClick={toggleTheme}
              className={`p-3 rounded-full transition-all duration-300 ${
                isDark
                  ? 'bg-zinc-800/50 hover:bg-zinc-700 text-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-yellow-600 hover:shadow-lg hover:shadow-yellow-500/10'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className="hidden md:block pl-6">
            {walletAddress ? (
              <div className="relative" ref={walletMenuRef}>
                <button
                  onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                  className="flex items-center space-x-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-full font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40"
                >
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">{formatAddress(walletAddress)}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {walletMenuOpen && (
                  <div className={`absolute right-0 mt-3 w-72 backdrop-blur-xl rounded-2xl shadow-2xl py-2 overflow-hidden border ${
                    isDark
                      ? 'bg-zinc-800/90 border-zinc-700'
                      : 'bg-white/90 border-zinc-200 shadow-xl'
                  }`}>
                    <div className={`px-5 py-4 border-b ${isDark ? 'border-zinc-700' : 'border-zinc-100'}`}>
                      <p className={`text-xs mb-2 font-medium ${isDark ? 'text-gray-400' : 'text-zinc-500'}`}>Wallet Address</p>
                      <p className={`text-sm font-mono break-all ${isDark ? 'text-white' : 'text-zinc-900'}`}>{walletAddress}</p>
                    </div>
                    <div className={`px-5 py-4 border-b ${isDark ? 'border-zinc-700' : 'border-zinc-100'}`}>
                      <p className={`text-xs mb-2 font-medium ${isDark ? 'text-gray-400' : 'text-zinc-500'}`}>My Positions</p>
                      <p className="text-2xl font-bold text-yellow-400">{positionsCount} Active</p>
                    </div>
                    <button
                      onClick={() => {
                        onDisconnectWallet();
                        setWalletMenuOpen(false);
                      }}
                      className="w-full px-5 py-4 flex items-center space-x-3 text-yellow-400 hover:bg-yellow-500/10 transition-colors font-semibold"
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
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-3 rounded-full font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Wallet className="w-5 h-5" />
                <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 ${isDark ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600'}`}
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className={`md:hidden backdrop-blur-xl border-t ${
          isDark
            ? 'bg-zinc-900/95 border-zinc-700/50'
            : 'bg-white/95 border-yellow-100'
        }`}>
          <div className="px-4 py-6 space-y-4">
            <a
              href="#active"
              className={`block py-3 transition-colors font-semibold ${
                isDark ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Markets
            </a>
            <a
              href="#positions"
              className={`block py-3 transition-colors font-semibold ${
                isDark ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Positions
            </a>
            {isAdmin && (
              <a
                href="#admin"
                className={`block py-3 transition-colors font-semibold ${
                  isDark ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </a>
            )}
            <a
              href="#how"
              className={`block py-3 transition-colors font-semibold ${
                isDark ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600'
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
                        <span className="text-xs font-bold text-yellow-400">Connected</span>
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
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3.5 rounded-xl font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-lg shadow-yellow-500/20"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Disconnect Wallet</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onConnectWallet}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3.5 rounded-xl font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-lg shadow-yellow-500/20 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed"
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
