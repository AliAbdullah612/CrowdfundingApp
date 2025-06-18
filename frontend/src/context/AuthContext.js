import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log('AuthProvider rendering...');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AuthProvider useEffect running...');
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'exists' : 'not found');
    if (token) {
      fetchUserProfile();
    } else {
      console.log('No token found, setting loading to false');
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    console.log('Fetching user profile...');
    try {
      const response = await authAPI.getProfile();
      console.log('User profile response:', response.data);
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.response?.data?.message || 'Error fetching user profile');
      localStorage.removeItem('token');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setError(null);
      toast.success('Login successful');
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      toast.error(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setError(null);
      toast.success('Registration successful');
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const adminLogin = async (credentials) => {
    try {
      const response = await authAPI.adminLogin(credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setError(null);
      toast.success('Admin login successful');
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
      toast.error(err.response?.data?.message || 'Admin login failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      toast.success('Password reset instructions sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending reset instructions');
      toast.error(err.response?.data?.message || 'Error sending reset instructions');
      throw err;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successful');
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
      toast.error(err.response?.data?.message || 'Error resetting password');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    adminLogin,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 