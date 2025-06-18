import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  Avatar,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  ArrowForward as ArrowForwardIcon,
  VerifiedUser as VerifiedIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Don't render the home page if user is authenticated (they'll be redirected)
  if (isAuthenticated) {
    return null;
  }

  const features = [
    {
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      title: "Premium Properties",
      description: "Access to high-quality real estate investments across diverse markets"
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Secure Platform",
      description: "Bank-level security with transparent transaction tracking"
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: "Community Driven",
      description: "Vote on projects and participate in community decisions"
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: "Smart Investing",
      description: "Data-driven insights and professional property analysis"
    }
  ];

  const stats = [
    { number: "500+", label: "Properties Listed" },
    { number: "$50M+", label: "Total Investment" },
    { number: "10K+", label: "Active Investors" },
    { number: "95%", label: "Success Rate" }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
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

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                mb: 2
              }}
            >
              <HomeIcon sx={{ fontSize: 60, color: 'white' }} />
            </Avatar>
          </Box>
          
          <Typography 
            variant="h2" 
            color="white" 
            fontWeight={700} 
            gutterBottom
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              mb: 3
            }}
          >
            Invest in Real Estate
            <br />
            <Box component="span" sx={{ 
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800
            }}>
              Empower Communities
            </Box>
          </Typography>
          
          <Typography 
            variant="h5" 
            color="white" 
            sx={{ 
              mb: 4, 
              opacity: 0.9,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            PropFund is a next-generation property crowdfunding platform.
            <br />
            Discover, invest, and vote on real estate projects with ease.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/login"
              sx={{ 
                fontWeight: 600, 
                px: 4, 
                py: 1.5, 
                fontSize: '1.1rem',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
                },
                transition: 'all 0.3s ease-in-out'
              }}
              endIcon={<ArrowForwardIcon />}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/register"
              sx={{ 
                fontWeight: 600, 
                px: 4, 
                py: 1.5, 
                fontSize: '1.1rem',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease-in-out'
              }}
            >
              Sign Up
            </Button>
          </Box>
        </Box>

        {/* Statistics Section */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  textAlign: 'center',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    background: 'rgba(255, 255, 255, 0.15)'
                  }
                }}
              >
                <CardContent sx={{ py: 3 }}>
                  <Typography 
                    variant="h3" 
                    color="white" 
                    fontWeight={700}
                    sx={{ mb: 1 }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="white" 
                    sx={{ opacity: 0.8 }}
                  >
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Features Section */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            color="white" 
            textAlign="center" 
            fontWeight={600}
            sx={{ mb: 4 }}
          >
            Why Choose PropFund?
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      background: 'rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ color: 'white', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      color="white" 
                      fontWeight={600}
                      sx={{ mb: 2 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="white" 
                      sx={{ opacity: 0.8, lineHeight: 1.6 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ textAlign: 'center' }}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              p: 4
            }}
          >
            <CardContent>
              <Typography 
                variant="h5" 
                color="white" 
                fontWeight={600}
                sx={{ mb: 2 }}
              >
                Ready to Start Your Investment Journey?
              </Typography>
              <Typography 
                variant="body1" 
                color="white" 
                sx={{ opacity: 0.8, mb: 3 }}
              >
                Join thousands of investors who trust PropFund for their real estate investments
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/register"
                sx={{ 
                  fontWeight: 600, 
                  px: 5, 
                  py: 1.5, 
                  fontSize: '1.2rem',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FFA500, #FFD700)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
                endIcon={<VerifiedIcon />}
              >
                Join Now
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 