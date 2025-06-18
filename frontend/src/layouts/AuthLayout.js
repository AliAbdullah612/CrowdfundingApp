import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Box, Card, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const AuthLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography variant="h5" component="div" sx={{ marginLeft: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Card
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            PropFund
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Property Investment Platform
          </Typography>
        </Box>
        <Outlet />
      </Card>
    </Box>
  );
};

export default AuthLayout; 