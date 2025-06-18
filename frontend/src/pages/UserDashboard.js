import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
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
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  ArrowForward as ArrowForwardIcon,
  Search as SearchIcon,
  HowToVote as VoteIcon,
  GroupWork as CrowdfundingIcon,
  AccountCircle as ProfileIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { request, loading, error } = useApi();
  const [recentProperties, setRecentProperties] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch recent properties
      const propertiesData = await request({
        url: '/properties',
        method: 'GET'
      });
      setRecentProperties(propertiesData?.slice(0, 5) || []);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setRecentProperties([]);
    }
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

  const quickActions = [
    {
      icon: <SearchIcon />,
      title: 'Browse Properties',
      description: 'Explore all available properties',
      action: () => navigate('/properties'),
      color: '#667eea'
    },
    {
      icon: <VisibilityIcon />,
      title: 'Available Properties',
      description: 'View properties ready for investment',
      action: () => navigate('/properties?status=listed'),
      color: '#27ae60'
    },
    {
      icon: <ProfileIcon />,
      title: 'My Profile',
      description: 'Manage your account settings',
      action: () => navigate('/profile'),
      color: '#9b59b6'
    }
  ];

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
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <DashboardIcon sx={{ fontSize: 30, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
              >
                User Dashboard
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'white', 
                  opacity: 0.9,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <PersonIcon sx={{ fontSize: 18 }} />
                Welcome back! Here's your investment overview
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* User Info Card */}
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
                  width: 80, 
                  height: 80,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                }}
              >
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 1 }}>
                  Hello, {user?.name}!
                </Typography>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    icon={<PersonIcon />}
                    label="Investor" 
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
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
                    '& .action-icon': {
                      transform: 'scale(1.1)',
                    }
                  }
                }}
                onClick={action.action}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box 
                    className="action-icon"
                    sx={{ 
                      color: action.color, 
                      mb: 2,
                      transition: 'transform 0.3s ease-in-out'
                    }}
                  >
                    {React.cloneElement(action.icon, { sx: { fontSize: 40 } })}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 1 }}
                  >
                    {action.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    sx={{ mb: 2, lineHeight: 1.5 }}
                  >
                    {action.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: action.color,
                      color: action.color,
                      '&:hover': {
                        borderColor: action.color,
                        background: `${action.color}10`
                      }
                    }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Explore
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Properties */}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon sx={{ color: '#667eea', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  Recent Properties
                </Typography>
              </Box>
              <Button 
                variant="outlined"
                onClick={() => navigate('/properties')}
                sx={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#667eea',
                    background: 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                endIcon={<ArrowForwardIcon />}
              >
                View All Properties
              </Button>
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
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentProperties.map((property) => (
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
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => navigate(`/properties/${property._id}`)}
                            sx={{
                              borderColor: '#667eea',
                              color: '#667eea',
                              '&:hover': {
                                borderColor: '#667eea',
                                background: 'rgba(102, 126, 234, 0.1)'
                              }
                            }}
                          >
                            View Details
                          </Button>
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
                <Typography color="textSecondary" variant="body2" sx={{ mt: 1 }}>
                  Start exploring properties to see them here
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default UserDashboard; 