import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Chip,
  Skeleton,
  Alert,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import SearchIcon from '@mui/icons-material/Search';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DevicesIcon from '@mui/icons-material/Devices';

import { orderApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lookupId, setLookupId] = useState('');
  const [isGuestView, setIsGuestView] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');

        if (isAuthenticated) {
          setIsGuestView(false);
          const res = await orderApi.getUserOrders();
          setOrders(res.data || []);
        } else {
          setIsGuestView(true);
          setOrders([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    const cleanId = lookupId.trim();
    if (cleanId) {
      navigate(`/orders/${cleanId}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Button component={Link} to="/" startIcon={<ArrowBackIcon />} size="small" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}>
          Back to Menu
        </Button>
        <Typography variant="h4" fontWeight={900} color="#0f172a">
          {isGuestView ? 'Track & Past Orders' : 'Your Order History'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isGuestView
            ? 'Track active deliveries or view recent orders placed on this device'
            : 'Review all your current and past meal deliveries'}
        </Typography>
      </Box>

      {/* Quick Lookup Bar */}
      <Paper
        component="form"
        onSubmit={handleLookupSubmit}
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 4,
          borderRadius: 3,
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
            Track by Order ID
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Have an order confirmation ID? Enter it here to check live status directly
          </Typography>
        </Box>
        <TextField
          size="small"
          placeholder="e.g. 64e29..."
          value={lookupId}
          onChange={(e) => setLookupId(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: { sm: 280 },
            bgcolor: '#ffffff',
            '& .MuiOutlinedInput-root': { borderRadius: 2 },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!lookupId.trim()}
          sx={{
            bgcolor: '#0f172a',
            fontWeight: 800,
            borderRadius: 2,
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: '#1e293b' },
          }}
        >
          Track Order
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Guest Warning & Claim Prompt Banner */}
      {isGuestView && orders.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            bgcolor: '#fff7ed',
            border: '1px solid #ffedd5',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <DevicesIcon sx={{ color: '#ea580c', fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="#9a3412">
                Orders Placed on this Device
              </Typography>
              <Typography variant="body2" color="#7c2d12">
                These orders were placed without an account on this browser. Sign in or register to link them permanently.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={() => setIsAuthModalOpen(true)}
            sx={{
              bgcolor: '#ea580c',
              color: '#fff',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2,
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#c2410c' },
            }}
          >
            Sign In / Save Orders
          </Button>
        </Paper>
      )}

      {loading && (
        <Stack spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 4 }} />
          ))}
        </Stack>
      )}

      {!loading && orders.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #e2e8f0', p: 4 }}>
          <Typography variant="h3" sx={{ mb: 1.5 }}>📦</Typography>
          <Typography variant="h6" fontWeight={800} color="#0f172a">
            {isGuestView ? 'Sign in to view your order history' : 'No orders placed yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: 'auto', mt: 0.5, mb: 3 }}>
            {isGuestView
              ? 'Please sign in to access your personal order history. You can also enter an Order ID above to track any delivery directly.'
              : "You haven't ordered yet. Browse our delicious menu to place your first order!"}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" gap={1}>
            {isGuestView && (
              <Button
                variant="outlined"
                onClick={() => setIsAuthModalOpen(true)}
                sx={{ fontWeight: 800, borderRadius: 2 }}
              >
                Sign In to Your Account
              </Button>
            )}
            <Button
              component={Link}
              to="/"
              variant="contained"
              startIcon={<ShoppingBagOutlinedIcon />}
              sx={{ bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' }, fontWeight: 800, borderRadius: 2 }}
            >
              Explore Menu
            </Button>
          </Stack>
        </Box>
      )}

      {!loading && orders.length > 0 && (
        <Stack spacing={2.5}>
          {orders.map((ord) => (
            <Paper
              key={ord._id}
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 4,
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: '#ea580c' },
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                    Order #{ord._id.slice(-6).toUpperCase()}
                  </Typography>
                  <Chip
                    label={ord.status}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      bgcolor: ord.status === 'Delivered' ? '#ecfdf5' : '#fff7ed',
                      color: ord.status === 'Delivered' ? '#065f46' : '#c2410c',
                      border: '1px solid',
                      borderColor: ord.status === 'Delivered' ? '#a7f3d0' : '#ffedd5',
                    }}
                  />
                </Box>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption" fontWeight={600}>
                      {new Date(ord.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </Box>
                  <Typography variant="caption">•</Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {ord.items.length} items
                  </Typography>
                  <Typography variant="caption">•</Typography>
                  <Typography variant="caption" fontWeight={900} color="#0f172a">
                    ${ord.totalAmount.toFixed(2)}
                  </Typography>
                </Stack>
              </Box>

              <Button
                component={Link}
                to={`/orders/${ord._id}`}
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: 3,
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  borderColor: '#0f172a',
                  color: '#0f172a',
                  '&:hover': { bgcolor: '#0f172a', color: '#ffffff' },
                }}
              >
                Track Live
              </Button>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Auth Modal for Guests Linking Orders */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </Container>
  );
};

export default OrderHistoryPage;
