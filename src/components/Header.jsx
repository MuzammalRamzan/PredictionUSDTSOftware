import { Wallet, Menu, X, TrendingUp, ChevronDown, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Header({ walletAddress, onConnectWallet, onDisconnectWallet, positionsCount = 0, isLoading = false, isAdmin = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const walletMenuRef = useRef(null);

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              OCRO Predict
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            <a href="#active" className="text-slate-300 hover:text-cyan-400 transition-colors font-semibold text-sm">
              Markets
            </a>
            <a href="#positions" className="text-slate-300 hover:text-cyan-400 transition-colors font-semibold text-sm">
              Positions
            </a>
            {isAdmin && (
              <a href="#admin" className="text-slate-300 hover:text-cyan-400 transition-colors font-semibold text-sm">
                Admin
              </a>
            )}
            <a href="#how" className="text-slate-300 hover:text-cyan-400 transition-colors font-semibold text-sm">
              How It Works
            </a>
          </div>

          <div className="hidden md:block">
            {walletAddress ? (
              <div className="relative" ref={walletMenuRef}>
                <button
                  onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                  className="flex items-center space-x-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/30"
                >
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">{formatAddress(walletAddress)}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {walletMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-slate-800 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700 py-2 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-700">
                      <p className="text-xs text-slate-400 mb-2 font-medium">Wallet Address</p>
                      <p className="text-sm font-mono text-white break-all">{walletAddress}</p>
                    </div>
                    <div className="px-5 py-4 border-b border-slate-700">
                      <p className="text-xs text-slate-400 mb-2 font-medium">My Positions</p>
                      <p className="text-2xl font-bold text-cyan-400">{positionsCount} Active</p>
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
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/30 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Wallet className="w-5 h-5" />
                <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-cyan-400"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50">
          <div className="px-4 py-6 space-y-4">
            <a
              href="#active"
              className="block py-3 text-slate-300 hover:text-cyan-400 transition-colors font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Markets
            </a>
            <a
              href="#positions"
              className="block py-3 text-slate-300 hover:text-cyan-400 transition-colors font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Positions
            </a>
            {isAdmin && (
              <a
                href="#admin"
                className="block py-3 text-slate-300 hover:text-cyan-400 transition-colors font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </a>
            )}
            <a
              href="#how"
              className="block py-3 text-slate-300 hover:text-cyan-400 transition-colors font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <div className="pt-4 space-y-4">
              {walletAddress ? (
                <>
                  <div className="bg-slate-800/50 backdrop-blur-xl px-5 py-4 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-cyan-400">Connected</span>
                      </div>
                    </div>
                    <p className="text-sm font-mono text-white mb-3 break-all">{walletAddress}</p>
                    <p className="text-xs text-slate-400">{positionsCount} Active Positions</p>
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
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3.5 rounded-xl font-bold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed"
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
