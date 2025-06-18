import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
          404
        </Typography>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Page Not Found
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          The page you are looking for does not exist.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Go Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 