const express = require('express');
const router = express.Router();
const Property = require('../models/property.model');
const { auth, adminAuth } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');
const propertyController = require('../controllers/property.controller');

// Get all properties (public)
router.get('/', propertyController.getAllProperties);

// Get single property (public)
router.get('/:id', propertyController.getProperty);

// Create property (admin only)
router.post(
  '/',
  auth,
  adminAuth,
  upload.array('images', 5),
  handleUploadError,
  propertyController.createProperty
);

// Update property (admin only)
router.put('/:id', auth, adminAuth, upload.array('images', 5), handleUploadError, propertyController.updateProperty);

// Delete property (admin only)
router.delete('/:id', auth, adminAuth, propertyController.deleteProperty);

// Remove property image (admin only)
router.delete('/:id/images/:imageIndex', auth, adminAuth, propertyController.removePropertyImage);

// Get properties by status
router.get('/status/:status', propertyController.getPropertiesByStatus);

// Get properties created by admin
router.get('/admin/properties', auth, adminAuth, propertyController.getAdminProperties);

// Add purchase route
router.post('/:id/purchase', auth, propertyController.purchaseProperty);

module.exports = router; 