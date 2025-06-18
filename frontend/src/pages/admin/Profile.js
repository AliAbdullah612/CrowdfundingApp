import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AdminPanelSettings as AdminIcon,
  VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';

const AdminProfile = () => {
  const { user } = useAuth();
  const { request, loading, error } = useApi();
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalTransactions: 0
  });
  const [recentProperties, setRecentProperties] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch admin statistics
      const statsResponse = await request({
        url: '/profile/admin/statistics',
        method: 'GET'
      });
      setAdminStats(statsResponse);

      // Fetch recent properties
      const propertiesResponse = await request({
        url: '/properties',
        method: 'GET'
      });
      setRecentProperties(propertiesResponse?.slice(0, 5) || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          p: 4
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Gradient Background */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AdminIcon sx={{ fontSize: 40 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Admin Profile
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Manage and oversee the PropFund platform
          </Typography>
        </Box>
      </Box>

      {/* Admin Info Card */}
      <Card 
        sx={{ 
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.15)',
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '2rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {user?.name}
                </Typography>
                <Tooltip title="Verified Administrator">
                  <VerifiedIcon sx={{ color: '#667eea', fontSize: 20 }} />
                </Tooltip>
              </Box>
              <Typography 
                color="textSecondary" 
                sx={{ 
                  fontSize: '1.1rem',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <PersonIcon sx={{ fontSize: 18 }} />
                {user?.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip 
                  icon={<AdminIcon />}
                  label="Administrator" 
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    '& .MuiChip-icon': {
                      color: 'white'
                    }
                  }}
                />
              </Box>
              <Typography 
                variant="body2" 
                color="textSecondary" 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CalendarIcon sx={{ fontSize: 16 }} />
                Account Created: {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Platform Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
              }
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {adminStats.totalUsers}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Total Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
              }
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <BusinessIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {adminStats.totalProperties}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Total Properties
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
              }
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <MoneyIcon sx={{ fontSize: 40, mb: 2, opacity: 0.8 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {adminStats.totalTransactions}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Total Transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Properties */}
      <Card 
        sx={{ 
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.15)',
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <TrendingUpIcon sx={{ color: '#667eea', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
              Recent Properties
            </Typography>
          </Box>
          
          {recentProperties.length > 0 ? (
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden'
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Property Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Value</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentProperties.map((property, index) => (
                    <TableRow 
                      key={property._id}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: 'rgba(102, 126, 234, 0.02)' },
                        '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.05)' },
                        transition: 'background-color 0.2s ease-in-out'
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                          {property.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon sx={{ fontSize: 16, color: '#667eea' }} />
                          <Typography variant="body2">
                            {property.location?.city}, {property.location?.state}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#27ae60' }}>
                          {formatPrice(property.totalValue)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={property.status} 
                          color={property.status === 'listed' ? 'primary' : 'secondary'}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold',
                            background: property.status === 'listed' 
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : undefined
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: '#667eea' }} />
                          <Typography variant="body2">
                            {formatDate(property.createdAt)}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BusinessIcon sx={{ fontSize: 60, color: '#bdc3c7', mb: 2 }} />
              <Typography color="textSecondary" variant="h6">
                No properties available
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Admin Information */}
      <Card 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(102, 126, 234, 0.15)',
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <AdminIcon sx={{ color: '#667eea', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
              Administrator Information
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: '#34495e' }}>
            As an administrator, you have full access to manage the PropFund platform. 
            You can create and manage properties, oversee transactions, and monitor platform activity.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.6 }}>
            This profile displays read-only information about your account and platform statistics. 
            For security reasons, administrator profile information cannot be modified through this interface.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminProfile; 