import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  Button,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import { orderApi } from '../api/client';
import { useSocket } from '../context/SocketContext';
import OrderTimeline from '../components/OrderTimeline';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const { subscribeToOrder, isConnected } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastNotification, setLastNotification] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await orderApi.getOrder(id);
      setOrder(res.data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Order could not be found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Subscribe to real-time WebSocket updates for this specific order
  useEffect(() => {
    if (!id) return;

    const cleanup = subscribeToOrder(id, (update) => {
      console.log('[WebSocket Live Event]:', update);

      if (update.order) {
        setOrder(update.order);
      } else {
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                status: update.status,
                statusHistory: [
                  ...(prev.statusHistory || []),
                  {
                    status: update.status,
                    timestamp: update.updatedAt || new Date(),
                    note: update.note,
                  },
                ],
              }
            : null
        );
      }

      setLastNotification({
        status: update.status,
        note: update.note,
      });
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [id, subscribeToOrder]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 16, textAlign: 'center' }}>
        <CircularProgress color="primary" size={50} sx={{ mb: 2 }} />
        <Typography variant="h6" fontWeight={800} color="#0f172a">
          Connecting to Live Tracking...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Loading live order and delivery status for Order #{id?.slice(-6).toUpperCase()}
        </Typography>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Box sx={{ width: 70, height: 70, borderRadius: '50%', bgcolor: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, mx: 'auto', mb: 2 }}>
          ⚠️
        </Box>
        <Typography variant="h5" fontWeight={900} gutterBottom>
          Order Not Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {error || 'Unable to locate order.'}
        </Typography>
        <Button component={Link} to="/" variant="contained" startIcon={<ArrowBackIcon />}>
          Return to Food Menu
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Real-Time WebSocket Snackbar Toast */}
      <Snackbar
        open={Boolean(lastNotification)}
        autoHideDuration={6000}
        onClose={() => setLastNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity="info"
          onClose={() => setLastNotification(null)}
          sx={{
            bgcolor: '#0f172a',
            color: '#ffffff',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            borderRadius: 3,
            '& .MuiAlert-icon': { color: '#fb923c' },
          }}
        >
          <Typography variant="caption" fontWeight={800} color="#fb923c" textTransform="uppercase" display="block">
            Real-Time Status Update!
          </Typography>
          <Typography variant="subtitle2" fontWeight={800}>
            {lastNotification?.status}
          </Typography>
          <Typography variant="caption" color="#cbd5e1">
            {lastNotification?.note}
          </Typography>
        </Alert>
      </Snackbar>

      {/* Top Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Button component={Link} to="/" startIcon={<ArrowBackIcon />} size="small" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}>
            Back to Menu
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" fontWeight={900} color="#0f172a">
              Order #{order._id.slice(-6).toUpperCase()}
            </Typography>
            <Chip
              icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: isConnected ? '#10b981 !important' : '#f59e0b !important' }} />}
              label={isConnected ? 'Live Updates Active' : 'Connecting...'}
              size="small"
              sx={{
                bgcolor: isConnected ? '#ecfdf5' : '#fffbeb',
                color: isConnected ? '#065f46' : '#92400e',
                fontWeight: 800,
                fontSize: '0.75rem',
                border: '1px solid',
                borderColor: isConnected ? '#a7f3d0' : '#fde68a',
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Placed on {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          onClick={fetchOrder}
          startIcon={<RefreshIcon />}
          sx={{ borderRadius: 3, borderColor: '#e2e8f0', color: 'text.primary', fontWeight: 700 }}
        >
          Refresh Status
        </Button>
      </Box>

      {/* Main Order Timeline Stepper */}
      <OrderTimeline
        order={order}
      />

      {/* Destination & Receipt Details Grid */}
      <Grid container spacing={4} sx={{ mt: 1 }}>
        {/* Destination Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: '1px solid #e2e8f0', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 2.5, borderBottom: '1px solid #f1f5f9' }}>
              <LocationOnOutlinedIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                Delivery Destination
              </Typography>
            </Box>

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Recipient Name</Typography>
                <Typography variant="body1" fontWeight={800} color="#0f172a">{order.customerName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Contact Phone</Typography>
                <Typography variant="body2" fontWeight={800} color="#0f172a">{order.customerPhone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Delivery Address</Typography>
                <Typography variant="body2" fontWeight={700} color="#334155" sx={{ lineHeight: 1.5 }}>
                  {order.deliveryAddress}
                </Typography>
              </Box>
              {order.notes && (
                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>Special Instructions</Typography>
                  <Typography variant="body2" color="#334155">"{order.notes}"</Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Receipt Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 4, border: '1px solid #e2e8f0', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, mb: 2.5, borderBottom: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingBagOutlinedIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                  Ordered Dishes
                </Typography>
              </Box>
              <Chip label={order.paymentMethod} size="small" sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
            </Box>

            <Stack spacing={1.5} sx={{ maxHeight: 200, overflowY: 'auto', mb: 2.5 }}>
              {order.items.map((it, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {it.image && (
                      <Box component="img" src={it.image} alt={it.name} sx={{ width: 38, height: 38, borderRadius: 2, objectFit: 'cover' }} />
                    )}
                    <Box>
                      <Typography variant="body2" fontWeight={800} noWrap sx={{ maxWidth: 200 }}>{it.name}</Typography>
                      <Typography variant="caption" color="text.secondary">Qty: {it.quantity}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" fontWeight={800}>
                    ${(it.price * it.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2" fontWeight={700}>${order.subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Delivery Fee</Typography>
                <Typography variant="body2" fontWeight={800} color={order.deliveryFee === 0 ? 'success.main' : 'text.primary'}>
                  {order.deliveryFee === 0 ? 'FREE' : `$${order.deliveryFee.toFixed(2)}`}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Tax</Typography>
                <Typography variant="body2" fontWeight={700}>${order.tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={900}>Total Paid</Typography>
                <Typography variant="h6" fontWeight={900} color="primary.main">
                  ${order.totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderTrackingPage;
