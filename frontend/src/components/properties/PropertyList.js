import React from 'react';
import { 
  Grid, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import PropertyCard from './PropertyCard';

const PropertyList = ({ properties, loading, error, isAdmin }) => {
  const navigate = useNavigate();
  const { request } = useApi();
  const { user } = useAuth();
  const [deleteDialog, setDeleteDialog] = React.useState({
    open: false,
    propertyId: null,
    propertyName: ''
  });
  const [deleting, setDeleting] = React.useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('PropertyList received props:', { properties, loading, error, isAdmin });
  }, [properties, loading, error, isAdmin]);

  const handleDelete = async (propertyId) => {
    setDeleting(true);
    try {
      await request({
        url: `/properties/${propertyId}`,
        method: 'DELETE'
      });
      // Refresh the properties list by reloading the page
      window.location.reload();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, propertyId: null, propertyName: '' });
    }
  };

  const openDeleteDialog = (propertyId, propertyName) => {
    setDeleteDialog({ open: true, propertyId, propertyName });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!properties || properties.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No properties found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Properties array: {JSON.stringify(properties)}
        </Typography>
        {isAdmin && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/properties/new')}
            sx={{ mt: 2 }}
          >
            Create First Property
          </Button>
        )}
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {properties.length} properties
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property._id}>
            <PropertyCard 
              property={property}
              onDelete={openDeleteDialog}
            />
          </Grid>
        ))}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, propertyId: null, propertyName: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>"{deleteDialog.propertyName}"</strong>? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, propertyId: null, propertyName: '' })}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDelete(deleteDialog.propertyId)} 
            color="error"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PropertyList; 