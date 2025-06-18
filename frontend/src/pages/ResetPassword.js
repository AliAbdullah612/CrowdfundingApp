import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Container, Alert } from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const { token } = useParams();
  const { resetPassword, loading } = useAuth();
  const [form, setForm] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await resetPassword(token, form.password);
      setSuccess('Password reset successful');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Box sx={{ boxShadow: 3, p: 4, borderRadius: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h4" fontWeight={700} mb={2} align="center">Reset Password</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, py: 1.2, fontWeight: 600 }}
            disabled={loading}
          >
            Reset Password
          </Button>
        </form>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            <Link to="/login">Back to Login</Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPassword; 