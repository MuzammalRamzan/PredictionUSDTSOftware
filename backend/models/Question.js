import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "general",
    },
    subcategory: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    level: {
      type: String,
      default: "",
    },
    deadline: {
      type: Date,
      required: true,
    },
    settlement_date: {
      type: Date,
    },
    contract_question_id: {
      type: Number,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["open", "closed", "settled", "cancelled"],
      default: "open",
    },
    result: {
      type: Number, // Index of the winning outcome
      default: null,
    },
    outcomes: {
      type: [String],
      default: ["Yes", "No"],
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    totalLimit: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    betAmountLimit: {
      type: Number,
      default: 0, // 0 means unlimited (Max Bet Amount)
    },
    minBetAmount: {
      type: Number,
      default: 0, // 0 means no minimum
    },
  },
  {
    timestamps: {createdAt: "created_at", updatedAt: "updated_at"},
  },
);

questionSchema.index({status: 1});
questionSchema.index({deadline: 1});
questionSchema.index({category: 1});
questionSchema.index({subcategory: 1});
questionSchema.index({country: 1});
questionSchema.index({level: 1});
export default mongoose.model("Question", questionSchema);
