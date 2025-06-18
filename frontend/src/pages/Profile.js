import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Alert,
  Grid,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { request, loading, error } = useApi();
  const [form, setForm] = useState({
    name: '',
    email: '',
    dateOfBirth: ''
  });
  const [success, setSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [purchasedProperties, setPurchasedProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  // Redirect admins to admin profile page
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/profile');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      setForm({
        name: user.name || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
      });
      fetchPurchasedProperties();
    }
  }, [user]);

  const fetchPurchasedProperties = async () => {
    setPropertiesLoading(true);
    try {
      // Fetch user's completed transactions
      const transactions = await request({
        url: '/payments/transactions',
        method: 'GET'
      });
      
      // Filter for completed property purchases
      const completedPurchases = transactions.filter(
        transaction => transaction.status === 'completed' && transaction.type === 'investment'
      );
      
      setPurchasedProperties(completedPurchases);
    } catch (err) {
      console.error('Error fetching purchased properties:', err);
      setPurchasedProperties([]);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setProfileError('');
    try {
      const response = await request({
        url: '/profile/me',
        method: 'PUT',
        data: form
      });
      
      // Update the user context with new data
      if (response.user) {
        // You might want to update the auth context here
        console.log('Profile updated:', response.user);
      }
      
      setSuccess(response.message || 'Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      // Show more specific error message
      const errorMessage = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setProfileError(errorMessage);
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80 }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {user?.name}
                  </Typography>
                  <Typography color="textSecondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>

              {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <form onSubmit={handleSubmit}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Purchased Properties */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                My Purchased Properties
              </Typography>
              
              {propertiesLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress />
                </Box>
              ) : purchasedProperties.length > 0 ? (
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Property</TableCell>
                        <TableCell>Purchase Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {purchasedProperties.map((transaction) => (
                        <TableRow key={transaction._id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {transaction.property?.name || 'Property'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {transaction.property?.location?.city}, {transaction.property?.location?.state}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatDate(transaction.createdAt)}
                          </TableCell>
                          <TableCell>
                            {formatPrice(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={transaction.status} 
                              color={transaction.status === 'completed' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary" gutterBottom>
                    You haven't purchased any properties yet
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => navigate('/properties')}
                    sx={{ mt: 2 }}
                  >
                    Browse Properties
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Property Summary */}
      {purchasedProperties.length > 0 && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Investment Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {purchasedProperties.length}
                  </Typography>
                  <Typography color="textSecondary">
                    Properties Owned
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {formatPrice(purchasedProperties.reduce((sum, t) => sum + t.amount, 0))}
                  </Typography>
                  <Typography color="textSecondary">
                    Total Investment
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {formatDate(purchasedProperties[0]?.createdAt)}
                  </Typography>
                  <Typography color="textSecondary">
                    First Purchase
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Profile; 