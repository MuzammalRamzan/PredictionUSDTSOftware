import { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LanguageSwitcher from './components/LanguageSwitcher';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import Contactus from './components/Contactus';
import BettingQuestionCard from './components/BettingQuestion';
import TermsandPolicy from "./components/TermsandPolicy"
import AboutsPage from "./components/AboutsPage"
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import UserPositions from './components/UserPositions';
import HowItWorks from './components/HowItWorks';
import AdminPanel from './components/AdminPanel';
import FilterBar from './components/FilterBar';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from './services/api';
import { web3Service } from './services/web3';
import { isAdminAddress } from './config/admin';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [walletAddress, setWalletAddress] = useState();
  const [questions, setQuestions] = useState([]);
  const [userPositions, setUserPositions] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalVolume: { usdt: 0 },
    totalQuestions: 0,
    activeQuestions: 0,
    totalParticipants: 0,
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsPage, setQuestionsPage] = useState(0);
  const [filters, setFilters] = useState({ category: '', subcategory: '', country: '', level: '' });

  const [isBettingModalOpen, setIsBettingModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState({ questionId: null, outcomeIndex: null, outcomeName: '' });
  const [betAmounts, setBetAmounts] = useState({ usdt: '1' });

  const activePositionsCount = userPositions.filter(p => p.status === 'active').length;
  const isAdmin = isAdminAddress(walletAddress);

  useEffect(() => {
    loadQuestions();
  }, [filters]);

  useEffect(() => {
    loadQuestions();
    loadPlatformStats();
    checkWalletConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setWalletAddress(null);
          setUserPositions([]);
          showToast(t('toast.walletDisconnected'));
        } else if (accounts[0] !== walletAddress) {
          setWalletAddress(accounts[0]);
          showToast(t('toast.accountSwitched'));
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
      const data = await api.getAllQuestions('open', filters.category || null, filters);
      const formattedQuestions = data.map(q => ({
        id: q._id,
        contractQuestionId: q.contractQuestionId,
        question: q.title,
        outcomes: q.outcomes,
        category: q.category,
        endTime: new Date(q.deadline),
        status: q.status,
        outcomeStats: q.outcomeStats,
        result: q.result,
        totalLimit: q.totalLimit,
        betAmountLimit: q.betAmountLimit,
        minBetAmount: q.minBetAmount,
      }));
      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Failed to load questions:', error);
      showToast(t('toast.loadQuestionsFailed'));
    }
  };

  const loadPlatformStats = async () => {
    try {
      const stats = await api.getPlatformStats();
      setPlatformStats({
        totalVolume: {
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
          outcomes: bet.questionId.outcomes,
          side: bet.outcome,
          usdtStaked: bet.usdtAmount,
          timestamp: new Date(bet.createdAt),
          status: bet.questionId.status === 'cancelled'
            ? 'cancelled'
            : bet.questionId.status === 'settled'
              ? (bet.questionId.result === bet.outcome ? 'won' : 'lost')
              : 'active',
          payout: bet.payout,
          withdrawn: bet.withdrawn || false,
        };

        // If won and not withdrawn, but payout is missing or zero, fetch from blockchain
        if ((position.status === 'won' || position.status === 'cancelled') && !position.withdrawn && 
            (!position.payout || (parseFloat(position.payout?.usdt || 0) === 0))) {
            try {
                // Only if contractQuestionId is valid (including 0)
                if (position.contractQuestionId !== undefined && position.contractQuestionId !== null) {
                    if (position.status === 'won') {
                        const winnings = await web3Service.calculateWinnings(position.contractQuestionId, walletAddress);
                        // Update payout if winnings > 0
                        if (parseFloat(winnings.usdt) > 0) {
                            position.payout = {
                                usdt: parseFloat(winnings.usdt)
                            };
                        }
                    } else if (position.status === 'cancelled') {
                         // For cancelled, the refund is the staked amount
                         position.payout = {
                            usdt: position.usdtStaked
                         };
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch winnings/refund for position:', position.questionId, err);
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
      showToast(t('toast.walletConnected'));
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      let errorMessage = t('toast.connectFailed');

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
    showToast(t('toast.walletDisconnected'));
  };

  const handlePlaceBetClick = (questionId, outcomeIndex, outcomeName) => {
    if (!walletAddress) {
      showToast(t('toast.connectFirst'));
      return;
    }
    setSelectedBet({ questionId, outcomeIndex, outcomeName });
    setBetAmounts({ usdt: '1' }); // Reset to minimums
    setIsBettingModalOpen(true);
  };

  const handleConfirmBet = async () => {
    const { questionId, outcomeIndex, outcomeName } = selectedBet;
    const { usdt } = betAmounts;

    if (!questionId || outcomeIndex === null) return;

    const question = questions.find(q => q.id === questionId);
    const minBet = question.minBetAmount > 0 ? question.minBetAmount : 0; // 0 means any amount > 0

    if (parseFloat(usdt) <= 0) {
        showToast("Bet amount must be greater than 0");
        return;
    }

    if (minBet > 0 && parseFloat(usdt) < minBet) {
        showToast(t('toast.minBetLimit', { amount: minBet }) || `Minimum bet amount is ${minBet} USDT`);
        return;
    }

    try {
      setIsLoading(true);
      setIsBettingModalOpen(false); // Close modal

      // Enforce Limits
      if (question.betAmountLimit > 0 && parseFloat(usdt) > question.betAmountLimit) {
        showToast(`Bet amount exceeds limit of ${question.betAmountLimit} USDT`);
        setIsLoading(false);
        return;
      }

      const currentParticipants = question.outcomeStats
        ? question.outcomeStats.reduce((acc, stat) => acc + (stat.participants || 0), 0)
        : 0;

      if (question.totalLimit > 0 && (currentParticipants + 1) > question.totalLimit) {
        showToast(`Total participants limit of ${question.totalLimit} reached for this question`);
        setIsLoading(false);
        return;
      }

      showToast(t('toast.checkingPrediction'));
      
      showToast(t('toast.checkingBalances'));
      const balances = await web3Service.checkBalances(walletAddress, usdt);
      if (!balances.hasSufficientBalance) {
        showToast(t('toast.insufficientBalanceNeed', { usdt }));
        setIsLoading(false);
        return;
      }

      showToast(t('toast.checkingApprovals'));
      const approvals = await web3Service.checkApprovals(walletAddress, usdt);

      if (!approvals.usdtApproved) {
        showToast(t('toast.approving'));
        await web3Service.approveTokens();
        showToast(t('toast.approvedPlacing'));
      } else {
        showToast(t('toast.placing'));
      }

      const txHash = await web3Service.placeBet(question.contractQuestionId, outcomeIndex, usdt);

      showToast(t('toast.recording'));
      await api.recordBet({
        contractQuestionId: question.contractQuestionId,
        questionId: questionId,
        userAddress: walletAddress,
        outcome: outcomeIndex, // Send index to backend
        usdtAmount: parseFloat(usdt),
        transactionHash: txHash,
      });

      showToast(t('toast.placedSuccess', { side: outcomeName }));
      await loadQuestions();
      await loadUserBets();
    } catch (error) {
      console.error('Failed to place bet:', error);
      let errorMessage = t('toast.placeFailed');

      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.data && error.data.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        if (error.message.includes('Already placed bet')) {
          errorMessage = t('toast.alreadyPlaced');
        } else if (error.message.includes('user rejected')) {
          errorMessage = t('toast.txCancelled');
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = t('toast.insufficientFunds');
        } else {
          // Clean up error message
          errorMessage = error.message.split('(')[0].trim();
          // If message is too generic or empty, use default
          if (!errorMessage || errorMessage === 'execution reverted') {
             errorMessage = t('toast.txFailed');
          }
        }
      }

      showToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (questionId) => {
    if (!walletAddress) {
      showToast(t('toast.connectFirst'));
      return;
    }

    const position = userPositions.find(p => p.questionId === questionId);
    if (!position || (position.status !== 'won' && position.status !== 'cancelled') || position.withdrawn) {
      return;
    }

    if (!position.contractQuestionId && position.contractQuestionId !== 0) {
      showToast(t('toast.unableToWithdraw'));
      return;
    }

    try {
      setIsLoading(true);
      
      let txHash;
      let amount;

      if (position.status === 'cancelled') {
        showToast(t('toast.processingRefund') || "Processing refund...");
        txHash = await web3Service.claimRefund(position.contractQuestionId);
        amount = position.usdtStaked;
      } else {
        showToast(t('toast.calculatingWinnings'));
        const winnings = await web3Service.calculateWinnings(
          position.contractQuestionId,
          walletAddress
        );

        if (parseFloat(winnings.usdt) === 0) {
          showToast(t('toast.noWinnings'));
          setIsLoading(false);
          return;
        }
        amount = winnings.usdt;
        
        showToast(t('toast.processingWithdrawal'));
        txHash = await web3Service.withdrawWinnings(position.contractQuestionId);
      }

      showToast(t('toast.recordingWithdrawal'));
      await api.recordWithdrawal({
        questionId: questionId,
        userAddress: walletAddress,
        usdtAmount: amount,
        transactionHash: txHash,
      });

      showToast(t('toast.withdrawSuccess', { usdt: parseFloat(amount).toFixed(2) }));
      await loadUserBets();
    } catch (error) {
      console.error('Failed to withdraw:', error);
      let errorMessage = t('toast.withdrawFailed');

      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        if (error.message.includes('user rejected')) {
          errorMessage = t('toast.txCancelled');
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = t('toast.insufficientFunds');
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
        <div className="fixed top-24 right-6 z-[100] animate-slide-in-right">
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

      <Routes>
        <Route path="/" element={
          <>
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
                      <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 tracking-wider uppercase">{t('home.liveMarkets')}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                      <Trans i18nKey="home.activePools">
                        Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">Prediction Pools</span>
                      </Trans>
                    </h2>
                    <p className={`text-lg md:text-xl leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {t('home.description')}
                    </p>
                  </div>
                </div>

                {/* Advanced Filters */}
                <FilterBar filters={filters} setFilters={setFilters} />
                  
                <div className="flex justify-end mb-6">
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
                    <p className={`text-sm font-medium animate-pulse ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{t('home.loading')}</p>
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
                          onPlaceBet={handlePlaceBetClick}
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
                    <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t('home.noMarkets')}</h3>
                    <p className={isDark ? 'text-zinc-500' : 'text-zinc-600'}>{t('home.checkBack')}</p>
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

            <AboutUs />
            <HowItWorks />
           
          </>
        } />
        
        <Route path="/admin" element={
          <AdminPanel
            walletAddress={walletAddress}
            isLoading={isLoading}
            onShowToast={showToast}
            onRefresh={loadQuestions}
          />
          
        } />
        <Route path="/TermsandPolicy" element={<TermsandPolicy />} />
         <Route path="/aboutus" element={<AboutsPage />} />

      </Routes>

      {/* Betting Modal */}
      {isBettingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl scale-100 animate-scale-in ${
            isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {t('modal.placeBetTitle', { outcomeName: selectedBet.outcomeName })}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {t('modal.usdtAmountLabel')}
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={betAmounts.usdt}
                  onChange={(e) => setBetAmounts(prev => ({ ...prev, usdt: e.target.value }))}
                  className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all no-spinner ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsBettingModalOpen(false)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {t('modal.cancel')}
                </button>
                <button
                  onClick={handleConfirmBet}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl font-bold bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('modal.processing') : t('modal.confirmBet')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Contactus />

    <footer className={`py-16 border-t transition-colors duration-300 ${ isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}`}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid md:grid-cols-4 gap-12 mb-16">

      {/* LEFT SECTION */}
      <div className="md:col-span-2 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black bg-gradient-to-r from-yellow-500 to-yellow-600 text-transparent bg-clip-text tracking-tight">
              PerBet
            </span>
          </div>

          <p
            className={`leading-relaxed max-w-sm ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            {t('footer.description')}
          </p>

          <div className="inline-flex items-center space-x-3 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-500">
              {t('footer.poweredBy')}
            </span>
          </div>
        </div>

        {/* ✅ SOCIAL MEDIA LINKS (BOTTOM LEFT) */}
          <div className="flex items-center gap-4 pt-6">
            <a
              href="https://www.facebook.com/perbet.live"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full transition-colors ${
                isDark
                  ? 'text-zinc-500 hover:text-yellow-400 hover:bg-zinc-800'
                  : 'text-zinc-500 hover:text-yellow-600 hover:bg-zinc-100'
              }`}
            >
              <Facebook size={18} />
            </a>

            <a
              href="https://www.instagram.com/perbet.live/"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full transition-colors ${
                isDark
                  ? 'text-zinc-500 hover:text-yellow-400 hover:bg-zinc-800'
                  : 'text-zinc-500 hover:text-yellow-600 hover:bg-zinc-100'
              }`}
            >
              <Instagram size={18} />
            </a>

            <a href="https://www.youtube.com/@PerBetlive" target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full transition-colors ${
                isDark
                  ? 'text-zinc-500 hover:text-yellow-400 hover:bg-zinc-800'
                  : 'text-zinc-500 hover:text-yellow-600 hover:bg-zinc-100'
              }`}
            >
              <Youtube size={18} />
            </a>

            <a
              href="https://x.com/perbetlive"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full transition-colors ${
                isDark
                  ? 'text-zinc-500 hover:text-yellow-400 hover:bg-zinc-800'
                  : 'text-zinc-500 hover:text-yellow-600 hover:bg-zinc-100'
              }`}
            >
              <Twitter size={18} />
            </a>
          </div>

      </div>

      {/* PLATFORM */}
      <div>
        <h4
          className={`font-bold mb-6 text-lg ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          {t('footer.platform')}
        </h4>
        <ul className="space-y-4">
          <li>
            <a
              href="#active"
              className={`transition-colors hover:translate-x-1 inline-block ${
                isDark
                  ? 'text-zinc-400 hover:text-yellow-400'
                  : 'text-zinc-600 hover:text-yellow-600'
              }`}
            >
              {t('footer.activeMarkets')}
            </a>
          </li>
          <li>
            <a
              href="#positions"
              className={`transition-colors hover:translate-x-1 inline-block ${
                isDark
                  ? 'text-zinc-400 hover:text-yellow-400'
                  : 'text-zinc-600 hover:text-yellow-600'
              }`}
            >
              {t('footer.myPositions')}
            </a>
          </li>
          <li>
            <a
              href="#how"
              className={`transition-colors hover:translate-x-1 inline-block ${
                isDark
                  ? 'text-zinc-400 hover:text-yellow-400'
                  : 'text-zinc-600 hover:text-yellow-600'
              }`}
            >
              {t('footer.howItWorks')}
            </a>
          </li>
        </ul>
      </div>

      {/* RESOURCES */}
      <div>
        <h4
          className={`font-bold mb-6 text-lg ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          {t('footer.resources')}
        </h4>
        <ul className="space-y-4">
          <li>
            <a
              href="#"
              className={`transition-colors hover:translate-x-1 inline-block ${
                isDark
                  ? 'text-zinc-400 hover:text-yellow-400'
                  : 'text-zinc-600 hover:text-yellow-600'
              }`}
            >
              {t('footer.documentation')}
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`transition-colors hover:translate-x-1 inline-block ${
                isDark
                  ? 'text-zinc-400 hover:text-yellow-400'
                  : 'text-zinc-600 hover:text-yellow-600'
              }`}
            >
              {t('footer.contract')}
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`transition-colors hover:translate-x-1 inline-block ${
                isDark
                  ? 'text-zinc-400 hover:text-yellow-400'
                  : 'text-zinc-600 hover:text-yellow-600'
              }`}
            >
              {t('footer.support')}
            </a>
          </li>
        </ul>
      </div>
    </div>

    {/* BOTTOM BAR (UNCHANGED) */}
    <div
      className={`pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${
        isDark ? 'border-zinc-800' : 'border-gray-100'
      }`}
    >
      <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
        &copy; {new Date().getFullYear()} {t('footer.rightsReserved')}
      </p>

      <div className="flex items-center gap-6">
        <div className="flex space-x-6">
          <a
            href="/TermsandPolicy"
            className={`text-sm transition-colors ${
              isDark
                ? 'text-zinc-500 hover:text-zinc-300'
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {t('footer.privacyPolicy')}
          </a>
          {/* <a
            href="#"
            className={`text-sm transition-colors ${
              isDark
                ? 'text-zinc-500 hover:text-zinc-300'
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {t('footer.termsOfService')}
          </a> */}
        </div>
        <LanguageSwitcher direction="up" />
      </div>
    </div>
  </div>
</footer>

    </div>
  );
}

export default App;
