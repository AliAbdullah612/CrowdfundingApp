const mongoose = require('mongoose');

const votingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vote: {
      type: String,
      enum: ['yes', 'no'],
      required: true
    },
    tokens: {
      type: Number,
      required: true,
      min: 1
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for total votes (weighted by tokens)
votingSchema.virtual('totalVotes').get(function() {
  return this.votes.reduce((total, vote) => {
    return total + (vote.vote === 'yes' ? vote.tokens : -vote.tokens);
  }, 0);
});

// Virtual for total tokens voted
votingSchema.virtual('totalTokensVoted').get(function() {
  return this.votes.reduce((total, vote) => total + vote.tokens, 0);
});

// Virtual for voting result
votingSchema.virtual('result').get(function() {
  if (this.status !== 'completed') return null;
  const totalVotes = this.totalVotes;
  return totalVotes > 0 ? 'yes' : totalVotes < 0 ? 'no' : 'tie';
});

// Method to check if a user has voted
votingSchema.methods.hasUserVoted = function(userId) {
  return this.votes.some(vote => vote.user.toString() === userId.toString());
};

// Method to get user's vote
votingSchema.methods.getUserVote = function(userId) {
  const vote = this.votes.find(vote => vote.user.toString() === userId.toString());
  return vote ? vote.vote : null;
};

const Voting = mongoose.model('Voting', votingSchema);

module.exports = Voting; 