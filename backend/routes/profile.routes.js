const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Property = require('../models/property.model');
const Transaction = require('../models/transaction.model');
const Voting = require('../models/voting.model');
const { auth, adminAuth, ownerAuth } = require('../middleware/auth.middleware');

// Get user profile
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's investments
    const investments = await Property.find({
      'crowdfunding.investors.user': user._id
    })
    .select('name location totalValue totalTokens status crowdfunding');

    // Get user's transactions
    const transactions = await Transaction.find({ user: user._id })
      .populate('property', 'name location')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's voting history
    const votingHistory = await Voting.find({
      'votes.user': user._id
    })
    .populate('property', 'name location')
    .sort({ endDate: -1 })
    .limit(10);

    res.json({
      user,
      investments: investments.map(property => {
        const investment = property.crowdfunding.investors.find(
          inv => inv.user.toString() === user._id.toString()
        );
        return {
          property,
          tokens: investment.tokens,
          investmentDate: investment.investmentDate
        };
      }),
      recentTransactions: transactions,
      votingHistory
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Update user profile
router.put('/user/:userId', ownerAuth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Block admin profile updates for security
    if (user.role === 'admin') {
      return res.status(403).json({ 
        message: 'Admin profile updates are not allowed for security reasons. Admin profiles are read-only.' 
      });
    }

    // Check if email is already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get admin profile
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const admin = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpires');

    // Get admin's properties
    const properties = await Property.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    // Get property statistics
    const propertyStats = {
      total: properties.length,
      listed: properties.filter(p => p.status === 'listed').length,
      crowdfunding: properties.filter(p => p.status === 'crowdfunding').length,
      funded: properties.filter(p => p.status === 'funded').length,
      sold: properties.filter(p => p.status === 'sold').length
    };

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .populate('user', 'name email')
      .populate('property', 'name location')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get active votings
    const activeVotings = await Voting.find({ status: 'active' })
      .populate('property', 'name location')
      .populate('createdBy', 'name email')
      .sort({ endDate: 1 });

    res.json({
      admin,
      properties,
      propertyStats,
      recentTransactions,
      activeVotings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin profile', error: error.message });
  }
});

// Get admin dashboard statistics
router.get('/admin/statistics', auth, adminAuth, async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Get property statistics
    const propertyStats = await Property.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalValue' }
        }
      }
    ]);

    // Get transaction statistics
    const transactionStats = await Transaction.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get voting statistics
    const votingStats = await Voting.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activity
    const recentActivity = await Transaction.find()
      .populate('user', 'name email')
      .populate('property', 'name location')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      propertyStats: propertyStats.reduce((acc, curr) => {
        acc[curr._id] = { count: curr.count, totalValue: curr.totalValue };
        return acc;
      }, {}),
      transactionStats: transactionStats.reduce((acc, curr) => {
        acc[curr._id] = { count: curr.count, totalAmount: curr.totalAmount };
        return acc;
      }, {}),
      votingStats: votingStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// Get user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, dateOfBirth } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Block admin profile updates for security
    if (user.role === 'admin') {
      return res.status(403).json({ 
        message: 'Admin profile updates are not allowed for security reasons. Admin profiles are read-only.' 
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Validate date of birth if provided
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        return res.status(400).json({ message: 'You must be at least 18 years old' });
      }
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Admin Dashboard - Get all registered users
router.get('/admin/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });
    
    res.json({
      totalUsers: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// User Dashboard - Get user's transactions
router.get('/user/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate({
        path: 'property',
        select: 'name description location totalValue totalTokens images status'
      })
      .sort({ createdAt: -1 });
    
    // Calculate statistics
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalTokens = transactions
      .filter(t => t.type === 'investment' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.tokens || 0), 0);
    
    res.json({
      totalTransactions,
      totalAmount,
      totalTokens,
      transactions: transactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// Get admin statistics
router.get('/admin/statistics', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProperties = await Property.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    
    res.json({
      totalUsers,
      totalProperties,
      totalTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router; 