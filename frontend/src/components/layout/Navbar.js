import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Menu, MenuItem, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, color: 'white', textDecoration: 'none', fontWeight: 700 }}
        >
          PropFund
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          {isAuthenticated && (
            <>
              <Button color="inherit" component={Link} to="/properties">Properties</Button>
              <Button color="inherit" component={Link} to="/profile">Profile</Button>
            </>
          )}
          {!isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button color="inherit" component={Link} to="/register">Register</Button>
            </>
          ) : (
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          )}
        </Box>
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton color="inherit" onClick={handleMenu}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {isAuthenticated && (
              <>
                <MenuItem component={Link} to="/properties" onClick={handleClose}>Properties</MenuItem>
                <MenuItem component={Link} to="/profile" onClick={handleClose}>Profile</MenuItem>
              </>
            )}
            {!isAuthenticated ? (
              <>
                <MenuItem component={Link} to="/login" onClick={handleClose}>Login</MenuItem>
                <MenuItem component={Link} to="/register" onClick={handleClose}>Register</MenuItem>
              </>
            ) : (
              <MenuItem onClick={() => { handleLogout(); handleClose(); }}>Logout</MenuItem>
            )}
          </Menu>
        </Box>
        {isAuthenticated && user && (
          <Avatar sx={{ ml: 2, bgcolor: 'secondary.main' }}>{user.name?.[0]?.toUpperCase() || 'U'}</Avatar>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 