import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_CONFIG, { ENDPOINTS } from '../../config/api.config';
import axios from 'axios';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

const steps = ['Enter Email & Date of Birth', 'Reset Password'];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    dateOfBirth: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.dateOfBirth) {
      setError('Please fill in both email and date of birth');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_CONFIG.baseURL}${ENDPOINTS.AUTH.VERIFY_DOB}`, {
        email: formData.email,
        dateOfBirth: formData.dateOfBirth
      });
      
      // Store the reset token from the response
      setResetToken(response.data.resetToken);
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_CONFIG.baseURL}${ENDPOINTS.AUTH.RESET_PASSWORD}`, {
        resetToken,
        newPassword: formData.newPassword
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={handleEmailSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
            />

            <TextField
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box component="form" onSubmit={handlePasswordReset}>
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              margin="normal"
              helperText="Password must be at least 8 characters long"
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              margin="normal"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Reset Password
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Back to Login
        </Button>
      </Paper>
    </Container>
  );
};

export default ForgotPassword; 