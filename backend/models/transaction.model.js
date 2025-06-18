const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  type: {
    type: String,
    enum: ['investment', 'refund', 'dividend'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  tokens: {
    type: Number,
    required: function() {
      return this.type === 'investment';
    },
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentId: {
    type: String,
    required: function() {
      return this.type === 'investment';
    }
  },
  stripeChargeId: String,
  description: String,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for faster queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ property: 1, createdAt: -1 });
transactionSchema.index({ stripePaymentId: 1 }, { unique: true, sparse: true });

// Virtual for transaction status
transactionSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

// Method to check if transaction is refundable
transactionSchema.methods.isRefundable = function() {
  return this.status === 'completed' && 
         this.type === 'investment' && 
         Date.now() - this.createdAt < 7 * 24 * 60 * 60 * 1000; // 7 days
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 