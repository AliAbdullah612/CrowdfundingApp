import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Typography,
  Button,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const PropertyFilter = ({ properties = [], onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    minPrice: '',
    maxPrice: '',
    location: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    applyFilters();
  }, [filters, properties]);

  const applyFilters = () => {
    if (!Array.isArray(properties)) {
      onFilterChange([]);
      return;
    }

    let filtered = [...properties];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(property =>
        property.name?.toLowerCase().includes(searchTerm) ||
        property.description?.toLowerCase().includes(searchTerm) ||
        property.location?.address?.toLowerCase().includes(searchTerm) ||
        property.location?.city?.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(property => property.status === filters.status);
    }

    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.totalValue >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.totalValue <= Number(filters.maxPrice));
    }

    // Location filter
    if (filters.location) {
      const locationTerm = filters.location.toLowerCase();
      filtered = filtered.filter(property =>
        property.location?.city?.toLowerCase().includes(locationTerm) ||
        property.location?.state?.toLowerCase().includes(locationTerm)
      );
    }

    onFilterChange(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      minPrice: '',
      maxPrice: '',
      location: ''
    });
  };

  const getStatusCounts = () => {
    const counts = {};
    if (Array.isArray(properties)) {
      properties.forEach(property => {
        if (property.status) {
          counts[property.status] = (counts[property.status] || 0) + 1;
        }
      });
    }
    return counts;
  };

  const statusCounts = getStatusCounts();
  const propertiesLength = Array.isArray(properties) ? properties.length : 0;

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon />
          Filters
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search properties by name, description, or location..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      {/* Status Chips */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <Chip
              key={status}
              label={`${status} (${count})`}
              color={filters.status === status ? 'primary' : 'default'}
              variant={filters.status === status ? 'filled' : 'outlined'}
              onClick={() => handleFilterChange('status', status)}
              size="small"
            />
          ))}
          <Chip
            label={`All (${propertiesLength})`}
            color={filters.status === 'all' ? 'primary' : 'default'}
            variant={filters.status === 'all' ? 'filled' : 'outlined'}
            onClick={() => handleFilterChange('status', 'all')}
            size="small"
          />
        </Box>
      </Box>

      {/* Advanced Filters */}
      {showFilters && (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="listed">Listed</MenuItem>
                  <MenuItem value="crowdfunding">Crowdfunding</MenuItem>
                  <MenuItem value="funded">Funded</MenuItem>
                  <MenuItem value="sold">Sold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Min Price"
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Max Price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Location"
                placeholder="City or State"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default PropertyFilter; 