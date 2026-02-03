import mongoose from 'mongoose';

const poolStatSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    unique: true
  },
  yes_ftr_total: {
    type: Number,
    default: 0
  },
  yes_usdt_total: {
    type: Number,
    default: 0
  },
  yes_participants: {
    type: Number,
    default: 0
  },
  no_ftr_total: {
    type: Number,
    default: 0
  },
  no_usdt_total: {
    type: Number,
    default: 0
  },
  no_participants: {
    type: Number,
    default: 0
  },
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
