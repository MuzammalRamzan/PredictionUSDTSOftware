import mongoose from "mongoose";

const betSchema = new mongoose.Schema(
  {
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    user_address: {
      type: String,
      required: true,
    },
    outcome: {
      type: Number,
      required: true,
    },
    ftr_amount: {
      type: Number,
      default: 1,
    },
    usdt_amount: {
      type: Number,
      default: 1,
    },
    transaction_hash: {
      type: String,
      unique: true,
      required: true,
    },
    is_winner: {
      type: Boolean,
      default: null,
    },
  },
  {
    timestamps: {createdAt: "created_at", updatedAt: false},
  },
);

betSchema.index({question_id: 1});
betSchema.index({user_address: 1});
export default mongoose.model("Bet", betSchema);
