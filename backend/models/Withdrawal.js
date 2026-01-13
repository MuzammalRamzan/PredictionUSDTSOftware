import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  user_address: {
    type: String,
    required: true
  },
  ocro_amount: {
    type: Number,
    required: true
  },
  usdt_amount: {
    type: Number,
    required: true
  },
  transaction_hash: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

withdrawalSchema.index({ question_id: 1 });
withdrawalSchema.index({ user_address: 1 });

export default mongoose.model('Withdrawal', withdrawalSchema);
