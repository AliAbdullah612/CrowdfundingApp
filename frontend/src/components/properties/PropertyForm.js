import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';

const PropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request, loading, error } = useApi();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    totalValue: '',
    totalTokens: '',
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const data = await request({
        url: `/properties/${id}`,
        method: 'GET'
      });
      setFormData(data);
    } catch (err) {
      console.error('Error fetching property:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission started', { id, formData, imageFiles });
    
    // Validate required fields
    if (!formData.name || !formData.description || !formData.location.address || 
        !formData.location.city || !formData.location.state || !formData.location.country || 
        !formData.location.zipCode || !formData.totalValue || !formData.totalTokens) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate that at least one image is selected (only for new properties)
    if (!id && imageFiles.length === 0) {
      alert('Please upload at least one image');
      return;
    }
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'location') {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (key !== 'images') { // Don't send existing images array
        formDataToSend.append(key, formData[key]);
      }
    });

    // Only append new images if any are selected
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });
    }

    console.log('FormData contents:');
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }

    try {
      if (id) {
        console.log('Updating property with ID:', id);
        const result = await request({
          url: `/properties/${id}`,
          method: 'PUT',
          data: formDataToSend,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Update successful:', result);
        alert('Property updated successfully!');
      } else {
        console.log('Creating new property');
        const result = await request({
          url: '/properties',
          method: 'POST',
          data: formDataToSend,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Create successful:', result);
        alert('Property created successfully!');
      }
      navigate('/properties');
    } catch (err) {
      console.error('Error saving property:', err);
      console.error('Error response:', err.response?.data);
      
      // Show specific error message
      const errorMessage = err.response?.data?.message || 'An error occurred while saving the property';
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Property' : 'Create Property'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Property Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            name="location.address"
            value={formData.location.address}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            name="location.city"
            value={formData.location.city}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="State"
            name="location.state"
            value={formData.location.state}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Country"
            name="location.country"
            value={formData.location.country}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="ZIP Code"
            name="location.zipCode"
            value={formData.location.zipCode}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Total Value"
            name="totalValue"
            type="number"
            value={formData.totalValue}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Total Tokens"
            name="totalTokens"
            type="number"
            value={formData.totalTokens}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Property Images {!id && <span style={{ color: 'red' }}>*</span>}
          </Typography>
          
          {/* Show existing images if editing */}
          {id && formData.images && formData.images.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Images:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formData.images.map((image, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <img 
                      src={`http://localhost:5000/${image}`} 
                      alt={`Property ${index + 1}`}
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                  </Box>
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Upload new images to add to existing ones
              </Typography>
            </Box>
          )}
          
          <input
            accept="image/*"
            type="file"
            multiple
            onChange={handleImageChange}
            style={{ display: 'none' }}
            id="property-images"
            required={!id} // Only required for new properties
          />
          <label htmlFor="property-images">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              sx={{ 
                borderColor: (!id && imageFiles.length === 0) ? 'red' : 'primary.main',
                color: (!id && imageFiles.length === 0) ? 'red' : 'primary.main'
              }}
            >
              {id ? 'Add New Images' : 'Upload Images'}
            </Button>
          </label>
          {imageFiles.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
              {imageFiles.length} new image(s) selected
            </Typography>
          )}
          {!id && imageFiles.length === 0 && (
            <Typography variant="body2" sx={{ mt: 1, color: 'error.main' }}>
              At least one image is required for new properties
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/properties')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : (id ? 'Update' : 'Create')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PropertyForm; 