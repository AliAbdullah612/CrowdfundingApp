import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PropertyCard = ({ property, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Debug logging
  React.useEffect(() => {
    console.log('PropertyCard received property:', property);
  }, [property]);

  // Handle missing property data
  if (!property) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Property data is missing
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleView = () => {
    navigate(`/properties/${property._id}`);
  };

  const handleEdit = () => {
    navigate(`/properties/${property._id}/edit`);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(property._id, property.name);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'listed':
        return 'primary';
      case 'crowdfunding':
        return 'warning';
      case 'funded':
        return 'success';
      case 'sold':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
      }
    }}>
      {/* Property Image */}
      <CardMedia
        component="img"
        height="200"
        image={property.images?.[0] ? `http://localhost:5000/${property.images[0]}` : '/placeholder-property.jpg'}
        alt={property.name || 'Property'}
        sx={{ objectFit: 'cover' }}
        onError={(e) => {
          e.target.src = '/placeholder-property.jpg';
        }}
      />

      {/* Property Content */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
            {property.name || 'Unnamed Property'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {property.location?.address || 'Address not available'}, {property.location?.city || 'City not available'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={property.status || 'unknown'} 
              color={getStatusColor(property.status)}
              size="small"
              variant="outlined"
            />
            {property.crowdfunding && property.crowdfunding.currentAmount > 0 && property.totalValue > 0 && (
              <Chip 
                label={`${((property.crowdfunding.currentAmount / property.totalValue) * 100).toFixed(1)}% Funded`}
                color="success"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Property Details */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
            {formatPrice(property.totalValue)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            {property.totalTokens?.toLocaleString() || 0} tokens available
          </Typography>
          
          {property.tokenPrice && (
            <Typography variant="body2" color="text.secondary">
              ${property.tokenPrice.toFixed(2)} per token
            </Typography>
          )}
        </Box>

        {/* Description Preview */}
        {property.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {property.description}
          </Typography>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="small"
            onClick={handleView}
            startIcon={<VisibilityIcon />}
            sx={{ flex: 1 }}
          >
            View
          </Button>
          
          {/* User Buy Button */}
          {!isAdmin && property.status === 'listed' && (
            <Button 
              variant="contained" 
              color="success" 
              size="small"
              onClick={() => navigate(`/properties/${property._id}`)}
              sx={{ flex: 1 }}
            >
              Buy
            </Button>
          )}
          
          {isAdmin && (
            <>
              <Tooltip title="Edit Property">
                <IconButton 
                  color="primary" 
                  size="small"
                  onClick={handleEdit}
                  sx={{ border: '1px solid', borderColor: 'primary.main' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete Property">
                <IconButton 
                  color="error" 
                  size="small"
                  onClick={handleDelete}
                  disabled={property.status === 'crowdfunding' || property.status === 'funded'}
                  sx={{ border: '1px solid', borderColor: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PropertyCard; 