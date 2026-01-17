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

function App() {
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

      if (!approvals.ocroApproved || !approvals.usdtApproved) {
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

    try {
      setIsLoading(true);
      showToast('Processing withdrawal...');

      const question = questions.find(q => q.id === questionId);
      const txHash = await web3Service.withdrawWinnings(question.contractQuestionId);

      showToast('Recording withdrawal...');
      const winnings = await web3Service.calculateWinnings(
        question.contractQuestionId,
        walletAddress
      );

      await api.recordWithdrawal({
        questionId: questionId,
        userAddress: walletAddress,
        ocroAmount: winnings.ocro,
        usdtAmount: winnings.usdt,
        transactionHash: txHash,
      });

      showToast(`Successfully withdrawn ${parseFloat(winnings.ocro).toFixed(2)} OCRO + ${parseFloat(winnings.usdt).toFixed(2)} USDT!`);
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
    <div className="min-h-screen bg-gray-50">
      <Header
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        positionsCount={activePositionsCount}
        isLoading={isLoading}
      />

      {showNotification && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
          <div className="bg-white border-l-4 border-blue-900 rounded-lg shadow-xl p-4 flex items-center space-x-3 max-w-md">
            <AlertCircle className="w-5 h-5 text-blue-900 flex-shrink-0" />
            <p className="text-sm text-gray-900 font-medium">{notificationMessage}</p>
          </div>
        </div>
      )}

      <Hero stats={platformStats} />

      <section id="active" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Active Prediction Pools</h2>
            <p className="text-gray-600">
              Place your predictions with transparent settlement powered by BSC
            </p>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No active questions at the moment. Check back soon!</p>
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

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-white mb-4">OCRO Predict</h3>
              <p className="text-gray-400 mb-4">
                Decentralized prediction pools on Binance Smart Chain with transparent settlements.
              </p>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Powered by BSC</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Markets</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#active" className="hover:text-blue-400 transition-colors">Active Markets</a></li>
                <li><a href="#positions" className="hover:text-blue-400 transition-colors">My Positions</a></li>
                <li><a href="#how" className="hover:text-blue-400 transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Smart Contract</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 OCRO Predict. All rights reserved. Built on Binance Smart Chain.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
