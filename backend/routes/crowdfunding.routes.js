const express = require('express');
const router = express.Router();
const Property = require('../models/property.model');
const Transaction = require('../models/transaction.model');
const { auth, adminAuth } = require('../middleware/auth.middleware');

// Get all crowdfunding campaigns
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find({ status: 'crowdfunding' })
      .populate('createdBy', 'name email')
      .populate('crowdfunding.investors.user', 'name email')
      .sort({ 'crowdfunding.endDate': 1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching crowdfunding campaigns', error: error.message });
  }
});

// Get single crowdfunding campaign
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('crowdfunding.investors.user', 'name email');
    
    if (!property || property.status !== 'crowdfunding') {
      return res.status(404).json({ message: 'Crowdfunding campaign not found' });
    }
    
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching crowdfunding campaign', error: error.message });
  }
});

// Start crowdfunding (admin only)
router.post('/:id/start', auth, adminAuth, async (req, res) => {
  try {
    const { endDate, description } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status !== 'listed') {
      return res.status(400).json({ message: 'Property must be listed to start crowdfunding' });
    }

    // Update property for crowdfunding
    property.status = 'crowdfunding';
    property.crowdfunding = {
      startDate: new Date(),
      endDate: new Date(endDate),
      description,
      currentAmount: 0,
      investors: []
    };

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Error starting crowdfunding campaign', error: error.message });
  }
});

// End crowdfunding campaign (admin only)
router.post('/:id/end', auth, adminAuth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property || property.status !== 'crowdfunding') {
      return res.status(404).json({ message: 'Crowdfunding campaign not found' });
    }

    // Check if funding goal is reached
    const isFunded = property.crowdfunding.currentAmount >= property.totalValue;
    property.status = isFunded ? 'funded' : 'listed';

    // If not funded, reset crowdfunding data
    if (!isFunded) {
      property.crowdfunding = undefined;
    }

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Error ending crowdfunding campaign', error: error.message });
  }
});

// Invest in property (authenticated users)
router.post('/:id/invest', auth, async (req, res) => {
  try {
    const { tokens } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property || property.status !== 'crowdfunding') {
      return res.status(404).json({ message: 'Crowdfunding campaign not found' });
    }

    // Check if crowdfunding is still active
    if (new Date() > property.crowdfunding.endDate) {
      return res.status(400).json({ message: 'Crowdfunding campaign has ended' });
    }

    // Check if enough tokens are available
    const availableTokens = property.totalTokens - 
      property.crowdfunding.investors.reduce((sum, inv) => sum + inv.tokens, 0);

    if (tokens > availableTokens) {
      return res.status(400).json({ message: 'Not enough tokens available' });
    }

    // Calculate investment amount
    const investmentAmount = tokens * property.tokenPrice;

    // Create transaction record
    const transaction = new Transaction({
      user: req.user._id,
      property: property._id,
      type: 'investment',
      amount: investmentAmount,
      tokens,
      status: 'pending',
      description: `Investment in ${property.name}`
    });

    // Add to crowdfunding investors
    property.crowdfunding.investors.push({
      user: req.user._id,
      tokens,
      investmentDate: new Date()
    });

    // Update current amount
    property.crowdfunding.currentAmount += investmentAmount;

    // Check if funding goal is reached
    if (property.crowdfunding.currentAmount >= property.totalValue) {
      property.status = 'funded';
    }

    await Promise.all([transaction.save(), property.save()]);

    res.json({
      message: 'Investment successful',
      transaction,
      property
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing investment', error: error.message });
  }
});

// Get user's investments
router.get('/user/investments', auth, async (req, res) => {
  try {
    const properties = await Property.find({
      'crowdfunding.investors.user': req.user._id
    })
    .populate('createdBy', 'name email')
    .select('name description location totalValue totalTokens status crowdfunding');

    const investments = properties.map(property => {
      const investment = property.crowdfunding.investors.find(
        inv => inv.user.toString() === req.user._id.toString()
      );
      return {
        property,
        tokens: investment.tokens,
        investmentDate: investment.investmentDate
      };
    });

    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investments', error: error.message });
  }
});

// Get crowdfunding statistics (admin only)
router.get('/admin/statistics', auth, adminAuth, async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments({ status: 'crowdfunding' });
    const fundedProperties = await Property.countDocuments({ status: 'funded' });
    const totalInvestments = await Transaction.countDocuments({ type: 'investment', status: 'completed' });
    const totalAmount = await Transaction.aggregate([
      { $match: { type: 'investment', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalProperties,
      fundedProperties,
      totalInvestments,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router; 