// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract BettingPool {
    struct Question {
        string title;
        uint256 deadline;
        bool isSettled;
        bool result; // true = YES wins, false = NO wins
        uint256 yesOcroTotal;
        uint256 yesUsdtTotal;
        uint256 noOcroTotal;
        uint256 noUsdtTotal;
        uint256 yesParticipants;
        uint256 noParticipants;
        bool exists;
    }

    struct Bet {
        address user;
        bool outcome; // true = YES, false = NO
        uint256 ocroAmount;
        uint256 usdtAmount;
        bool withdrawn;
    }

    IERC20 public immutable ocroToken;
    IERC20 public immutable usdtToken;
    address public owner;
    uint256 public constant ADMIN_FEE_PERCENT = 10;
    uint256 public constant FIXED_OCRO_AMOUNT = 1 ether; // 1 OCRO
    uint256 public constant FIXED_USDT_AMOUNT = 1 ether; // 1 USDT (assuming 18 decimals)

    uint256 public questionCount;
    mapping(uint256 => Question) public questions;
    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(uint256 => address[]) public questionBettors;

    uint256 public adminFeesOcro;
    uint256 public adminFeesUsdt;

    event QuestionCreated(uint256 indexed questionId, string title, uint256 deadline);
    event BetPlaced(uint256 indexed questionId, address indexed user, bool outcome, uint256 ocroAmount, uint256 usdtAmount);
    event QuestionSettled(uint256 indexed questionId, bool result);
    event WinningsWithdrawn(uint256 indexed questionId, address indexed user, uint256 ocroAmount, uint256 usdtAmount);
    event AdminFeesWithdrawn(uint256 ocroAmount, uint256 usdtAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _ocroToken, address _usdtToken) {
        ocroToken = IERC20(_ocroToken);
        usdtToken = IERC20(_usdtToken);
        owner = msg.sender;
    }

    function createQuestion(string memory _title, uint256 _deadline) external onlyOwner returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in future");

        uint256 questionId = questionCount++;
        questions[questionId] = Question({
            title: _title,
            deadline: _deadline,
            isSettled: false,
            result: false,
            yesOcroTotal: 0,
            yesUsdtTotal: 0,
            noOcroTotal: 0,
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
        require(bets[_questionId][msg.sender].user == address(0), "Already placed bet");

        // Transfer tokens from user
        require(
            ocroToken.transferFrom(msg.sender, address(this), FIXED_OCRO_AMOUNT),
            "OCRO transfer failed"
        );
        require(
            usdtToken.transferFrom(msg.sender, address(this), FIXED_USDT_AMOUNT),
            "USDT transfer failed"
        );

        // Record bet
        bets[_questionId][msg.sender] = Bet({
            user: msg.sender,
            outcome: _outcome,
            ocroAmount: FIXED_OCRO_AMOUNT,
            usdtAmount: FIXED_USDT_AMOUNT,
            withdrawn: false
        });

        questionBettors[_questionId].push(msg.sender);

        // Update pool totals
        if (_outcome) {
            question.yesOcroTotal += FIXED_OCRO_AMOUNT;
            question.yesUsdtTotal += FIXED_USDT_AMOUNT;
            question.yesParticipants++;
        } else {
            question.noOcroTotal += FIXED_OCRO_AMOUNT;
            question.noUsdtTotal += FIXED_USDT_AMOUNT;
            question.noParticipants++;
        }

        emit BetPlaced(_questionId, msg.sender, _outcome, FIXED_OCRO_AMOUNT, FIXED_USDT_AMOUNT);
    }

    function settleQuestion(uint256 _questionId, bool _result) external onlyOwner {
        Question storage question = questions[_questionId];
        require(question.exists, "Question does not exist");
        require(block.timestamp >= question.deadline, "Deadline not reached");
        require(!question.isSettled, "Already settled");

        question.isSettled = true;
        question.result = _result;

        // Calculate admin fees from losing pool
        uint256 losingOcro = _result ? question.noOcroTotal : question.yesOcroTotal;
        uint256 losingUsdt = _result ? question.noUsdtTotal : question.yesUsdtTotal;

        uint256 feeOcro = (losingOcro * ADMIN_FEE_PERCENT) / 100;
        uint256 feeUsdt = (losingUsdt * ADMIN_FEE_PERCENT) / 100;

        adminFeesOcro += feeOcro;
        adminFeesUsdt += feeUsdt;

        emit QuestionSettled(_questionId, _result);
    }

    function calculateWinnings(uint256 _questionId, address _user) public view returns (uint256 ocroWinnings, uint256 usdtWinnings) {
        Question storage question = questions[_questionId];
        Bet storage userBet = bets[_questionId][_user];

        if (!question.isSettled || userBet.user == address(0) || userBet.withdrawn) {
            return (0, 0);
        }

        // Check if user won
        if (userBet.outcome != question.result) {
            return (0, 0);
        }

        // Get winning and losing pool totals
        uint256 winningOcro = question.result ? question.yesOcroTotal : question.noOcroTotal;
        uint256 winningUsdt = question.result ? question.yesUsdtTotal : question.noUsdtTotal;
        uint256 losingOcro = question.result ? question.noOcroTotal : question.yesOcroTotal;
        uint256 losingUsdt = question.result ? question.noUsdtTotal : question.yesUsdtTotal;

        // Calculate user's share of losing pool (after admin fee)
        uint256 losingOcroAfterFee = losingOcro - ((losingOcro * ADMIN_FEE_PERCENT) / 100);
        uint256 losingUsdtAfterFee = losingUsdt - ((losingUsdt * ADMIN_FEE_PERCENT) / 100);

        // User gets their original stake + proportional share of losing pool
        ocroWinnings = userBet.ocroAmount + ((losingOcroAfterFee * userBet.ocroAmount) / winningOcro);
        usdtWinnings = userBet.usdtAmount + ((losingUsdtAfterFee * userBet.usdtAmount) / winningUsdt);

        return (ocroWinnings, usdtWinnings);
    }

    function withdrawWinnings(uint256 _questionId) external {
        Question storage question = questions[_questionId];
        Bet storage userBet = bets[_questionId][msg.sender];

        require(question.isSettled, "Question not settled");
        require(userBet.user == msg.sender, "No bet found");
        require(!userBet.withdrawn, "Already withdrawn");
        require(userBet.outcome == question.result, "Not a winner");

        (uint256 ocroWinnings, uint256 usdtWinnings) = calculateWinnings(_questionId, msg.sender);
        require(ocroWinnings > 0, "No winnings");

        userBet.withdrawn = true;

        require(ocroToken.transfer(msg.sender, ocroWinnings), "OCRO transfer failed");
        require(usdtToken.transfer(msg.sender, usdtWinnings), "USDT transfer failed");

        emit WinningsWithdrawn(_questionId, msg.sender, ocroWinnings, usdtWinnings);
    }

    function withdrawAdminFees() external onlyOwner {
        uint256 ocroAmount = adminFeesOcro;
        uint256 usdtAmount = adminFeesUsdt;

        require(ocroAmount > 0 || usdtAmount > 0, "No fees to withdraw");

        adminFeesOcro = 0;
        adminFeesUsdt = 0;

        if (ocroAmount > 0) {
            require(ocroToken.transfer(owner, ocroAmount), "OCRO transfer failed");
        }
        if (usdtAmount > 0) {
            require(usdtToken.transfer(owner, usdtAmount), "USDT transfer failed");
        }

        emit AdminFeesWithdrawn(ocroAmount, usdtAmount);
    }

    function getQuestionBettors(uint256 _questionId) external view returns (address[] memory) {
        return questionBettors[_questionId];
    }

    function getUserBet(uint256 _questionId, address _user) external view returns (Bet memory) {
        return bets[_questionId][_user];
    }

    function getQuestion(uint256 _questionId) external view returns (Question memory) {
        return questions[_questionId];
    }
}
