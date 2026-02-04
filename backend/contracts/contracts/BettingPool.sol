// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract BettingPool {
    struct Question {
        string title;
        uint256 deadline;
        bool isSettled;
        uint256 result; // Index of winning outcome (0, 1, 2)
        uint256 outcomeCount; // 2 or 3
        uint256[3] outcomeFtrTotals;
        uint256[3] outcomeUsdtTotals;
        uint256[3] outcomeParticipants;
        bool exists;
    }

    struct Bet {
        address user;
        uint256 outcome; // Index of chosen outcome
        uint256 ftrAmount;
        uint256 usdtAmount;
        bool withdrawn;
    }

    IERC20 public immutable ftrToken;
    IERC20 public immutable usdtToken;
    address public owner;
    uint256 public constant ADMIN_FEE_PERCENT = 10;

    // Minimum bet amounts
    uint256 public constant MIN_FTR_AMOUNT = 1 ether;
    uint256 public constant MIN_USDT_AMOUNT = 1 ether;

    uint256 public questionCount;
    mapping(uint256 => Question) public questions;
    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(uint256 => address[]) public questionBettors;

    uint256 public adminFeesFtr;
    uint256 public adminFeesUsdt;

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
        uint256 ftrAmount,
        uint256 usdtAmount
    );
    event QuestionSettled(uint256 indexed questionId, uint256 result);
    event WinningsWithdrawn(
        uint256 indexed questionId,
        address indexed user,
        uint256 ftrAmount,
        uint256 usdtAmount
    );
    event AdminFeesWithdrawn(uint256 ftrAmount, uint256 usdtAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _ftrToken, address _usdtToken) {
        ftrToken = IERC20(_ftrToken);
        usdtToken = IERC20(_usdtToken);
        owner = msg.sender;
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
            outcomeFtrTotals: zeroArray,
            outcomeUsdtTotals: zeroArray,
            outcomeParticipants: zeroArray,
            exists: true
        });

        emit QuestionCreated(questionId, _title, _deadline, _outcomeCount);
        return questionId;
    }

    function placeBet(
        uint256 _questionId,
        uint256 _outcome,
        uint256 _ftrAmount,
        uint256 _usdtAmount
    ) external {
        Question storage question = questions[_questionId];
        require(question.exists, "Question does not exist");
        require(block.timestamp < question.deadline, "Betting closed");
        require(!question.isSettled, "Question already settled");
        require(
            bets[_questionId][msg.sender].user == address(0),
            "Already placed bet"
        );
        require(_outcome < question.outcomeCount, "Invalid outcome index");
        require(_ftrAmount >= MIN_FTR_AMOUNT, "Min 1 FTR required");
        require(_usdtAmount >= MIN_USDT_AMOUNT, "Min 1 USDT required");

        // Transfer tokens from user
        require(
            ftrToken.transferFrom(msg.sender, address(this), _ftrAmount),
            "FTR transfer failed"
        );
        require(
            usdtToken.transferFrom(msg.sender, address(this), _usdtAmount),
            "USDT transfer failed"
        );

        // Record bet
        bets[_questionId][msg.sender] = Bet({
            user: msg.sender,
            outcome: _outcome,
            ftrAmount: _ftrAmount,
            usdtAmount: _usdtAmount,
            withdrawn: false
        });

        questionBettors[_questionId].push(msg.sender);

        // Update pool totals
        question.outcomeFtrTotals[_outcome] += _ftrAmount;
        question.outcomeUsdtTotals[_outcome] += _usdtAmount;
        question.outcomeParticipants[_outcome]++;

        emit BetPlaced(
            _questionId,
            msg.sender,
            _outcome,
            _ftrAmount,
            _usdtAmount
        );
    }

    function settleQuestion(
        uint256 _questionId,
        uint256 _result
    ) external onlyOwner {
        Question storage question = questions[_questionId];
        require(question.exists, "Question does not exist");
        require(block.timestamp >= question.deadline, "Deadline not reached");
        require(!question.isSettled, "Already settled");
        require(_result < question.outcomeCount, "Invalid result index");

        question.isSettled = true;
        question.result = _result;

        // Calculate fees from losing pools
        uint256 totalLosingFtr = 0;
        uint256 totalLosingUsdt = 0;

        for (uint256 i = 0; i < question.outcomeCount; i++) {
            if (i != _result) {
                totalLosingFtr += question.outcomeFtrTotals[i];
                totalLosingUsdt += question.outcomeUsdtTotals[i];
            }
        }

        uint256 winningFtr = question.outcomeFtrTotals[_result];

        uint256 feeFtr;
        uint256 feeUsdt;

        if (winningFtr == 0) {
            // No winners. Admin takes ALL losing pool.
            feeFtr = totalLosingFtr;
            feeUsdt = totalLosingUsdt;
        } else {
            feeFtr = (totalLosingFtr * ADMIN_FEE_PERCENT) / 100;
            feeUsdt = (totalLosingUsdt * ADMIN_FEE_PERCENT) / 100;
        }

        adminFeesFtr += feeFtr;
        adminFeesUsdt += feeUsdt;

        emit QuestionSettled(_questionId, _result);
    }

    function calculateWinnings(
        uint256 _questionId,
        address _user
    ) public view returns (uint256 ftrWinnings, uint256 usdtWinnings) {
        Question storage question = questions[_questionId];
        Bet storage userBet = bets[_questionId][_user];

        if (
            !question.isSettled ||
            userBet.user == address(0) ||
            userBet.withdrawn
        ) {
            return (0, 0);
        }

        // Check if user won
        if (userBet.outcome != question.result) {
            return (0, 0);
        }

        // Get winning pool total
        uint256 winningFtrTotal = question.outcomeFtrTotals[question.result];
        uint256 winningUsdtTotal = question.outcomeUsdtTotals[question.result];

        // Get total losing pool
        uint256 totalLosingFtr = 0;
        uint256 totalLosingUsdt = 0;

        for (uint256 i = 0; i < question.outcomeCount; i++) {
            if (i != question.result) {
                totalLosingFtr += question.outcomeFtrTotals[i];
                totalLosingUsdt += question.outcomeUsdtTotals[i];
            }
        }

        // Calculate share of losing pool (after admin fee)
        uint256 losingFtrAfterFee = totalLosingFtr -
            ((totalLosingFtr * ADMIN_FEE_PERCENT) / 100);
        uint256 losingUsdtAfterFee = totalLosingUsdt -
            ((totalLosingUsdt * ADMIN_FEE_PERCENT) / 100);

        // User gets original stake + proportional share of losing pool

        if (winningFtrTotal > 0) {
            ftrWinnings =
                userBet.ftrAmount +
                (losingFtrAfterFee * userBet.ftrAmount) /
                winningFtrTotal;
        } else {
            ftrWinnings = userBet.ftrAmount;
        }

        if (winningUsdtTotal > 0) {
            usdtWinnings =
                userBet.usdtAmount +
                (losingUsdtAfterFee * userBet.usdtAmount) /
                winningUsdtTotal;
        } else {
            usdtWinnings = userBet.usdtAmount;
        }

        return (ftrWinnings, usdtWinnings);
    }

    function withdrawWinnings(uint256 _questionId) external {
        Question storage question = questions[_questionId];
        Bet storage userBet = bets[_questionId][msg.sender];

        require(question.isSettled, "Question not settled");
        require(userBet.user == msg.sender, "No bet found");
        require(!userBet.withdrawn, "Already withdrawn");
        require(userBet.outcome == question.result, "Not a winner");

        (uint256 ftrWinnings, uint256 usdtWinnings) = calculateWinnings(
            _questionId,
            msg.sender
        );
        require(ftrWinnings > 0 || usdtWinnings > 0, "No winnings");

        userBet.withdrawn = true;

        if (ftrWinnings > 0) {
            require(
                ftrToken.transfer(msg.sender, ftrWinnings),
                "FTR transfer failed"
            );
        }
        if (usdtWinnings > 0) {
            require(
                usdtToken.transfer(msg.sender, usdtWinnings),
                "USDT transfer failed"
            );
        }

        emit WinningsWithdrawn(
            _questionId,
            msg.sender,
            ftrWinnings,
            usdtWinnings
        );
    }

    function withdrawAdminFees() external onlyOwner {
        uint256 ftrAmount = adminFeesFtr;
        uint256 usdtAmount = adminFeesUsdt;

        require(ftrAmount > 0 || usdtAmount > 0, "No fees to withdraw");

        adminFeesFtr = 0;
        adminFeesUsdt = 0;

        if (ftrAmount > 0) {
            require(ftrToken.transfer(owner, ftrAmount), "FTR transfer failed");
        }
        if (usdtAmount > 0) {
            require(
                usdtToken.transfer(owner, usdtAmount),
                "USDT transfer failed"
            );
        }

        emit AdminFeesWithdrawn(ftrAmount, usdtAmount);
    }

    function getQuestionBettors(
        uint256 _questionId
    ) external view returns (address[] memory) {
        return questionBettors[_questionId];
    }

    function getUserBet(
        uint256 _questionId,
        address _user
    ) external view returns (Bet memory) {
        return bets[_questionId][_user];
    }

    function getQuestion(
        uint256 _questionId
    ) external view returns (Question memory) {
        return questions[_questionId];
    }
}
