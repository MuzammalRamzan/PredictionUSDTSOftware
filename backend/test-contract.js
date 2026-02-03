import { ethers } from 'ethers';
import dotenv from 'dotenv';
import BettingPoolABI from './config/BettingPoolABI.json' with { type: 'json' };

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, BettingPoolABI, wallet);

async function testContract() {
  console.log('='.repeat(60));
  console.log('CONTRACT TEST');
  console.log('='.repeat(60));

  console.log('\nWallet Address:', wallet.address);
  console.log('Contract Address:', process.env.CONTRACT_ADDRESS);

  const balance = await provider.getBalance(wallet.address);
  console.log('BNB Balance:', ethers.formatEther(balance), 'BNB');

  try {
    console.log('\n' + '='.repeat(60));
    console.log('READING CONTRACT DATA');
    console.log('='.repeat(60));

    const questionCount = await contract.questionCount();
    console.log('Total Questions:', questionCount.toString());

    const owner = await contract.owner();
    console.log('Contract Owner:', owner);
    console.log('Is Owner?', owner.toLowerCase() === wallet.address.toLowerCase());

    const ftrToken = await contract.ftrToken();
    const usdtToken = await contract.usdtToken();
    console.log('FTR Token:', ftrToken);
    console.log('USDT Token:', usdtToken);

    console.log('\n' + '='.repeat(60));
    console.log('CREATING TEST QUESTION');
    console.log('='.repeat(60));

    const title = "Will Bitcoin reach $100k by end of 2026?";
    const deadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days from now

    console.log('Title:', title);
    console.log('Deadline:', new Date(deadline * 1000).toISOString());

    const tx = await contract.createQuestion(title, deadline);
    console.log('\nTransaction Hash:', tx.hash);
    console.log('Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed!');
    console.log('Gas Used:', receipt.gasUsed.toString());

    const newQuestionCount = await contract.questionCount();
    console.log('\nTotal Questions:', newQuestionCount.toString());

    const questionId = Number(newQuestionCount) - 1;
    const question = await contract.questions(questionId);

    console.log('\n' + '='.repeat(60));
    console.log('QUESTION DETAILS');
    console.log('='.repeat(60));
    console.log('Question ID:', questionId);
    console.log('Title:', question.title);
    console.log('Deadline:', new Date(Number(question.deadline) * 1000).toISOString());
    console.log('Is Settled:', question.isSettled);
    console.log('Exists:', question.exists);

    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETED SUCCESSFULLY ✅');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.data) {
      console.error('Error Data:', error.data);
    }
  }
}

testContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
