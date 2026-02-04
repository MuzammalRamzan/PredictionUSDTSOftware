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
  },
  {
    timestamps: {createdAt: "created_at", updatedAt: "updated_at"},
  },
);

questionSchema.index({status: 1});
questionSchema.index({deadline: 1});
export default mongoose.model("Question", questionSchema);
