const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/transaction.model');
const Property = require('../models/property.model');
const { auth } = require('../middleware/auth.middleware');
const paymentController = require('../controllers/payment.controller');

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction is not pending' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(transaction.amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        transactionId: transaction._id.toString(),
        userId: req.user._id.toString(),
        propertyId: transaction.property.toString()
      }
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
});

// Handle successful payment
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;
  }

  res.json({ received: true });
});

// Get transaction history
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('property', 'name location')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// Get transaction details
router.get('/transactions/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('property', 'name location totalValue totalTokens')
      .populate('user', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transaction', error: error.message });
  }
});

// Create payment intent for property purchase
router.post('/buy-property', auth, paymentController.buyProperty);

// Confirm payment (for non-webhook approach)
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId, propertyId } = req.body;
    const userId = req.user._id;

    // 1. Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // 2. Find and update transaction
    const transaction = await Transaction.findOneAndUpdate(
      { stripePaymentId: paymentIntentId, user: userId, property: propertyId },
      { 
        status: 'completed',
        stripeChargeId: paymentIntent.latest_charge
      },
      { new: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // 3. Update property status to sold
    await Property.findByIdAndUpdate(propertyId, { status: 'sold' });

    res.json({ 
      success: true, 
      message: 'Property purchased successfully!',
      transaction: transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming payment', error: error.message });
  }
});

// Helper function to handle successful payment
async function handleSuccessfulPayment(paymentIntent) {
  try {
    const transaction = await Transaction.findOne({
      stripePaymentId: paymentIntent.id
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update transaction status
    transaction.status = 'completed';
    transaction.stripeChargeId = paymentIntent.latest_charge;
    await transaction.save();

    // Update property crowdfunding status if needed
    const property = await Property.findById(transaction.property);
    if (property && property.status === 'crowdfunding') {
      const totalInvested = property.crowdfunding.investors.reduce(
        (sum, inv) => sum + (inv.tokens * property.tokenPrice),
        0
      );

      if (totalInvested >= property.totalValue) {
        property.status = 'funded';
        await property.save();
      }
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

// Helper function to handle failed payment
async function handleFailedPayment(paymentIntent) {
  try {
    const transaction = await Transaction.findOne({
      stripePaymentId: paymentIntent.id
    });

    if (transaction) {
      transaction.status = 'failed';
      await transaction.save();
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

module.exports = router; 