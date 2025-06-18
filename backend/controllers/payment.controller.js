const { createPaymentIntent, constructEventFromPayload } = require('../config/stripe');
const Transaction = require('../models/transaction.model');
const Property = require('../models/property.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Debug: Check if Stripe key is loaded
console.log('Stripe secret key loaded:', process.env.STRIPE_SECRET_KEY ? 'Yes' : 'No');

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { transactionId } = req.body;

    // Get transaction
    const transaction = await Transaction.findById(transactionId)
      .populate('property', 'name totalValue totalTokens tokenPrice');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check authorization
    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check transaction status
    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction is not pending' });
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(transaction.amount, {
      transactionId: transaction._id.toString(),
      userId: req.user.id,
      propertyId: transaction.property._id.toString()
    });

    // Update transaction with payment intent ID
    transaction.stripePaymentId = paymentIntent.id;
    await transaction.save();

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
};

// Handle webhook
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const event = constructEventFromPayload(req.body, signature);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleSuccessfulPayment(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handleFailedPayment(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: 'Webhook error', error: error.message });
  }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('property', 'name location totalValue totalTokens')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

// Get transaction details
exports.getTransactionDetails = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('property', 'name location totalValue totalTokens')
      .populate('user', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check authorization
    if (transaction.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transaction', error: error.message });
  }
};

// Helper function to handle successful payment
const handleSuccessfulPayment = async (paymentIntent) => {
  try {
    const transaction = await Transaction.findOne({
      stripePaymentId: paymentIntent.id
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update transaction status
    transaction.status = 'completed';
    transaction.completedAt = new Date();
    await transaction.save();

    // Update property crowdfunding
    const property = await Property.findById(transaction.property);
    if (property && property.status === 'crowdfunding') {
      // Add investor
      property.crowdfunding.investors.push({
        user: transaction.user,
        tokens: transaction.tokens,
        investmentDate: new Date()
      });

      // Update total raised
      property.crowdfunding.totalRaised += transaction.amount;

      // Check if funding goal is reached
      if (property.crowdfunding.totalRaised >= property.totalValue) {
        property.status = 'funded';
      }

      await property.save();
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
};

// Helper function to handle failed payment
const handleFailedPayment = async (paymentIntent) => {
  try {
    const transaction = await Transaction.findOne({
      stripePaymentId: paymentIntent.id
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update transaction status
    transaction.status = 'failed';
    transaction.failedAt = new Date();
    transaction.failureReason = paymentIntent.last_payment_error?.message;
    await transaction.save();
  } catch (error) {
    console.error('Error handling failed payment:', error);
    throw error;
  }
};

exports.buyProperty = async (req, res) => {
  try {
    console.log('buyProperty called with:', req.body);
    const { propertyId } = req.body;
    const userId = req.user._id;

    console.log('Property ID:', propertyId, 'User ID:', userId);

    // 1. Find property
    const property = await Property.findById(propertyId);
    if (!property) {
      console.log('Property not found:', propertyId);
      return res.status(404).json({ message: 'Property not found' });
    }

    console.log('Property found:', property.name, 'Total value:', property.totalValue);

    // 2. Create Stripe PaymentIntent first
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(property.totalValue * 100), // cents
      currency: 'usd',
      metadata: {
        propertyId: propertyId,
        userId: userId.toString()
      }
    });

    console.log('Payment intent created:', paymentIntent.id);

    // 3. Create transaction with stripePaymentId
    const transaction = await Transaction.create({
      user: userId,
      property: propertyId,
      type: 'investment',
      amount: property.totalValue,
      tokens: 1,
      status: 'pending',
      stripePaymentId: paymentIntent.id
    });

    console.log('Transaction created:', transaction._id);

    const response = { clientSecret: paymentIntent.client_secret, transactionId: transaction._id };
    console.log('Sending response:', { clientSecret: !!response.clientSecret, transactionId: response.transactionId });
    
    res.json(response);
  } catch (error) {
    console.error('Error in buyProperty:', error);
    res.status(500).json({ message: error.message });
  }
}; 