import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import BettingQuestionCard from './components/BettingQuestion';
import UserPositions from './components/UserPositions';
import HowItWorks from './components/HowItWorks';
import AdminPanel from './components/AdminPanel';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from './services/api';
import { web3Service } from './services/web3';
import { isAdminAddress } from './config/admin';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { isDark } = useTheme();
  const [walletAddress, setWalletAddress] = useState();
  const [questions, setQuestions] = useState([]);
  const [userPositions, setUserPositions] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalVolume: { ftr: 0, usdt: 0 },
    totalQuestions: 0,
    activeQuestions: 0,
    totalParticipants: 0,
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsPage, setQuestionsPage] = useState(0);

  const activePositionsCount = userPositions.filter(p => p.status === 'active').length;
  const isAdmin = isAdminAddress(walletAddress);

  useEffect(() => {
    loadQuestions();
    loadPlatformStats();
    checkWalletConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setWalletAddress(null);
          setUserPositions([]);
          showToast('Wallet disconnected');
        } else if (accounts[0] !== walletAddress) {
          setWalletAddress(accounts[0]);
          showToast('Account switched');
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  useEffect(() => {
    if (walletAddress) {
      loadUserBets();
    }
  }, [walletAddress]);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    }
  };

  const loadQuestions = async () => {
    try {
      const data = await api.getAllQuestions('open');
      const formattedQuestions = data.map(q => ({
        id: q._id,
        contractQuestionId: q.contractQuestionId,
        question: q.title,
        category: q.category,
        endTime: new Date(q.deadline),
        status: q.status,
        yesPool: {
          ftr: q.totalYesFtr || 0,
          usdt: q.totalYesUsdt || 0,
          participants: q.yesCount || 0,
        },
        noPool: {
          ftr: q.totalNoFtr || 0,
          usdt: q.totalNoUsdt || 0,
          participants: q.noCount || 0,
        },
        result: q.result,
      }));
      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Failed to load questions:', error);
      showToast('Failed to load questions');
    }
  };

  const loadPlatformStats = async () => {
    try {
      const stats = await api.getPlatformStats();
      setPlatformStats({
        totalVolume: {
          ftr: stats.totalVolumeFtr || 0,
          usdt: stats.totalVolumeUsdt || 0,
        },
        totalQuestions: stats.totalQuestions || 0,
        activeQuestions: stats.activeQuestions || 0,
        totalParticipants: stats.totalParticipants || 0,
      });
    } catch (error) {
      console.error('Failed to load platform stats:', error);
    }
  };

  const loadUserBets = async () => {
    try {
      const bets = await api.getUserBets(walletAddress);
      const formattedPositions = await Promise.all(bets.map(async bet => {
        const position = {
          questionId: bet.questionId._id,
          contractQuestionId: bet.questionId.contractQuestionId,
          question: bet.questionId.title,
          side: bet.outcome,
          ftrStaked: bet.ftrAmount,
          usdtStaked: bet.usdtAmount,
          timestamp: new Date(bet.createdAt),
          status: bet.questionId.status === 'settled'
            ? (bet.questionId.result === bet.outcome ? 'won' : 'lost')
            : 'active',
          payout: bet.payout,
          withdrawn: bet.withdrawn || false,
        };

        // If won and not withdrawn, but payout is missing or zero, fetch from blockchain
        if (position.status === 'won' && !position.withdrawn && 
            (!position.payout || (parseFloat(position.payout?.ftr || 0) === 0 && parseFloat(position.payout?.usdt || 0) === 0))) {
            try {
                // Only if contractQuestionId is valid
                if (position.contractQuestionId !== undefined && position.contractQuestionId !== null) {
                    const winnings = await web3Service.calculateWinnings(position.contractQuestionId, walletAddress);
                    // Update payout if winnings > 0
                    if (parseFloat(winnings.ftr) > 0 || parseFloat(winnings.usdt) > 0) {
                        position.payout = {
                            ftr: parseFloat(winnings.ftr),
                            usdt: parseFloat(winnings.usdt)
                        };
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch winnings from blockchain for position:', position.questionId, err);
            }
        }
        return position;
      }));
      setUserPositions(formattedPositions);
    } catch (error) {
      console.error('Failed to load user bets:', error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      const address = await web3Service.connectWallet();
      setWalletAddress(address);
      showToast('Wallet connected successfully!');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      let errorMessage = 'Failed to connect wallet';

      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message.split('(')[0].trim();
      }

      showToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setUserPositions([]);
    showToast('Wallet disconnected');
  };

  const handlePlaceBet = async (questionId, side) => {
    if (!walletAddress) {
      showToast('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      const question = questions.find(q => q.id === questionId);

      showToast('Checking if bet already placed...');
      const existingBet = await web3Service.getUserBet(question.contractQuestionId, walletAddress);

      if (existingBet && existingBet.hasBet) {
        showToast('Bet already placed');
        setIsLoading(false);
        return;
      }

      showToast('Checking token balances...');
      const balances = await web3Service.checkBalances(walletAddress);

      if (!balances.hasSufficientBalance) {
        let errorMessage = 'Insufficient balance: ';
        const missingTokens = [];

        if (!balances.hasFtrBalance) {
          missingTokens.push(`FTR (have ${parseFloat(balances.ftrBalance).toFixed(2)}, need 1)`);
        }
        if (!balances.hasUsdtBalance) {
          missingTokens.push(`USDT (have ${parseFloat(balances.usdtBalance).toFixed(2)}, need 1)`);
        }

        errorMessage += missingTokens.join(' and ');
        showToast(errorMessage);
        setIsLoading(false);
        return;
      }

      showToast('Checking token approvals...');
      const approvals = await web3Service.checkApprovals(walletAddress);

      if (!approvals.ftrApproved || !approvals.usdtApproved) {
        showToast('Approving tokens...');
        await web3Service.approveTokens();
        showToast('Tokens approved! Placing bet...');
      } else {
        showToast('Placing bet...');
      }

      const txHash = await web3Service.placeBet(question.contractQuestionId, side);

      showToast('Recording bet...');
      await api.recordBet({
        contractQuestionId: question.contractQuestionId,
        questionId: questionId,
        userAddress: walletAddress,
        outcome: side,
        transactionHash: txHash,
      });

      showToast(`Bet placed successfully on ${side.toUpperCase()}!`);
      await loadQuestions();
      await loadUserBets();
    } catch (error) {
      console.error('Failed to place bet:', error);
      let errorMessage = 'Failed to place bet';

      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        if (error.message.includes('Already placed bet')) {
          errorMessage = 'Bet already placed';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction cancelled';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds';
        } else {
          errorMessage = error.message.split('(')[0].trim();
        }
      }

      showToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (questionId) => {
    if (!walletAddress) {
      showToast('Please connect your wallet first');
      return;
    }

    const position = userPositions.find(p => p.questionId === questionId);
    if (!position || position.status !== 'won' || position.withdrawn) {
      return;
    }

    if (!position.contractQuestionId && position.contractQuestionId !== 0) {
      showToast('Unable to withdraw: question not found on blockchain');
      return;
    }

    try {
      setIsLoading(true);
      showToast('Calculating winnings...');

      const winnings = await web3Service.calculateWinnings(
        position.contractQuestionId,
        walletAddress
      );

      if (parseFloat(winnings.ftr) === 0 && parseFloat(winnings.usdt) === 0) {
        showToast('No winnings available to withdraw');
        setIsLoading(false);
        return;
      }

      showToast('Processing withdrawal...');
      const txHash = await web3Service.withdrawWinnings(position.contractQuestionId);

      showToast('Recording withdrawal...');
      await api.recordWithdrawal({
        questionId: questionId,
        userAddress: walletAddress,
        ftrAmount: winnings.ftr,
        usdtAmount: winnings.usdt,
        transactionHash: txHash,
      });

      showToast(`Successfully withdrawn ${parseFloat(winnings.ftr).toFixed(2)} FTR + ${parseFloat(winnings.usdt).toFixed(2)} USDT!`);
      await loadUserBets();
    } catch (error) {
      console.error('Failed to withdraw:', error);
      let errorMessage = 'Failed to withdraw winnings';

      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction cancelled';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds';
        } else {
          errorMessage = error.message.split('(')[0].trim();
        }
      }

      showToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  const showToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 6000);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
      isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-zinc-900'
    }`}>
      {/* Dynamic Background with Grid and Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 bg-grid-pattern opacity-[0.12] ${isDark ? 'invert' : ''}`}></div>
        <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[130px] opacity-15 animate-pulse-slow ${
          isDark ? 'bg-yellow-600/20' : 'bg-yellow-400/30'
        }`}></div>
        <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[130px] opacity-15 animate-pulse-slow delay-700 ${
          isDark ? 'bg-yellow-700/20' : 'bg-yellow-400/30'
        }`}></div>
        <div className={`absolute top-[30%] left-[40%] w-[40%] h-[40%] rounded-full blur-[110px] opacity-10 animate-float ${
          isDark ? 'bg-yellow-500/15' : 'bg-yellow-300/20'
        }`}></div>
      </div>

      <Header
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        positionsCount={activePositionsCount}
        isLoading={isLoading}
        isAdmin={isAdmin}
      />

      {showNotification && (
        <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
          <div className={`glass-card border-l-4 border-yellow-500 rounded-xl shadow-2xl p-5 flex items-center space-x-4 max-w-md ${
            isDark ? 'bg-zinc-800/90' : 'bg-white/90'
          }`}>
            <div className="p-2 bg-yellow-500/10 rounded-full">
              <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            </div>
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{notificationMessage}</p>
          </div>
        </div>
      )}

      <main className="relative z-10 pt-24 pb-20 space-y-24">
        <Hero stats={platformStats} />

        <section id="active" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28 animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="text-left max-w-2xl">
              <div className="inline-flex items-center space-x-2 mb-4 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 tracking-wider uppercase">Live Markets</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">Prediction Pools</span>
              </h2>
              <p className={`text-lg md:text-xl leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Place your predictions with transparent settlement powered by BSC blockchain.
              </p>
            </div>
            
            {questions.length > 6 && (
              <div className={`flex space-x-3 p-1.5 rounded-2xl backdrop-blur-sm border ${
                isDark 
                  ? 'bg-black/20 border-white/5' 
                  : 'bg-white border-zinc-200 shadow-sm'
              }`}>
                <button 
                  onClick={() => setQuestionsPage(p => Math.max(0, p - 1))}
                  disabled={questionsPage === 0}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    questionsPage === 0
                      ? 'opacity-50 cursor-not-allowed text-zinc-400 dark:text-zinc-600'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm hover:shadow-md text-zinc-900 dark:text-white'
                  }`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center px-4 font-mono font-bold text-lg">
                  <span className="text-yellow-500">{questionsPage + 1}</span>
                  <span className="mx-2 opacity-30 text-zinc-400 dark:text-zinc-600">/</span>
                  <span className="opacity-70 text-zinc-600 dark:text-zinc-400">{Math.ceil(questions.length / 6)}</span>
                </div>
                <button 
                  onClick={() => setQuestionsPage(p => Math.min(Math.ceil(questions.length / 6) - 1, p + 1))}
                  disabled={questionsPage >= Math.ceil(questions.length / 6) - 1}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    questionsPage >= Math.ceil(questions.length / 6) - 1
                      ? 'opacity-50 cursor-not-allowed text-zinc-400 dark:text-zinc-600'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm hover:shadow-md text-zinc-900 dark:text-white'
                  }`}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="relative w-20 h-20">
                <div className={`absolute inset-0 border-4 rounded-full ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}></div>
                <div className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className={`text-sm font-medium animate-pulse ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Loading markets...</p>
            </div>
          ) : questions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {questions
                .filter(q => q.status === 'open' || q.status === 'active')
                .slice(questionsPage * 6, (questionsPage + 1) * 6)
                .map((q) => (
                  <BettingQuestionCard
                    key={q.id}
                    question={q}
                    onPlaceBet={handlePlaceBet}
                    walletConnected={!!walletAddress}
                    isLoading={isLoading}
                  />
                ))}
            </div>
          ) : (
            <div className={`text-center py-32 rounded-3xl border-2 border-dashed ${
              isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-300 bg-white/50'
            }`}>
              <div className="w-20 h-20 mx-auto mb-6 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>No Active Markets</h3>
              <p className={isDark ? 'text-zinc-500' : 'text-zinc-600'}>Check back later for new prediction pools.</p>
            </div>
          )}
        </section>
      </main>

      <UserPositions
        positions={walletAddress ? userPositions : []}
        walletConnected={!!walletAddress}
        onWithdraw={handleWithdraw}
        isLoading={isLoading}
        onConnectWallet={handleConnectWallet}
      />

      <AdminPanel
        walletAddress={walletAddress}
        isLoading={isLoading}
        onShowToast={showToast}
        onRefresh={loadQuestions}
      />

      <HowItWorks />

      <footer className={`py-16 border-t transition-colors duration-300 ${
        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <img src="/ProPred.png" alt="ProPred" className="w-10 h-10 object-contain" />
                <span className="text-2xl font-black bg-gradient-to-r from-yellow-500 to-yellow-600 text-transparent bg-clip-text tracking-tight">ProPred</span>
              </div>
              <p className={`leading-relaxed max-w-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Decentralized prediction pools on Binance Smart Chain with transparent, trustless settlements.
              </p>
              <div className="inline-flex items-center space-x-3 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-500">Powered by BSC</span>
              </div>
            </div>

            <div>
              <h4 className={`font-bold mb-6 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Platform</h4>
              <ul className="space-y-4">
                <li><a href="#active" className={`transition-colors hover:translate-x-1 inline-block ${
                  isDark ? 'text-zinc-400 hover:text-yellow-400' : 'text-zinc-600 hover:text-yellow-600'
                }`}>Active Markets</a></li>
                <li><a href="#positions" className={`transition-colors hover:translate-x-1 inline-block ${
                  isDark ? 'text-zinc-400 hover:text-yellow-400' : 'text-zinc-600 hover:text-yellow-600'
                }`}>My Positions</a></li>
                <li><a href="#how" className={`transition-colors hover:translate-x-1 inline-block ${
                  isDark ? 'text-zinc-400 hover:text-yellow-400' : 'text-zinc-600 hover:text-yellow-600'
                }`}>How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className={`font-bold mb-6 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Resources</h4>
              <ul className="space-y-4">
                <li><a href="#" className={`transition-colors hover:translate-x-1 inline-block ${
                  isDark ? 'text-zinc-400 hover:text-yellow-400' : 'text-zinc-600 hover:text-yellow-600'
                }`}>Documentation</a></li>
                <li><a href="#" className={`transition-colors hover:translate-x-1 inline-block ${
                  isDark ? 'text-zinc-400 hover:text-yellow-400' : 'text-zinc-600 hover:text-yellow-600'
                }`}>Contract</a></li>
                <li><a href="#" className={`transition-colors hover:translate-x-1 inline-block ${
                  isDark ? 'text-zinc-400 hover:text-yellow-400' : 'text-zinc-600 hover:text-yellow-600'
                }`}>Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className={`pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${
            isDark ? 'border-zinc-800' : 'border-gray-100'
          }`}>
            <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              &copy; {new Date().getFullYear()} ProPred. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className={`text-sm transition-colors ${
                isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'
              }`}>Privacy Policy</a>
              <a href="#" className={`text-sm transition-colors ${
                isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'
              }`}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
