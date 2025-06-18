const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    }
  },
  totalValue: {
    type: Number,
    required: true,
    min: 0
  },
  totalTokens: {
    type: Number,
    required: true,
    min: 1
  },
  tokenPrice: {
    type: Number,
    min: 0
  },
  images: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['listed', 'crowdfunding', 'funded', 'sold'],
    default: 'listed'
  },
  crowdfunding: {
    startDate: Date,
    endDate: Date,
    currentAmount: {
      type: Number,
      default: 0
    },
    investors: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      tokens: {
        type: Number,
        required: true,
        min: 1
      },
      investmentDate: {
        type: Date,
        default: Date.now
      }
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate token price based on total value and total tokens
propertySchema.pre('save', function(next) {
  if (this.isNew || this.isModified('totalValue') || this.isModified('totalTokens')) {
    if (this.totalValue && this.totalTokens && this.totalTokens > 0) {
      this.tokenPrice = this.totalValue / this.totalTokens;
    }
  }
  next();
});

// Virtual for available tokens
propertySchema.virtual('availableTokens').get(function() {
  const investedTokens = this.crowdfunding.investors.reduce((sum, investor) => sum + investor.tokens, 0);
  return this.totalTokens - investedTokens;
});

// Virtual for funding progress
propertySchema.virtual('fundingProgress').get(function() {
  return (this.crowdfunding.currentAmount / this.totalValue) * 100;
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property; 