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
        uint256 settlementTime; // Timestamp when question was settled
        bool hasWithdrawals; // Track if any user has withdrawn winnings
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

    // Withdrawal control
    bool public globalWithdrawalPaused;
    mapping(address => bool) public userWithdrawalPaused;
    uint256 public withdrawalDelay = 0; // Delay in seconds before users can withdraw winnings after settlement

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
    event QuestionDeadlineUpdated(
        uint256 indexed questionId,
        uint256 newDeadline
    );

    event QuestionOutcomeChanged(
        uint256 indexed questionId,
        uint256 oldResult,
        uint256 newResult
    );

    // New events
    event GlobalWithdrawalPaused(bool isPaused);
    event UserWithdrawalPaused(address indexed user, bool isPaused);
    event WithdrawalDelayUpdated(uint256 newDelay);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier canWithdraw(address _user, uint256 _questionId) {
        require(!globalWithdrawalPaused, "Withdrawals are globally paused");
        require(!userWithdrawalPaused[_user], "Your withdrawals are paused");

        if (_questionId != type(uint256).max) {
            // Use max uint for non-question withdrawals if needed
            Question storage question = questions[_questionId];
            if (question.isSettled && !question.isCancelled) {
                require(
                    block.timestamp >=
                        question.settlementTime + withdrawalDelay,
                    "Withdrawal delay not met"
                );
            }
        }
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
            isCancelled: false,
            settlementTime: 0,
            hasWithdrawals: false
        });

        emit QuestionCreated(questionId, _title, _deadline, _outcomeCount);
        return questionId;
    }

    // 3. Market time extend option
    function updateQuestionDeadline(
        uint256 _questionId,
        uint256 _newDeadline
    ) external onlyOwner {
        Question storage question = questions[_questionId];
        require(question.exists, "Question does not exist");
        require(!question.isSettled, "Question already settled");
        require(!question.isCancelled, "Question is cancelled");
        require(
            _newDeadline > block.timestamp,
            "New deadline must be in future"
        );
        require(block.timestamp < question.deadline, "Deadline passed");

        question.deadline = _newDeadline;
        emit QuestionDeadlineUpdated(_questionId, _newDeadline);
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
        question.settlementTime = block.timestamp;

        _calculateFees(_questionId, _result, true);

        emit QuestionSettled(_questionId, _result);
    }

    function changeOutcome(
        uint256 _questionId,
        uint256 _newResult
    ) external onlyOwner {
        Question storage question = questions[_questionId];
        require(question.isSettled, "Question not settled");
        require(!question.isCancelled, "Question is cancelled");
        require(!question.hasWithdrawals, "Withdrawals already started");
        require(_newResult < question.outcomeCount, "Invalid result index");
        require(_newResult != question.result, "Same result");

        // Reverse old fees
        _calculateFees(_questionId, question.result, false);

        uint256 oldResult = question.result;
        question.result = _newResult;

        // Apply new fees
        _calculateFees(_questionId, _newResult, true);

        emit QuestionOutcomeChanged(_questionId, oldResult, _newResult);
    }

    function _calculateFees(
        uint256 _questionId,
        uint256 _result,
        bool _isSettling
    ) internal {
        Question storage question = questions[_questionId];

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

        if (_isSettling) {
            totalUserLiabilities -= feeUsdt;
            adminFeesUsdt += feeUsdt;
        } else {
            // Reversing settlement
            require(adminFeesUsdt >= feeUsdt, "Admin fees already withdrawn");
            totalUserLiabilities += feeUsdt;
            adminFeesUsdt -= feeUsdt;
        }
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

        // Handle cancelled questions - full refund
        if (question.isCancelled) {
            return userBet.usdtAmount;
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

    function withdrawWinnings(
        uint256 _questionId
    ) external nonReentrant canWithdraw(msg.sender, _questionId) {
        Question storage question = questions[_questionId];
        Bet storage userBet = bets[_questionId][msg.sender];

        require(question.isSettled, "Question not settled");
        require(userBet.user == msg.sender, "No bet found");
        require(!userBet.withdrawn, "Already withdrawn");

        // Handle cancelled questions separately in claimRefund, but logic merged here for safety
        if (question.isCancelled) {
            _claimRefund(_questionId, msg.sender);
            return;
        }

        require(userBet.outcome == question.result, "Not a winner");

        uint256 usdtWinnings = calculateWinnings(_questionId, msg.sender);
        require(usdtWinnings > 0, "No winnings");

        userBet.withdrawn = true;
        question.hasWithdrawals = true; // Mark that withdrawals have started
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

    // 1. Market Cancel Option
    function cancelQuestion(uint256 _questionId) external onlyOwner {
        Question storage question = questions[_questionId];
        require(question.exists, "Question does not exist");
        require(!question.isSettled, "Already settled");
        require(!question.isCancelled, "Already cancelled");

        question.isCancelled = true;
        question.isSettled = true; // To prevent further betting/settling
        question.settlementTime = block.timestamp; // Mark settlement time

        emit QuestionCancelled(_questionId);
    }

    // 1. Refund Claim (Internal helper to reuse logic)
    function _claimRefund(uint256 _questionId, address _user) internal {
        Question storage question = questions[_questionId];
        Bet storage userBet = bets[_questionId][_user];

        require(question.isCancelled, "Question not cancelled");
        require(userBet.user == _user, "No bet found");
        require(!userBet.withdrawn, "Already withdrawn");
        require(userBet.usdtAmount > 0, "No amount to refund");

        userBet.withdrawn = true;
        totalUserLiabilities -= userBet.usdtAmount; // Decrease liabilities

        usdtToken.safeTransfer(_user, userBet.usdtAmount);

        emit RefundClaimed(_questionId, _user, userBet.usdtAmount);
    }

    function claimRefund(
        uint256 _questionId
    ) external nonReentrant canWithdraw(msg.sender, _questionId) {
        _claimRefund(_questionId, msg.sender);
    }

    // 4. Withdrawal time set from admin
    function setWithdrawalDelay(uint256 _delaySeconds) external onlyOwner {
        withdrawalDelay = _delaySeconds;
        emit WithdrawalDelayUpdated(_delaySeconds);
    }

    // 5. Withdrawal stopped globally
    function setGlobalWithdrawalPaused(bool _paused) external onlyOwner {
        globalWithdrawalPaused = _paused;
        emit GlobalWithdrawalPaused(_paused);
    }

    // 5. Withdrawal stopped userwise
    function setUserWithdrawalPaused(
        address _user,
        bool _paused
    ) external onlyOwner {
        userWithdrawalPaused[_user] = _paused;
        emit UserWithdrawalPaused(_user, _paused);
    }
}
