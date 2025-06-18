import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Alert, 
  FormControlLabel, 
  Checkbox,
  Card,
  CardContent,
  Avatar,
  Divider,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Login as LoginIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, adminLogin, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let user;
      if (isAdmin) {
        user = await adminLogin({ email: form.email, password: form.password });
        navigate('/admin/dashboard');
      } else {
        user = await login({ email: form.email, password: form.password });
        // Redirect based on user role
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
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

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            overflow: 'hidden',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)'
            }
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              p: 4,
              textAlign: 'center',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <LoginIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Sign in to your PropFund account
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    color: '#d32f2f'
                  }
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
              />

              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#667eea' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox 
                    checked={isAdmin} 
                    onChange={e => setIsAdmin(e.target.checked)}
                    sx={{
                      color: '#667eea',
                      '&.Mui-checked': {
                        color: '#667eea',
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AdminIcon sx={{ fontSize: 18, color: '#667eea' }} />
                    <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                      Login as Administrator
                    </Typography>
                  </Box>
                }
                sx={{ mt: 2, mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                  },
                  '&:disabled': {
                    background: '#bdc3c7',
                    transform: 'none',
                    boxShadow: 'none'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
                endIcon={loading ? null : <ArrowForwardIcon />}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="textSecondary">
                or
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 2, color: '#2c3e50' }}>
                Forgot your password?{' '}
                <Link 
                  to="/forgot-password"
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Reset here
                </Link>
              </Typography>
              <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                Don't have an account?{' '}
                <Link 
                  to="/register"
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Register now
                </Link>
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                component={Link}
                to="/"
                startIcon={<HomeIcon />}
                sx={{
                  color: '#667eea',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.1)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Back to Home
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login; 