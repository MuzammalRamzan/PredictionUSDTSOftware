import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import BettingQuestionCard from './components/BettingQuestion';
import UserPositions from './components/UserPositions';
import HowItWorks from './components/HowItWorks';
import AdminPanel from './components/AdminPanel';
import { AlertCircle } from 'lucide-react';
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
    totalVolume: { ocro: 0, usdt: 0 },
    totalQuestions: 0,
    activeQuestions: 0,
    totalParticipants: 0,
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
          ocro: q.totalYesOcro || 0,
          usdt: q.totalYesUsdt || 0,
          participants: q.yesCount || 0,
        },
        noPool: {
          ocro: q.totalNoOcro || 0,
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
          ocro: stats.totalVolumeOcro || 0,
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
      const formattedPositions = bets.map(bet => ({
        questionId: bet.questionId._id,
        contractQuestionId: bet.questionId.contractQuestionId,
        question: bet.questionId.title,
        side: bet.outcome,
        ocroStaked: bet.ocroAmount,
        usdtStaked: bet.usdtAmount,
        timestamp: new Date(bet.createdAt),
        status: bet.questionId.status === 'settled'
          ? (bet.questionId.result === bet.outcome ? 'won' : 'lost')
          : 'active',
        payout: bet.payout,
        withdrawn: bet.withdrawn || false,
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

      if (parseFloat(winnings.ocro) === 0 && parseFloat(winnings.usdt) === 0) {
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
        ocroAmount: winnings.ocro,
        usdtAmount: winnings.usdt,
        transactionHash: txHash,
      });

      showToast(`Successfully withdrawn ${parseFloat(winnings.ocro).toFixed(2)} FTR + ${parseFloat(winnings.usdt).toFixed(2)} USDT!`);
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

  const handleSettleQuestion = async (questionId, result) => {
    if (!walletAddress) {
      showToast('Please connect your wallet first');
      return;
    }

    if (!result) {
      showToast('Please select a result');
      return;
    }

    try {
      setIsLoading(true);
      showToast('Settling question on blockchain...');

      await api.settleQuestion(questionId, result);

      showToast(`Question settled successfully! Result: ${result.toUpperCase()}`);
      await loadQuestions();
    } catch (error) {
      console.error('Failed to settle question:', error);
      let errorMessage = 'Failed to settle question';

      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        if (error.message.includes('Not owner')) {
          errorMessage = 'Only admin can settle questions';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction cancelled';
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
    <div className={`min-h-screen ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-zinc-900 to-gray-900'
        : 'bg-gradient-to-br from-red-50 via-white to-orange-50'
    }`}>
      <Header
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        positionsCount={activePositionsCount}
        isLoading={isLoading}
        isAdmin={isAdmin}
      />

      {showNotification && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
          <div className={`border-l-4 border-red-400 rounded-lg shadow-2xl p-4 flex items-center space-x-3 max-w-md backdrop-blur-xl ${
            isDark ? 'bg-zinc-800' : 'bg-white'
          }`}>
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{notificationMessage}</p>
          </div>
        </div>
      )}

      <Hero stats={platformStats} />

      <section id="active" className={`py-16 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-b from-white to-red-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-red-600 to-red-700 text-transparent bg-clip-text text-sm font-bold tracking-wider uppercase">Live Pools</span>
            </div>
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Active Prediction Markets</h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Place your predictions with transparent settlement powered by BSC blockchain
            </p>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12">
              <div className={`rounded-xl border-2 p-12 max-w-md mx-auto ${
                isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-red-100'
              }`}>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>No active questions at the moment. Check back soon!</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {questions.map((question) => (
                <BettingQuestionCard
                  key={question.id}
                  question={question}
                  onPlaceBet={handlePlaceBet}
                  walletConnected={!!walletAddress}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <UserPositions
        positions={walletAddress ? userPositions : []}
        walletConnected={!!walletAddress}
        onWithdraw={handleWithdraw}
        isLoading={isLoading}
      />

      <AdminPanel
        walletAddress={walletAddress}
        onSettleQuestion={handleSettleQuestion}
        isLoading={isLoading}
      />

      <HowItWorks />

      <footer className={`py-16 border-t ${
        isDark
          ? 'bg-gray-950 text-gray-400 border-gray-800'
          : 'bg-red-50 text-gray-600 border-red-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text">FTR Predict</h3>
              <p className={`mb-6 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Decentralized prediction pools on Binance Smart Chain with transparent, trustless settlements.
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Powered by BSC</span>
              </div>
            </div>

            <div>
              <h4 className={`font-bold mb-6 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Markets</h4>
              <ul className="space-y-3">
                <li><a href="#active" className={`transition-colors text-sm ${
                  isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
                }`}>Active Markets</a></li>
                <li><a href="#positions" className={`transition-colors text-sm ${
                  isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
                }`}>My Positions</a></li>
                <li><a href="#how" className={`transition-colors text-sm ${
                  isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
                }`}>How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className={`font-bold mb-6 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className={`transition-colors text-sm ${
                  isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
                }`}>Documentation</a></li>
                <li><a href="#" className={`transition-colors text-sm ${
                  isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
                }`}>Smart Contract</a></li>
                <li><a href="#" className={`transition-colors text-sm ${
                  isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
                }`}>FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className={`border-t pt-8 text-center ${isDark ? 'border-gray-800' : 'border-red-200'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>&copy; 2026 FTR Predict. All rights reserved. Built on Binance Smart Chain.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
