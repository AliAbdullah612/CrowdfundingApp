const Property = require('../models/property.model');
const Transaction = require('../models/transaction.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get all properties
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
};

// Get single property
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('crowdfunding.investors.user', 'name email');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching property', error: error.message });
  }
};

// Create property
exports.createProperty = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      totalValue,
      totalTokens
    } = req.body;

    // Validate required fields
    if (!name || !description || !location || !totalValue || !totalTokens) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, description, location, totalValue, totalTokens' 
      });
    }

    // Parse location object if it's a string
    let locationObj;
    try {
      locationObj = typeof location === 'string' ? JSON.parse(location) : location;
    } catch (parseError) {
      return res.status(400).json({ 
        message: 'Invalid location format. Location must be a valid JSON object' 
      });
    }

    // Validate location object structure
    if (!locationObj.address || !locationObj.city || !locationObj.state || 
        !locationObj.country || !locationObj.zipCode) {
      return res.status(400).json({ 
        message: 'Location must include address, city, state, country, and zipCode' 
      });
    }

    // Handle uploaded images
    const images = req.files ? req.files.map(file => file.path) : [];

    // Validate that at least one image is uploaded
    if (images.length === 0) {
      return res.status(400).json({ 
        message: 'At least one image is required' 
      });
    }

    const property = await Property.create({
      name,
      description,
      location: locationObj,
      totalValue: Number(totalValue),
      totalTokens: Number(totalTokens),
      images,
      createdBy: req.user._id,
      status: 'listed'
    });

    res.status(201).json(property);
  } catch (error) {
    console.error('Property creation error:', error);
    res.status(500).json({ message: 'Error creating property', error: error.message });
  }
};

// Update property
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if property can be updated
    if (property.status !== 'listed') {
      return res.status(400).json({
        message: 'Cannot update property that is not in listed status'
      });
    }

    const {
      name,
      description,
      location,
      totalValue,
      totalTokens,
      status
    } = req.body;

    // Handle location object if provided
    if (location) {
      try {
        property.location = typeof location === 'string' ? JSON.parse(location) : location;
      } catch (parseError) {
        return res.status(400).json({ 
          message: 'Invalid location format. Location must be a valid JSON object' 
        });
      }
    }

    // Handle new images if provided
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      property.images = [...property.images, ...newImages];
    }

    // Update other fields if provided
    if (name) property.name = name;
    if (description) property.description = description;
    if (totalValue) property.totalValue = Number(totalValue);
    if (totalTokens) property.totalTokens = Number(totalTokens);
    if (status) property.status = status;

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Error updating property', error: error.message });
  }
};

// Delete property
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if property can be deleted
    if (property.status !== 'listed') {
      return res.status(400).json({
        message: 'Cannot delete property that is not in listed status'
      });
    }

    await Property.deleteOne({ _id: req.params.id });
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting property', error: error.message });
  }
};

// Remove property image
exports.removePropertyImage = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    const imageIndex = parseInt(req.params.imageIndex);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (imageIndex < 0 || imageIndex >= property.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    // Remove image
    property.images.splice(imageIndex, 1);
    await property.save();

    res.json({ message: 'Image removed successfully', property });
  } catch (error) {
    res.status(500).json({ message: 'Error removing image', error: error.message });
  }
};

// Get properties by status
exports.getPropertiesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const properties = await Property.find({ status })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
};

// Get admin properties
exports.getAdminProperties = async (req, res) => {
  try {
    const properties = await Property.find({ createdBy: req.user._id })
      .populate('crowdfunding.investors.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
};

exports.purchaseProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const { paymentIntentId } = req.body;
    const userId = req.user._id;

    // 1. Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // 2. Find and update transaction
    const transaction = await Transaction.findOneAndUpdate(
      { stripePaymentId: paymentIntentId, user: userId, property: propertyId },
      { status: 'completed' },
      { new: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    // 3. Update property status (optional: mark as sold)
    await Property.findByIdAndUpdate(propertyId, { status: 'sold' });

    res.json({ success: true, message: 'Property purchased successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 