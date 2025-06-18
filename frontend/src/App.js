import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import { Box, CircularProgress, Typography } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages - Only essential ones
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import PropertyForm from './components/properties/PropertyForm';
import Profile from './pages/Profile';
import AdminProfile from './pages/admin/Profile';
import NotFound from './pages/NotFound';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function AppRoutes() {
  const { user, loading } = useAuth();
  
  const PrivateRoute = ({ children, adminOnly = false }) => {
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
    
    if (!user) {
      return <Navigate to="/login" />;
    }

    if (adminOnly && user.role !== 'admin') {
      return <Navigate to="/" />;
    }

    return children;
  };

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

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="/register" element={<Navigate to="/" />} />
          <Route path="/forgot-password" element={<Navigate to="/" />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />

          {/* Admin Dashboard Route */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute adminOnly>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Properties Route */}
          <Route
            path="/properties"
            element={
              <PrivateRoute>
                <Properties />
              </PrivateRoute>
            }
          />

          {/* Property Detail Route */}
          <Route
            path="/properties/:id"
            element={
              <PrivateRoute>
                <PropertyDetail />
              </PrivateRoute>
            }
          />

          {/* Property Form Route */}
          <Route
            path="/properties/new"
            element={
              <PrivateRoute adminOnly>
                <PropertyForm />
              </PrivateRoute>
            }
          />

          {/* Property Edit Route */}
          <Route
            path="/properties/:id/edit"
            element={
              <PrivateRoute adminOnly>
                <PropertyForm />
              </PrivateRoute>
            }
          />

          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Admin Profile Route */}
          <Route
            path="/admin/profile"
            element={
              <PrivateRoute adminOnly>
                <AdminProfile />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 