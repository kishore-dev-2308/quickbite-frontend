import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  Skeleton,
  Alert,
  Button,
  Stack,
  IconButton,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { menuApi } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import MenuItemCard from '../components/MenuItemCard';

const CATEGORIES = ['All', 'Pizza', 'Burger', 'Sides', 'Drinks', 'Dessert'];

const MenuPage = () => {
  const { syncWithMenu } = useCart();
  const { isAdmin } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await menuApi.getMenu({
        category: selectedCategory,
        search: searchQuery,
      });
      const data = res.data || [];
      setMenuItems(data);
      if (syncWithMenu) {
        syncWithMenu(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMenu();
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      {/* Hero Banner with Responsive Typography & Search */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #431407 100%)',
          color: '#ffffff',
          py: { xs: 8, md: 12 },
          px: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ maxWidth: 680 }}>
            <Chip
              icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: '#fb923c !important' }} />}
              label="Live Kitchen & Courier Tracking"
              size="small"
              sx={{
                bgcolor: 'rgba(234, 88, 12, 0.2)',
                color: '#fdba74',
                fontWeight: 800,
                fontSize: '0.75rem',
                border: '1px solid rgba(251, 146, 60, 0.3)',
                mb: 2.5,
              }}
            />
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
              }}
            >
              Gourmet Comfort Food,{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #fb923c 0%, #fcd34d 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Tracked Live to Your Door.
              </Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#cbd5e1',
                mt: 2,
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                lineHeight: 1.6,
              }}
            >
              Order artisan pizzas, smash burgers, and decadent desserts. Enjoy live, step-by-step updates from the kitchen right to your doorstep.
            </Typography>

            {/* Quick Search Form */}
            <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                display: 'flex',
                gap: 1.5,
                mt: 4,
                maxWidth: 520,
              }}
            >
              <TextField
                fullWidth
                size="medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pizzas, truffle burgers, sides..."
                sx={{
                  '& .MuiInputBase-input': {
                    color: '#ffffff !important',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#ffffff !important',
                    opacity: '0.85 !important',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#ffffff' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(8px)',
                    color: '#ffffff',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.18)',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused': {
                      bgcolor: 'rgba(255, 255, 255, 0.18)',
                      borderColor: '#ea580c',
                      color: '#ffffff',
                    },
                    '& input': {
                      color: '#ffffff !important',
                    },
                    '& input::placeholder': {
                      color: '#ffffff !important',
                      opacity: '0.85 !important',
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#ea580c',
                  px: 3,
                  fontWeight: 800,
                  borderRadius: 3,
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: '#c2410c' },
                }}
              >
                Search
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Category Pills Bar */}
      <Box
        sx={{
          position: 'sticky',
          top: 74,
          zIndex: 10,
          bgcolor: 'rgba(248, 250, 252, 0.95)',
          backdropFilter: 'blur(8px)',
          py: 2,
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, '::-webkit-scrollbar': { display: 'none' } }}>
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                label={
                  cat === 'All'
                    ? '🔥 All Items'
                    : cat === 'Pizza'
                    ? '🍕 Pizza'
                    : cat === 'Burger'
                    ? '🍔 Burgers'
                    : cat === 'Sides'
                    ? '🍟 Sides'
                    : cat === 'Drinks'
                    ? '🥤 Drinks'
                    : '🍰 Desserts'
                }
                clickable
                onClick={() => setSelectedCategory(cat)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  py: 2,
                  px: 1,
                  borderRadius: 3,
                  bgcolor: selectedCategory === cat ? '#0f172a' : '#ffffff',
                  color: selectedCategory === cat ? '#ffffff' : '#475569',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? '#0f172a' : '#e2e8f0',
                  '&:hover': {
                    bgcolor: selectedCategory === cat ? '#0f172a' : '#f1f5f9',
                  },
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Main Food Items Grid */}
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {isAdmin && (
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              p: 2.5,
              bgcolor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: 28 }}>🧑‍🍳</Typography>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} color="#92400e">
                  Kitchen Staff Mode Active
                </Typography>
                <Typography variant="body2" color="#b45309">
                  You are signed in as Kitchen Staff. Your role is managing incoming orders and meal preparation. Customer ordering is restricted to customer accounts.
                </Typography>
              </Box>
            </Box>
            <Button
              component={Link}
              to="/admin"
              variant="contained"
              sx={{
                bgcolor: '#b45309',
                fontWeight: 800,
                borderRadius: 2,
                whiteSpace: 'nowrap',
                textTransform: 'none',
                '&:hover': { bgcolor: '#92400e' },
              }}
            >
              Open Kitchen Management
            </Button>
          </Paper>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5 }}>
          <Box>
            <Typography variant="h5" fontWeight={900} color="#0f172a">
              {selectedCategory === 'All' ? 'Full Food Menu' : `${selectedCategory} Collection`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Showing {menuItems.length} freshly prepared items
            </Typography>
          </Box>
          <IconButton onClick={fetchMenu} size="small" sx={{ border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <RefreshIcon fontSize="small" sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} alignItems="stretch">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i} sx={{ display: 'flex' }}>
                <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #e2e8f0', width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3, mb: 2 }} />
                  <Skeleton width="60%" height={24} sx={{ mb: 1 }} />
                  <Skeleton width="90%" height={16} sx={{ mb: 0.5 }} />
                  <Skeleton width="75%" height={16} sx={{ mb: 2 }} />
                  <Skeleton width="40%" height={32} sx={{ mt: 'auto' }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Food Cards Grid: 1 col on mobile, 2 on tablet, 3 on laptop, 4 on desktop */}
        {!loading && menuItems.length > 0 && (
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} alignItems="stretch">
            {menuItems.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item._id} sx={{ display: 'flex' }}>
                <MenuItemCard item={item} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Empty Search Result State */}
        {!loading && menuItems.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #e2e8f0', p: 4 }}>
            <Typography variant="h3" sx={{ mb: 1.5 }}>🔍</Typography>
            <Typography variant="h6" fontWeight={800} color="#0f172a">
              No dishes found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto', mt: 0.5, mb: 3 }}>
              We couldn't find items matching "{searchQuery}". Try selecting another category or clear your search query.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              sx={{ borderRadius: 3, fontWeight: 700 }}
            >
              Reset Filters
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default MenuPage;
