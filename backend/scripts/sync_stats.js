import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "../models/Question.js";
import Bet from "../models/Bet.js";
import PoolStat from "../models/PoolStat.js";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path: path.join(__dirname, "../.env")});

const syncStats = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const questions = await Question.find({});
    console.log(`Found ${questions.length} questions`);

    for (const question of questions) {
      console.log(`Processing question: ${question.title} (${question._id})`);

      const bets = await Bet.find({question_id: question._id});
      console.log(`Found ${bets.length} bets`);

      // Initialize stats based on outcomes
      const outcomeStats = (question.outcomes || []).map(() => ({
        usdt_total: 0,
        participants: 0,
      }));

      // Calculate stats from bets
      for (const bet of bets) {
        const outcomeIndex =
          typeof bet.outcome === "number"
            ? bet.outcome
            : bet.outcome === "yes"
              ? 0
              : 1; // Legacy support if needed

        if (outcomeStats[outcomeIndex]) {
          outcomeStats[outcomeIndex].usdt_total += bet.usdt_amount || 0;
          outcomeStats[outcomeIndex].participants += 1;
        }
      }

      // Update PoolStat
      let poolStat = await PoolStat.findOne({question_id: question._id});
      if (!poolStat) {
        poolStat = new PoolStat({question_id: question._id});
      }

      poolStat.outcome_stats = outcomeStats;
      poolStat.markModified("outcome_stats");
      await poolStat.save();

      console.log(`Updated stats for question ${question._id}`);
    }

    console.log("Sync completed");
    process.exit(0);
  } catch (error) {
    console.error("Error syncing stats:", error);
    process.exit(1);
  }
};

syncStats();
