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
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { request, loading, error } = useApi();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Admin Dashboard
      </Typography>

      {/* Admin Info Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Hello, {user?.name}!
              </Typography>
              <Typography color="textSecondary">
                {user?.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Role:
                </Typography>
                <Chip 
                  label="Admin" 
                  color="primary"
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Admin Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/properties')}
              size="large"
            >
              Manage Properties
            </Button>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate('/properties/new')}
            >
              Create Property
            </Button>
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={() => navigate('/voting')}
            >
              Manage Voting
            </Button>
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={() => navigate('/crowdfunding')}
            >
              Manage Crowdfunding
            </Button>
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={() => navigate('/profile')}
            >
              My Profile
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Admin Welcome Message */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Welcome to PropFund Admin
          </Typography>
          <Typography variant="body1" paragraph>
            As an admin, you can manage properties, create new listings, and oversee the platform's operations. 
            Use the quick actions above to get started with managing the platform.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            You have full access to create, edit, and delete properties, as well as manage voting and crowdfunding campaigns.
          </Typography>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Platform Overview
          </Typography>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography color="textSecondary">
              Platform statistics and recent activities will be displayed here
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate('/properties')}
              sx={{ mt: 2 }}
            >
              View All Properties
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminDashboard; 