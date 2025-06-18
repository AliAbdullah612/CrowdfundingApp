import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import PaymentForm from '../components/payment/PaymentForm';
import { toast } from 'react-toastify';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request, loading, error } = useApi();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const data = await request({
        url: `/properties/${id}`,
        method: 'GET'
      });
      setProperty(data);
    } catch (err) {
      console.error('Error fetching property:', err);
    }
  };

  const handleEdit = () => {
    navigate(`/properties/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await request({
          url: `/properties/${id}`,
          method: 'DELETE'
        });
        navigate('/properties');
      } catch (err) {
        console.error('Error deleting property:', err);
      }
    }
  };

  const handleBuyClick = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (paymentIntent) => {
    toast.success('Property purchased successfully!');
    setShowPaymentForm(false);
    // Refresh property data to show updated status
    fetchProperty();
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading property: {error}</Alert>;
  }

  if (!property) {
    return <Alert severity="info">Property not found.</Alert>;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Property Images */}
      {property.images && property.images.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardMedia
            component="img"
            height="400"
            image={property.images[0]}
            alt={property.name}
            sx={{ objectFit: 'cover' }}
          />
        </Card>
      )}

      {/* Property Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          {property.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip 
            label={property.status} 
            color={property.status === 'listed' ? 'primary' : 'secondary'}
            variant="outlined"
          />
        </Box>
        <Typography variant="h5" color="primary" gutterBottom>
          ${property.totalValue?.toLocaleString()}
        </Typography>
      </Box>

      {/* Property Details Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>Description</Typography>
          <Typography variant="body1" paragraph>
            {property.description}
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Property Details</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Total Value</Typography>
              <Typography variant="h6">${property.totalValue?.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Total Tokens</Typography>
              <Typography variant="h6">{property.totalTokens?.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Token Price</Typography>
              <Typography variant="h6">${property.tokenPrice?.toFixed(2)}</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Location Information */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Location</Typography>
        <Typography variant="body1">
          {property.location?.address}, {property.location?.city}, {property.location?.state} {property.location?.zipCode}
        </Typography>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/properties')}
        >
          Back to Properties
        </Button>
        
        {/* User Buy Button */}
        {!isAdmin && property.status === 'listed' && (
          <Button 
            variant="contained" 
            color="success" 
            size="large"
            onClick={handleBuyClick}
          >
            Buy Property
          </Button>
        )}
        
        {/* Admin Controls */}
        {isAdmin && (
          <>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleEdit}
            >
              Edit Property
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleDelete}
              disabled={property.status === 'crowdfunding' || property.status === 'funded'}
            >
              Delete Property
            </Button>
          </>
        )}
      </Box>

      {/* Payment Dialog */}
      <Dialog 
        open={showPaymentForm} 
        onClose={handlePaymentCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Purchase Property</DialogTitle>
        <DialogContent>
          <PaymentForm
            property={property}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PropertyDetail; 