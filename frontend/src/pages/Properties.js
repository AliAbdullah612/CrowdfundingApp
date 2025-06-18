import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Alert,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Business as BusinessIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import PropertyList from '../components/properties/PropertyList';
import PropertyFilter from '../components/properties/PropertyFilter';

const Properties = () => {
  const { user } = useAuth();
  const { request, loading, error } = useApi();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      console.log('Fetching properties...');
      
      const data = await request({
        url: '/properties',
        method: 'GET'
      });
      
      console.log('Properties received:', data);
      
      setProperties(data || []);
      setFilteredProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  };

  const handleFilterChange = (filteredResults) => {
    console.log('Filtered results:', filteredResults);
    setFilteredProperties(filteredResults);
  };

  const isAdmin = user?.role === 'admin';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTotalValue = () => {
    return properties.reduce((total, property) => total + (property.totalValue || 0), 0);
  };

  const getAverageValue = () => {
    if (properties.length === 0) return 0;
    return getTotalValue() / properties.length;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }}
      />

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              mx: 'auto',
              mb: 2
            }}
          >
            <BusinessIcon sx={{ fontSize: 30, color: 'white' }} />
          </Avatar>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              mb: 1
            }}
          >
            Properties
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'white', 
              opacity: 0.9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mb: 3
            }}
          >
            <SearchIcon sx={{ fontSize: 18 }} />
            Discover and invest in premium real estate opportunities
          </Typography>
          {/* Statistics Cards Centered */}
          <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4} md={3}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    background: 'rgba(255, 255, 255, 0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center', color: 'white' }}>
                  <BusinessIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {properties.length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Total Properties
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    background: 'rgba(255, 255, 255, 0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center', color: 'white' }}>
                  <MoneyIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatPrice(getTotalValue())}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Total Value
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    background: 'rgba(255, 255, 255, 0.15)'
                  }
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center', color: 'white' }}>
                  <TrendingUpIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formatPrice(getAverageValue())}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Average Value
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Admin Create Property Button */}
        {isAdmin && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/properties/new')}
              sx={{
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                }
              }}
            >
              Create Property
            </Button>
          </Box>
        )}

        {/* Filter Card - Centered and Same Width as PropertyForm */}
        <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.15)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FilterIcon sx={{ color: '#667eea' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  Filters
                </Typography>
              </Box>
              <PropertyFilter properties={properties} onFilterChange={handleFilterChange} />
            </CardContent>
          </Card>
        </Box>

        {/* Property List Card - Centered and Same Width as PropertyForm */}
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.15)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#667eea' }} />
                </Box>
              ) : (
                <PropertyList
                  properties={filteredProperties}
                  loading={loading}
                  error={error}
                  isAdmin={isAdmin}
                />
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default Properties; 