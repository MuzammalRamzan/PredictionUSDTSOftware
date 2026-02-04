import mongoose from 'mongoose';

const poolStatSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    unique: true
  },
  // Array of stats where index matches the outcome index
  outcome_stats: [{
    ftr_total: { type: Number, default: 0 },
    usdt_total: { type: Number, default: 0 },
    participants: { type: Number, default: 0 }
  }],
  admin_fee_ftr: {
    type: Number,
    default: 0
  },
  admin_fee_usdt: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: false, updatedAt: 'updated_at' }
});

export default mongoose.model('PoolStat', poolStatSchema);
