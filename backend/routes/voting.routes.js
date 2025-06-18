const express = require('express');
const router = express.Router();
const Voting = require('../models/voting.model');
const Property = require('../models/property.model');
const { auth, adminAuth } = require('../middleware/auth.middleware');

// Get all active votings
router.get('/', auth, async (req, res) => {
  try {
    const votings = await Voting.find({ status: 'active' })
      .populate('property', 'name location totalValue totalTokens')
      .populate('createdBy', 'name email')
      .sort({ endDate: 1 });

    // Filter votings based on user's token ownership
    const userVotings = votings.filter(voting => {
      const property = voting.property;
      return property.crowdfunding.investors.some(
        inv => inv.user.toString() === req.user._id.toString()
      );
    });

    res.json(userVotings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching votings', error: error.message });
  }
});

// Get single voting
router.get('/:id', auth, async (req, res) => {
  try {
    const voting = await Voting.findById(req.params.id)
      .populate('property', 'name location totalValue totalTokens crowdfunding')
      .populate('createdBy', 'name email')
      .populate('votes.user', 'name email');

    if (!voting) {
      return res.status(404).json({ message: 'Voting not found' });
    }

    // Check if user has tokens in the property
    const hasTokens = voting.property.crowdfunding.investors.some(
      inv => inv.user.toString() === req.user._id.toString()
    );

    if (!hasTokens && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this voting' });
    }

    res.json(voting);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching voting', error: error.message });
  }
});

// Create voting (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { propertyId, title, description, endDate } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status !== 'funded') {
      return res.status(400).json({ message: 'Property must be funded to create voting' });
    }

    const voting = new Voting({
      property: propertyId,
      title,
      description,
      startDate: new Date(),
      endDate: new Date(endDate),
      createdBy: req.user._id
    });

    await voting.save();
    res.status(201).json(voting);
  } catch (error) {
    res.status(500).json({ message: 'Error creating voting', error: error.message });
  }
});

// Cast vote
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { vote } = req.body;
    const voting = await Voting.findById(req.params.id)
      .populate('property', 'crowdfunding');

    if (!voting) {
      return res.status(404).json({ message: 'Voting not found' });
    }

    if (voting.status !== 'active') {
      return res.status(400).json({ message: 'Voting is not active' });
    }

    if (new Date() > voting.endDate) {
      return res.status(400).json({ message: 'Voting has ended' });
    }

    // Check if user has already voted
    if (voting.hasUserVoted(req.user._id)) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    // Get user's tokens in the property
    const userInvestment = voting.property.crowdfunding.investors.find(
      inv => inv.user.toString() === req.user._id.toString()
    );

    if (!userInvestment) {
      return res.status(403).json({ message: 'You must own tokens to vote' });
    }

    // Add vote
    voting.votes.push({
      user: req.user._id,
      vote,
      tokens: userInvestment.tokens
    });

    // Check if all token holders have voted
    const totalTokens = voting.property.crowdfunding.investors.reduce(
      (sum, inv) => sum + inv.tokens,
      0
    );
    const votedTokens = voting.totalTokensVoted;

    if (votedTokens >= totalTokens) {
      voting.status = 'completed';
    }

    await voting.save();
    res.json(voting);
  } catch (error) {
    res.status(500).json({ message: 'Error casting vote', error: error.message });
  }
});

// End voting (admin only)
router.post('/:id/end', auth, adminAuth, async (req, res) => {
  try {
    const voting = await Voting.findById(req.params.id);

    if (!voting) {
      return res.status(404).json({ message: 'Voting not found' });
    }

    if (voting.status !== 'active') {
      return res.status(400).json({ message: 'Voting is not active' });
    }

    voting.status = 'completed';
    await voting.save();

    res.json(voting);
  } catch (error) {
    res.status(500).json({ message: 'Error ending voting', error: error.message });
  }
});

// Get voting results (admin only)
router.get('/admin/results', auth, adminAuth, async (req, res) => {
  try {
    const votings = await Voting.find({ status: 'completed' })
      .populate('property', 'name location')
      .populate('createdBy', 'name email')
      .sort({ endDate: -1 });

    const results = votings.map(voting => ({
      id: voting._id,
      property: voting.property,
      title: voting.title,
      result: voting.result,
      totalVotes: voting.totalVotes,
      totalTokensVoted: voting.totalTokensVoted,
      endDate: voting.endDate
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching voting results', error: error.message });
  }
});

// Get user's voting history
router.get('/user/history', auth, async (req, res) => {
  try {
    const votings = await Voting.find({
      'votes.user': req.user._id
    })
    .populate('property', 'name location')
    .sort({ endDate: -1 });

    const history = votings.map(voting => ({
      id: voting._id,
      property: voting.property,
      title: voting.title,
      status: voting.status,
      userVote: voting.getUserVote(req.user._id),
      result: voting.result,
      endDate: voting.endDate
    }));

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching voting history', error: error.message });
  }
});

module.exports = router; 