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
        bool result; // true = YES wins, false = NO wins
        uint256 yesFtrTotal;
        uint256 yesUsdtTotal;
        uint256 noFtrTotal;
        uint256 noUsdtTotal;
        uint256 yesParticipants;
        uint256 noParticipants;
        bool exists;
    }

    struct Bet {
        address user;
        bool outcome; // true = YES, false = NO
        uint256 ftrAmount;
        uint256 usdtAmount;
        bool withdrawn;
    }

    IERC20 public immutable ftrToken;
    IERC20 public immutable usdtToken;
    address public owner;
    uint256 public constant ADMIN_FEE_PERCENT = 10;
    uint256 public constant FIXED_FTR_AMOUNT = 1 ether; // 1 FTR
    uint256 public constant FIXED_USDT_AMOUNT = 1 ether; // 1 USDT (assuming 18 decimals)

    uint256 public questionCount;
    mapping(uint256 => Question) public questions;
    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(uint256 => address[]) public questionBettors;

    uint256 public adminFeesFtr;
    uint256 public adminFeesUsdt;

    event QuestionCreated(
        uint256 indexed questionId,
        string title,
        uint256 deadline
    );
    event BetPlaced(
        uint256 indexed questionId,
        address indexed user,
        bool outcome,
        uint256 ftrAmount,
        uint256 usdtAmount
    );
    event QuestionSettled(uint256 indexed questionId, bool result);
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
        uint256 _deadline
    ) external onlyOwner returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in future");

        uint256 questionId = questionCount++;
        questions[questionId] = Question({
            title: _title,
            deadline: _deadline,
            isSettled: false,
            result: false,
            yesFtrTotal: 0,
            yesUsdtTotal: 0,
            noFtrTotal: 0,
            noUsdtTotal: 0,
            yesParticipants: 0,
            noParticipants: 0,
            exists: true
        });

        emit QuestionCreated(questionId, _title, _deadline);
        return questionId;
    }

    function placeBet(uint256 _questionId, bool _outcome) external {
        Question storage question = questions[_questionId];
        require(question.exists, "Question does not exist");
        require(block.timestamp < question.deadline, "Betting closed");
        require(!question.isSettled, "Question already settled");
        require(
            bets[_questionId][msg.sender].user == address(0),
            "Already placed bet"
        );

        // Transfer tokens from user
        require(
            ftrToken.transferFrom(msg.sender, address(this), FIXED_FTR_AMOUNT),
            "FTR transfer failed"
        );
        require(
            usdtToken.transferFrom(
                msg.sender,
                address(this),
                FIXED_USDT_AMOUNT
            ),
            "USDT transfer failed"
        );

        // Record bet
        bets[_questionId][msg.sender] = Bet({
            user: msg.sender,
            outcome: _outcome,
            ftrAmount: FIXED_FTR_AMOUNT,
            usdtAmount: FIXED_USDT_AMOUNT,
            withdrawn: false
        });

        questionBettors[_questionId].push(msg.sender);

        // Update pool totals
        if (_outcome) {
            question.yesFtrTotal += FIXED_FTR_AMOUNT;
            question.yesUsdtTotal += FIXED_USDT_AMOUNT;
            question.yesParticipants++;
        } else {
            question.noFtrTotal += FIXED_FTR_AMOUNT;
            question.noUsdtTotal += FIXED_USDT_AMOUNT;
            question.noParticipants++;
        }

        emit BetPlaced(
            _questionId,
            msg.sender,
            _outcome,
            FIXED_FTR_AMOUNT,
            FIXED_USDT_AMOUNT
        );
    }

    function settleQuestion(
        uint256 _questionId,
        bool _result
    ) external onlyOwner {
        Question storage question = questions[_questionId];
        require(question.exists, "Question does not exist");
        require(block.timestamp >= question.deadline, "Deadline not reached");
        require(!question.isSettled, "Already settled");

        question.isSettled = true;
        question.result = _result;

        // Calculate admin fees from losing pool
        uint256 losingFtr = _result
            ? question.noFtrTotal
            : question.yesFtrTotal;
        uint256 losingUsdt = _result
            ? question.noUsdtTotal
            : question.yesUsdtTotal;
        uint256 winningFtr = _result
            ? question.yesFtrTotal
            : question.noFtrTotal;

        uint256 feeFtr;
        uint256 feeUsdt;

        if (winningFtr == 0) {
            // No winners. Admin takes ALL losing pool.
            feeFtr = losingFtr;
            feeUsdt = losingUsdt;
        } else {
            feeFtr = (losingFtr * ADMIN_FEE_PERCENT) / 100;
            feeUsdt = (losingUsdt * ADMIN_FEE_PERCENT) / 100;
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

        // Get winning and losing pool totals
        uint256 winningFtr = question.result
            ? question.yesFtrTotal
            : question.noFtrTotal;
        uint256 winningUsdt = question.result
            ? question.yesUsdtTotal
            : question.noUsdtTotal;
        uint256 losingFtr = question.result
            ? question.noFtrTotal
            : question.yesFtrTotal;
        uint256 losingUsdt = question.result
            ? question.noUsdtTotal
            : question.yesUsdtTotal;

        // Calculate user's share of losing pool (after admin fee)
        uint256 losingFtrAfterFee = losingFtr -
            ((losingFtr * ADMIN_FEE_PERCENT) / 100);
        uint256 losingUsdtAfterFee = losingUsdt -
            ((losingUsdt * ADMIN_FEE_PERCENT) / 100);

        // User gets their original stake + proportional share of losing pool
        ftrWinnings =
            userBet.ftrAmount +
            ((losingFtrAfterFee * userBet.ftrAmount) / winningFtr);
        usdtWinnings =
            userBet.usdtAmount +
            ((losingUsdtAfterFee * userBet.usdtAmount) / winningUsdt);

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
        require(ftrWinnings > 0, "No winnings");

        userBet.withdrawn = true;

        require(
            ftrToken.transfer(msg.sender, ftrWinnings),
            "FTR transfer failed"
        );
        require(
            usdtToken.transfer(msg.sender, usdtWinnings),
            "USDT transfer failed"
        );

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
