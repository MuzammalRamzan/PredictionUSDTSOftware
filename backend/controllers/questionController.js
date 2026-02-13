import Question from "../models/Question.js";
import PoolStat from "../models/PoolStat.js";
import Bet from "../models/Bet.js";
import {getContract} from "../config/blockchain.js";
import {ethers} from "ethers";

export const getAllQuestions = async (req, res) => {
  try {
    const {
      status,
      category,
      subcategory,
      country,
      level,
      search,
      page = 1,
      limit = 10,
      includeHidden = "false",
    } = req.query;

    const filter = {};

    // By default hide hidden questions unless includeHidden is true
    if (includeHidden !== "true") {
      filter.isHidden = {$ne: true};
    }

    if (status) {
      const now = new Date();
      if (status === "active") {
        filter.status = "open";
        filter.deadline = {$gt: now};
      } else if (status === "pending") {
        // Pending settlement: Open but deadline passed
        filter.status = "open";
        filter.deadline = {$lte: now};
      } else if (status === "disabled") {
        filter.isHidden = true;
      } else {
        filter.status = status;
      }
    }
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (country) filter.country = country;
    if (level) filter.level = level;
    if (search) {
      filter.title = {$regex: search, $options: "i"};
    }

    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort({created_at: -1})
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Question.countDocuments(filter),
    ]);

    // Optimize: Fetch all PoolStats in one query instead of N+1
    const questionIds = questions.map((q) => q._id);
    const allStats = await PoolStat.find({
      question_id: {$in: questionIds},
    }).lean();

    // Create a map for quick lookup
    const statsMap = {};
    allStats.forEach((stat) => {
      statsMap[stat.question_id.toString()] = stat;
    });

    const questionsWithStats = questions.map((question) => {
      const stats = statsMap[question._id.toString()];
      return {
        ...question,
        id: question._id,
        pool_stats: stats ? [{...stats, id: stats._id}] : [],
      };
    });

    res.json({
      success: true,
      data: questionsWithStats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({success: false, error: error.message});
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const {id} = req.params;

    const question = await Question.findById(id).lean();

    if (!question) {
      return res
        .status(404)
        .json({success: false, error: "Question not found"});
    }

    const stats = await PoolStat.findOne({question_id: id}).lean();
    const bets = await Bet.find({question_id: id}).lean();

    const data = {
      ...question,
      id: question._id,
      pool_stats: stats ? [{...stats, id: stats._id}] : [],
      bets: bets.map((bet) => ({...bet, id: bet._id})),
    };

    res.json({success: true, data});
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({success: false, error: error.message});
  }
};

export const createQuestion = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      country,
      level,
      deadline,
      outcomes,
      adminAddress,
      transactionHash,
      contractQuestionId,
      totalLimit,
      betAmountLimit,
    } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({
        success: false,
        error: "Title and deadline are required",
      });
    }

    if (!adminAddress) {
      return res.status(400).json({
        success: false,
        error: "Admin address is required",
      });
    }

    const superAdminAddresses =
      process.env.SUPER_ADMIN_ADDRESSES?.split(",").map((addr) =>
        addr.toLowerCase(),
      ) || [];
    if (!superAdminAddresses.includes(adminAddress.toLowerCase())) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: Only super admins can create questions",
      });
    }

    if (!transactionHash || contractQuestionId === undefined) {
      return res.status(400).json({
        success: false,
        error: "Transaction hash and contract question ID are required",
      });
    }

    const question = new Question({
      title,
      description,
      category: category || "general",
      subcategory: subcategory || "",
      country: country || "",
      level: level || "",
      deadline,
      contract_question_id: contractQuestionId,
      status: "open",
      outcomes: outcomes || ["Yes", "No"],
      totalLimit: totalLimit || 0,
      betAmountLimit: betAmountLimit || 0,
      minBetAmount: req.body.minBetAmount || 0,
    });

    await question.save();

    // Initialize stats for each outcome
    const initialStats = (outcomes || ["Yes", "No"]).map(() => ({
      usdt_total: 0,
      participants: 0,
    }));

    await new PoolStat({
      question_id: question._id,
      outcome_stats: initialStats,
    }).save();

    const data = {...question.toObject(), id: question._id};

    res.json({
      success: true,
      data,
      transactionHash,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({success: false, error: error.message});
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const {id} = req.params;
    const {
      title,
      description,
      deadline,
      category,
      subcategory,
      country,
      level,
      isHidden,
      totalLimit,
      betAmountLimit,
      minBetAmount,
      outcomes,
    } = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return res
        .status(404)
        .json({success: false, error: "Question not found"});
    }

    // Update fields
    if (title !== undefined) question.title = title;
    if (description !== undefined) question.description = description;
    if (deadline !== undefined) question.deadline = deadline;
    if (category !== undefined) question.category = category;
    if (subcategory !== undefined) question.subcategory = subcategory;
    if (country !== undefined) question.country = country;
    if (level !== undefined) question.level = level;
    if (isHidden !== undefined) question.isHidden = isHidden;
    if (totalLimit !== undefined) question.totalLimit = totalLimit;
    if (betAmountLimit !== undefined) question.betAmountLimit = betAmountLimit;
    if (minBetAmount !== undefined) question.minBetAmount = minBetAmount;
    if (outcomes !== undefined) question.outcomes = outcomes;

    await question.save();

    res.json({
      success: true,
      data: {...question.toObject(), id: question._id},
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({success: false, error: error.message});
  }
};

export const settleQuestion = async (req, res) => {
  try {
    console.log("=== SETTLE QUESTION START ===");
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);

    const {id} = req.params;
    const {result, adminAddress, transactionHash} = req.body;

    console.log("Parsed values:", {id, result, adminAddress, transactionHash});

    // Validate result is a valid index (number)
    const resultIndex = Number(result);
    if (isNaN(resultIndex) || resultIndex < 0) {
      console.log("Invalid result value:", result);
      return res.status(400).json({
        success: false,
        error: "Result must be a valid outcome index (0, 1, 2)",
      });
    }

    if (!adminAddress) {
      console.log("Missing admin address");
      return res.status(400).json({
        success: false,
        error: "Admin address is required",
      });
    }

    const superAdminAddresses =
      process.env.SUPER_ADMIN_ADDRESSES?.split(",").map((addr) =>
        addr.toLowerCase(),
      ) || [];
    console.log("Configured super admin addresses:", superAdminAddresses);
    console.log("Provided admin address:", adminAddress.toLowerCase());

    if (!superAdminAddresses.includes(adminAddress.toLowerCase())) {
      console.log("Unauthorized admin address");
      return res.status(403).json({
        success: false,
        error: "Unauthorized: Only super admins can settle questions",
      });
    }

    if (!transactionHash) {
      console.log("Missing transaction hash");
      return res.status(400).json({
        success: false,
        error: "Transaction hash is required",
      });
    }

    console.log("Finding question by ID:", id);
    const question = await Question.findById(id);
    console.log("Question found:", question ? "Yes" : "No");

    if (!question) {
      console.log("Question not found in database");
      return res
        .status(404)
        .json({success: false, error: "Question not found"});
    }

    console.log("Current question status:", question.status);
    if (question.status === "settled") {
      console.log("Question already settled");
      return res
        .status(400)
        .json({success: false, error: "Question already settled"});
    }

    // Validate result index against outcomes
    if (resultIndex >= question.outcomes.length) {
      return res.status(400).json({
        success: false,
        error: `Result index ${resultIndex} is out of bounds for ${question.outcomes.length} outcomes`,
      });
    }

    console.log("Updating question status to settled");
    question.status = "settled";
    question.result = resultIndex;
    question.settlement_date = new Date();
    question.updated_at = new Date();

    console.log("Saving question to database...");
    await question.save();
    console.log("Question saved successfully");

    console.log("Updating winning bets...");
    const winnerUpdate = await Bet.updateMany(
      {question_id: id, outcome: result},
      {is_winner: true},
    );
    console.log("Winner bets updated:", winnerUpdate.modifiedCount);

    console.log("Updating losing bets...");
    const loserUpdate = await Bet.updateMany(
      {question_id: id, outcome: {$ne: result}},
      {is_winner: false},
    );
    console.log("Loser bets updated:", loserUpdate.modifiedCount);

    const data = {...question.toObject(), id: question._id};

    console.log("Settlement successful, sending response");
    console.log("=== SETTLE QUESTION END ===");

    res.json({
      success: true,
      data,
      transactionHash,
    });
  } catch (error) {
    console.error("=== SETTLE QUESTION ERROR ===");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=== ERROR END ===");
    res.status(500).json({success: false, error: error.message});
  }
};

export const syncQuestionFromBlockchain = async (req, res) => {
  try {
    const {contractQuestionId} = req.params;

    const contract = getContract();
    const questionData = await contract.getQuestion(contractQuestionId);

    // If contractQuestionId is 0, MongoDB might treat it as false in a simple boolean check,
    // but findOne should handle Number(0) correctly.
    const question = await Question.findOne({
      contract_question_id: Number(contractQuestionId),
    });

    if (!question) {
      console.log(
        `Question with contract_question_id ${contractQuestionId} not found in DB.`,
      );
      // If not found, we cannot sync it.
      return res
        .status(404)
        .json({success: false, error: "Question not found in database"});
    }

    // --- CHECK FOR DEADLINE UPDATE ---
    const contractDeadline = new Date(Number(questionData.deadline) * 1000);
    const dbDeadline = new Date(question.deadline);

    // Allow for a small time difference (e.g. 1 minute) to avoid trivial updates
    // or just check if they are different.
    if (Math.abs(contractDeadline.getTime() - dbDeadline.getTime()) > 60000) {
      console.log(
        `Syncing deadline for question ${contractQuestionId}. Contract: ${contractDeadline}, DB: ${dbDeadline}`,
      );
      question.deadline = contractDeadline;
      question.updated_at = new Date();
      await question.save();
    }
    // ----------------------------------

    if (questionData.isCancelled && question.status !== "cancelled") {
      question.status = "cancelled";
      question.settlement_date = new Date();
      question.updated_at = new Date();
      await question.save();

      console.log(
        `Synced cancellation status for question ${contractQuestionId}`,
      );
    } else if (questionData.isSettled) {
      // Check if it's a NEW settlement OR a CHANGED outcome
      const contractResult = Number(questionData.result);

      if (question.status !== "settled" || question.result !== contractResult) {
        console.log(
          `Syncing settlement/outcome change for question ${contractQuestionId}. Old Result: ${question.result}, New Result: ${contractResult}`,
        );

        question.status = "settled";
        question.result = contractResult;
        if (!question.settlement_date) {
          question.settlement_date = new Date();
        }
        question.updated_at = new Date();
        await question.save();

        // Reset all bets first (optional but safer) or just update based on new result
        // Winner logic: outcome == result -> true, others -> false

        // Set new winners
        await Bet.updateMany(
          {question_id: question._id, outcome: question.result},
          {is_winner: true},
        );

        // Set losers (everyone else)
        await Bet.updateMany(
          {question_id: question._id, outcome: {$ne: question.result}},
          {is_winner: false},
        );

        console.log(
          `Synced settlement/outcome status for question ${contractQuestionId}: ${question.result}`,
        );
      }
    }

    const outcomeStats = [];
    const outcomeCount = Number(questionData.outcomeCount);

    for (let i = 0; i < outcomeCount; i++) {
      outcomeStats.push({
        usdt_total: ethers.formatEther(questionData.outcomeUsdtTotals[i]),
        participants: Number(questionData.outcomeParticipants[i]),
      });
    }

    await PoolStat.updateOne(
      {question_id: question._id},
      {
        outcome_stats: outcomeStats,
        updated_at: new Date(),
      },
    );

    const data = {...question.toObject(), id: question._id};

    res.json({
      success: true,
      message: "Question synced successfully",
      data,
      wasSettled: questionData.isSettled,
    });
  } catch (error) {
    console.error("Error syncing question:", error);
    res.status(500).json({success: false, error: error.message});
  }
};
