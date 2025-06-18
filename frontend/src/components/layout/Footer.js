import React from 'react';
import { Box, Typography, Link as MuiLink } from '@mui/material';

const Footer = () => (
  <Box sx={{ py: 3, textAlign: 'center', bgcolor: 'background.paper', borderTop: '1px solid #e0e0e0' }}>
    <Typography variant="body2" color="text.secondary">
      &copy; {new Date().getFullYear()} PropFund. All rights reserved. &nbsp;|
      <MuiLink href="/privacy" color="inherit" underline="hover"> Privacy Policy</MuiLink> &nbsp;|
      <MuiLink href="/terms" color="inherit" underline="hover"> Terms of Service</MuiLink>
    </Typography>
  </Box>
);

export default Footer; 