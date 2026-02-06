// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BettingPool is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Question {
        string title;
        uint256 deadline;
        bool isSettled;
        uint256 result; // Index of winning outcome (0, 1, 2)
        uint256 outcomeCount; // 2 or 3
        uint256[3] outcomeUsdtTotals;
        uint256[3] outcomeParticipants;
        bool exists;
        bool isCancelled;
    }

    struct Bet {
        address user;
        uint256 outcome; // Index of chosen outcome
        uint256 usdtAmount;
        bool withdrawn;
    }

    IERC20 public immutable usdtToken;
    address public owner;
    address public developerAddress;
    uint256 public constant ADMIN_FEE_PERCENT = 10;

    // Minimum bet amounts
    uint256 public constant MIN_USDT_AMOUNT = 1 * 10 ** 18; // 1 USDT (assuming 18 decimals)

    uint256 public questionCount;
    mapping(uint256 => Question) public questions;
    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(uint256 => address[]) public questionBettors;

    uint256 public adminFeesUsdt;
    uint256 public totalUserLiabilities; // Track total USDT owed to users (active bets + winnings)

    event QuestionCreated(
        uint256 indexed questionId,
        string title,
        uint256 deadline,
        uint256 outcomeCount
    );
    event BetPlaced(
        uint256 indexed questionId,
        address indexed user,
        uint256 outcome,
        uint256 usdtAmount
    );
    event QuestionSettled(uint256 indexed questionId, uint256 result);
    event QuestionCancelled(uint256 indexed questionId);
    event RefundClaimed(
        uint256 indexed questionId,
        address indexed user,
        uint256 amount
    );
    event DeveloperAddressUpdated(
        address indexed oldAddress,
        address indexed newAddress
    );
    event OwnerAddressUpdated(
        address indexed oldAddress,
        address indexed newAddress
    );
    event WinningsWithdrawn(
        uint256 indexed questionId,
        address indexed user,
        uint256 usdtAmount
    );
    event AdminFeesWithdrawn(uint256 usdtAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _usdtToken, address _developerAddress) {
        usdtToken = IERC20(_usdtToken);
        owner = msg.sender;
        developerAddress = _developerAddress;
    }

    function createQuestion(
        string memory _title,
        uint256 _deadline,
        uint256 _outcomeCount
    ) external onlyOwner returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in future");
        require(
            _outcomeCount >= 2 && _outcomeCount <= 3,
            "Outcome count must be 2 or 3"
        );

        uint256 questionId = questionCount++;
        // Initialize arrays
        uint256[3] memory zeroArray;

        questions[questionId] = Question({
            title: _title,
            deadline: _deadline,
            isSettled: false,
            result: 0,
            outcomeCount: _outcomeCount,
            outcomeUsdtTotals: zeroArray,
            outcomeParticipants: zeroArray,
            exists: true,
            isCancelled: false
        });

        emit QuestionCreated(questionId, _title, _deadline, _outcomeCount);
        return questionId;
    }

    function placeBet(
        uint256 _questionId,
        uint256 _outcome,
        uint256 _usdtAmount
    ) external nonReentrant {
        Question storage question = questions[_questionId];
        require(question.exists, "Question does not exist");
        require(block.timestamp < question.deadline, "Betting closed");
        require(!question.isSettled, "Question already settled");
        require(!question.isCancelled, "Question is cancelled");
        require(
            bets[_questionId][msg.sender].user == address(0),
            "Already placed bet"
        );
        require(_outcome < question.outcomeCount, "Invalid outcome index");
        require(_usdtAmount >= MIN_USDT_AMOUNT, "Min 1 USDT required");

        // Transfer tokens from user
        usdtToken.safeTransferFrom(msg.sender, address(this), _usdtAmount);

        // Update user liabilities
        totalUserLiabilities += _usdtAmount;

        // Record bet
        bets[_questionId][msg.sender] = Bet({
            user: msg.sender,
            outcome: _outcome,
            usdtAmount: _usdtAmount,
            withdrawn: false
        });

        questionBettors[_questionId].push(msg.sender);

        // Update pool totals
        question.outcomeUsdtTotals[_outcome] += _usdtAmount;
        question.outcomeParticipants[_outcome]++;

        emit BetPlaced(_questionId, msg.sender, _outcome, _usdtAmount);
    }

    function settleQuestion(
        uint256 _questionId,
        uint256 _result
    ) external onlyOwner {
        Question storage question = questions[_questionId];
        require(question.exists, "Question does not exist");
        require(
            block.timestamp >= question.deadline,
            "Cannot settle before deadline"
        );
        require(!question.isSettled, "Already settled");
        require(!question.isCancelled, "Question is cancelled");
        require(_result < question.outcomeCount, "Invalid result index");

        question.isSettled = true;
        question.result = _result;

        // Calculate fees from losing pools
        uint256 totalLosingUsdt = 0;

        for (uint256 i = 0; i < question.outcomeCount; i++) {
            if (i != _result) {
                totalLosingUsdt += question.outcomeUsdtTotals[i];
            }
        }

        uint256 winningUsdt = question.outcomeUsdtTotals[_result];
        uint256 feeUsdt;

        if (winningUsdt == 0) {
            // No winners. Admin takes ALL losing pool.
            feeUsdt = totalLosingUsdt;
        } else {
            feeUsdt = (totalLosingUsdt * ADMIN_FEE_PERCENT) / 100;
        }

        // Safety: ensure we don't count fees that don't exist in balance
        // Reduce user liabilities by the amount that is now fee
        // The rest of losing pool remains in user liabilities as it will be paid to winners
        // But wait: winners get (their stake) + (share of losing pool - fees)
        // So total user liabilities should be:
        // Before settlement: Total Staked (Winners + Losers)
        // After settlement: Winners' Stake + (Losers' Stake - Fees)
        // So we reduce liabilities by the Fee amount.

        totalUserLiabilities -= feeUsdt;
        adminFeesUsdt += feeUsdt;

        emit QuestionSettled(_questionId, _result);
    }

    function calculateWinnings(
        uint256 _questionId,
        address _user
    ) public view returns (uint256 usdtWinnings) {
        Question storage question = questions[_questionId];
        Bet storage userBet = bets[_questionId][_user];

        if (
            !question.isSettled ||
            userBet.user == address(0) ||
            userBet.withdrawn
        ) {
            return 0;
        }

        // Check if user won
        if (userBet.outcome != question.result) {
            return 0;
        }

        // Get winning pool total
        uint256 winningUsdtTotal = question.outcomeUsdtTotals[question.result];

        // Get total losing pool
        uint256 totalLosingUsdt = 0;

        for (uint256 i = 0; i < question.outcomeCount; i++) {
            if (i != question.result) {
                totalLosingUsdt += question.outcomeUsdtTotals[i];
            }
        }

        // Calculate share of losing pool (after admin fee)
        uint256 losingUsdtAfterFee = totalLosingUsdt -
            ((totalLosingUsdt * ADMIN_FEE_PERCENT) / 100);

        // User gets original stake + proportional share of losing pool

        if (winningUsdtTotal > 0) {
            usdtWinnings =
                userBet.usdtAmount +
                (losingUsdtAfterFee * userBet.usdtAmount) /
                winningUsdtTotal;
        } else {
            usdtWinnings = userBet.usdtAmount;
        }

        return usdtWinnings;
    }

    function withdrawWinnings(uint256 _questionId) external nonReentrant {
        Question storage question = questions[_questionId];
        Bet storage userBet = bets[_questionId][msg.sender];

        require(question.isSettled, "Question not settled");
        require(userBet.user == msg.sender, "No bet found");
        require(!userBet.withdrawn, "Already withdrawn");
        require(userBet.outcome == question.result, "Not a winner");

        uint256 usdtWinnings = calculateWinnings(_questionId, msg.sender);
        require(usdtWinnings > 0, "No winnings");

        userBet.withdrawn = true;
        totalUserLiabilities -= usdtWinnings; // Decrease liabilities

        if (usdtWinnings > 0) {
            usdtToken.safeTransfer(msg.sender, usdtWinnings);
        }

        emit WinningsWithdrawn(_questionId, msg.sender, usdtWinnings);
    }

    function withdrawAdminFees() external onlyOwner {
        // Safety check: ensure we leave enough for users
        uint256 contractBalance = usdtToken.balanceOf(address(this));
        require(
            contractBalance >= totalUserLiabilities,
            "Critical: Insolvency risk"
        );

        // Only allow withdrawing what's truly excess over user liabilities
        // Or strictly strictly limit to adminFeesUsdt, but capped by available surplus
        uint256 availableSurplus = contractBalance - totalUserLiabilities;
        uint256 amountUsdt = adminFeesUsdt;

        if (amountUsdt > availableSurplus) {
            amountUsdt = availableSurplus;
        }

        adminFeesUsdt -= amountUsdt;

        if (amountUsdt > 0) {
            uint256 developerShare = (amountUsdt * 10) / 100;
            uint256 adminShare = amountUsdt - developerShare;

            if (developerShare > 0) {
                usdtToken.safeTransfer(developerAddress, developerShare);
            }
            if (adminShare > 0) {
                usdtToken.safeTransfer(owner, adminShare);
            }
        }

        emit AdminFeesWithdrawn(amountUsdt);
    }

    // Sweep dust or any unaccounted tokens that are NOT user liabilities
    function sweepDust() external onlyOwner {
        uint256 contractBalance = usdtToken.balanceOf(address(this));
        require(
            contractBalance > totalUserLiabilities + adminFeesUsdt,
            "No dust to sweep"
        );

        uint256 dust = contractBalance - (totalUserLiabilities + adminFeesUsdt);
        // Treat dust as admin fees
        adminFeesUsdt += dust;
    }

    // Helper to get question details
    function getQuestion(
        uint256 _questionId
    )
        external
        view
        returns (
            string memory title,
            uint256 deadline,
            bool isSettled,
            uint256 result,
            uint256 outcomeCount,
            uint256[3] memory outcomeUsdtTotals,
            uint256[3] memory outcomeParticipants,
            bool exists,
            bool isCancelled
        )
    {
        Question storage q = questions[_questionId];
        return (
            q.title,
            q.deadline,
            q.isSettled,
            q.result,
            q.outcomeCount,
            q.outcomeUsdtTotals,
            q.outcomeParticipants,
            q.exists,
            q.isCancelled
        );
    }

    function setDeveloperAddress(address _newDeveloper) external {
        require(msg.sender == developerAddress, "Not developer");
        require(_newDeveloper != address(0), "Invalid address");
        emit DeveloperAddressUpdated(developerAddress, _newDeveloper);
        developerAddress = _newDeveloper;
    }

    function setOwnerAddress(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        emit OwnerAddressUpdated(owner, _newOwner);
        owner = _newOwner;
    }

    function cancelQuestion(uint256 _questionId) external onlyOwner {
        Question storage question = questions[_questionId];
        require(question.exists, "Question does not exist");
        require(!question.isSettled, "Already settled");
        require(!question.isCancelled, "Already cancelled");

        question.isCancelled = true;
        question.isSettled = true; // To prevent further betting/settling

        emit QuestionCancelled(_questionId);
    }

    function claimRefund(uint256 _questionId) external nonReentrant {
        Question storage question = questions[_questionId];
        Bet storage userBet = bets[_questionId][msg.sender];

        require(question.isCancelled, "Question not cancelled");
        require(userBet.user == msg.sender, "No bet found");
        require(!userBet.withdrawn, "Already withdrawn");
        require(userBet.usdtAmount > 0, "No amount to refund");

        userBet.withdrawn = true;
        totalUserLiabilities -= userBet.usdtAmount; // Decrease liabilities

        usdtToken.safeTransfer(msg.sender, userBet.usdtAmount);

        emit RefundClaimed(_questionId, msg.sender, userBet.usdtAmount);
    }
}
