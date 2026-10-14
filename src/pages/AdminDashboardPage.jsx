import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  Alert,
  Chip,
  Stack,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';

import { orderApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const STATUS_OPTIONS = [
  'Order Received',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const STATUS_CONFIG = {
  'Order Received': {
    bg: '#fef3c7',
    color: '#92400e',
    border: '#fde68a',
    nextStatus: 'Preparing',
    nextLabel: 'Accept & Start Cooking 👨‍🍳',
    nextColor: '#ea580c',
  },
  'Preparing': {
    bg: '#eff6ff',
    color: '#1e40af',
    border: '#bfdbfe',
    nextStatus: 'Out for Delivery',
    nextLabel: 'Hand to Courier 🛵',
    nextColor: '#2563eb',
  },
  'Out for Delivery': {
    bg: '#faf5ff',
    color: '#6b21a8',
    border: '#e9d5ff',
    nextStatus: 'Delivered',
    nextLabel: 'Mark Delivered ✅',
    nextColor: '#16a34a',
  },
  'Delivered': {
    bg: '#ecfdf5',
    color: '#065f46',
    border: '#a7f3d0',
    nextStatus: null,
    nextLabel: null,
    nextColor: null,
  },
  'Cancelled': {
    bg: '#fef2f2',
    color: '#991b1b',
    border: '#fecaca',
    nextStatus: null,
    nextLabel: null,
    nextColor: null,
  },
};

const AdminDashboardPage = () => {
  const { isAdmin, login } = useAuth();
  const { subscribeToKitchenFeed } = useSocket();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await orderApi.getAllOrders();
      setOrders(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllOrders();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  // Subscribe to real-time kitchen order feed
  useEffect(() => {
    if (!isAdmin || !subscribeToKitchenFeed) return;

    const cleanup = subscribeToKitchenFeed(
      (newOrder) => {
        setOrders((prev) => {
          if (prev.some((o) => o._id === newOrder._id)) return prev;
          return [newOrder, ...prev];
        });
        setSuccessMsg(
          `🔔 New Order Received: #${newOrder._id.slice(-6).toUpperCase()} from ${newOrder.customerName}!`
        );
        setTimeout(() => setSuccessMsg(''), 5000);
      },
      (updatedOrder) => {
        setOrders((prev) =>
          prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
      }
    );

    return () => {
      if (cleanup) cleanup();
    };
  }, [isAdmin, subscribeToKitchenFeed]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setError('');
    setSuccessMsg('');

    try {
      const res = await orderApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data.order : o))
      );
      setSuccessMsg(
        `Order #${orderId.slice(-6).toUpperCase()} transitioned to "${newStatus}"! Customer delivery screen updated live.`
      );
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ py: 14, textAlign: 'center' }}>
        <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            bgcolor: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            mx: 'auto',
            mb: 2,
          }}
        >
          <AdminPanelSettingsIcon fontSize="large" />
        </Box>
        <Typography variant="h5" fontWeight={900} gutterBottom>
          Kitchen Admin Access Required
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          This operations dashboard is restricted to kitchen staff to manage and advance live orders.
        </Typography>
        <Button
          variant="contained"
          onClick={() => login('admin@quickbite.com', 'admin123')}
          sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' } }}
        >
          Sign In as Kitchen Staff (admin@quickbite.com)
        </Button>
      </Container>
    );
  }

  // Filter orders by active tab
  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true;
    return o.status === activeTab;
  });

  // Calculate metrics
  const receivedCount = orders.filter((o) => o.status === 'Order Received').length;
  const preparingCount = orders.filter((o) => o.status === 'Preparing').length;
  const deliveryCount = orders.filter((o) => o.status === 'Out for Delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Chip
            icon={<OutdoorGrillIcon sx={{ fontSize: '14px !important', color: '#d97706 !important' }} />}
            label="Kitchen Operations Desk"
            size="small"
            sx={{
              bgcolor: '#fef3c7',
              color: '#92400e',
              fontWeight: 800,
              fontSize: '0.72rem',
              border: '1px solid #fde68a',
              mb: 1,
            }}
          />
          <Typography variant="h4" fontWeight={900} color="#0f172a">
            Kitchen Live Order Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Kitchen staff controls each order stage manually. Updating status here instantly syncs the customer's delivery tracking in real-time.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          onClick={fetchAllOrders}
          startIcon={<RefreshIcon />}
          sx={{ borderRadius: 3, borderColor: '#e2e8f0', color: 'text.primary', fontWeight: 700 }}
        >
          Refresh All
        </Button>
      </Box>

      {/* Metrics Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        <Paper
          elevation={0}
          onClick={() => setActiveTab('Order Received')}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: activeTab === 'Order Received' ? '#ea580c' : '#e2e8f0',
            bgcolor: activeTab === 'Order Received' ? '#fff7ed' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PendingActionsOutlinedIcon sx={{ color: '#d97706', fontSize: 20 }} />
            <Typography variant="caption" fontWeight={800} color="text.secondary">
              PENDING ACCEPTANCE
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={900} color="#0f172a">
            {receivedCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Awaiting kitchen confirmation
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          onClick={() => setActiveTab('Preparing')}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: activeTab === 'Preparing' ? '#2563eb' : '#e2e8f0',
            bgcolor: activeTab === 'Preparing' ? '#eff6ff' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <RestaurantMenuOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
            <Typography variant="caption" fontWeight={800} color="text.secondary">
              COOKING NOW
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={900} color="#0f172a">
            {preparingCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Currently on the stove/grill
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          onClick={() => setActiveTab('Out for Delivery')}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: activeTab === 'Out for Delivery' ? '#9333ea' : '#e2e8f0',
            bgcolor: activeTab === 'Out for Delivery' ? '#faf5ff' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocalShippingOutlinedIcon sx={{ color: '#9333ea', fontSize: 20 }} />
            <Typography variant="caption" fontWeight={800} color="text.secondary">
              EN ROUTE
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={900} color="#0f172a">
            {deliveryCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            With courier for delivery
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          onClick={() => setActiveTab('Delivered')}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: activeTab === 'Delivered' ? '#16a34a' : '#e2e8f0',
            bgcolor: activeTab === 'Delivered' ? '#f0fdf4' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 20 }} />
            <Typography variant="caption" fontWeight={800} color="text.secondary">
              COMPLETED
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={900} color="#0f172a">
            {deliveredCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Delivered to customers
          </Typography>
        </Paper>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: '#e2e8f0', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 800,
              fontSize: '0.85rem',
              textTransform: 'none',
              minHeight: 48,
            },
          }}
        >
          <Tab label={`All Orders (${orders.length})`} value="ALL" />
          <Tab label={`Pending Acceptance (${receivedCount})`} value="Order Received" />
          <Tab label={`Cooking (${preparingCount})`} value="Preparing" />
          <Tab label={`Out for Delivery (${deliveryCount})`} value="Out for Delivery" />
          <Tab label={`Delivered (${deliveredCount})`} value="Delivered" />
          <Tab label="Cancelled" value="Cancelled" />
        </Tabs>
      </Box>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 3, fontWeight: 700 }}>
          {successMsg}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontWeight: 700 }}>
          {error}
        </Alert>
      )}

      {/* Orders List */}
      {loading ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={40} color="primary" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading kitchen orders...
          </Typography>
        </Box>
      ) : filteredOrders.length === 0 ? (
        <Paper elevation={0} sx={{ py: 8, textAlign: 'center', borderRadius: 4, border: '1px solid #e2e8f0' }}>
          <Box sx={{ fontSize: 40, mb: 1 }}>🧑‍🍳</Box>
          <Typography variant="h6" fontWeight={800} color="#0f172a">
            No Orders in this Category
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeTab === 'ALL'
              ? 'No customer orders have been placed yet.'
              : `There are currently no orders in "${activeTab}" state.`}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2.5}>
          {filteredOrders.map((ord) => {
            const config = STATUS_CONFIG[ord.status] || STATUS_CONFIG['Order Received'];
            const hasNextAction = Boolean(config.nextStatus);

            return (
              <Paper
                key={ord._id}
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: { xs: 'column', lg: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', lg: 'center' },
                  gap: 3,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  },
                }}
              >
                {/* Left: Info */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                      Order #{ord._id.slice(-6).toUpperCase()}
                    </Typography>
                    <Chip
                      label={ord.status}
                      size="small"
                      sx={{
                        bgcolor: config.bg,
                        color: config.color,
                        border: `1px solid ${config.border}`,
                        fontWeight: 800,
                        fontSize: '0.72rem',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    <Box component="span" fontWeight={800} color="#0f172a">
                      {ord.customerName}
                    </Box>{' '}
                    ({ord.customerPhone}) — {ord.deliveryAddress}
                  </Typography>

                  {ord.notes && (
                    <Box sx={{ mb: 1.5, p: 1, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9', display: 'inline-block' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Chef Note: "{ord.notes}"
                      </Typography>
                    </Box>
                  )}

                  {/* Items chips */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    {ord.items.map((it, idx) => (
                      <Chip
                        key={idx}
                        label={`${it.quantity}x ${it.name}`}
                        size="small"
                        sx={{ bgcolor: '#f1f5f9', fontWeight: 700, fontSize: '0.75rem' }}
                      />
                    ))}
                    <Chip
                      label={`Total: $${ord.totalAmount.toFixed(2)}`}
                      size="small"
                      sx={{ bgcolor: '#fff7ed', color: '#c2410c', fontWeight: 800, fontSize: '0.75rem' }}
                    />
                  </Box>
                </Box>

                {/* Right: Kitchen Control Actions */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 1.5,
                    width: { xs: '100%', lg: 'auto' },
                  }}
                >
                  {/* One-Click Quick Advance Action Button */}
                  {hasNextAction && (
                    <Button
                      variant="contained"
                      size="medium"
                      disabled={updatingId === ord._id}
                      onClick={() => handleStatusChange(ord._id, config.nextStatus)}
                      sx={{
                        bgcolor: config.nextColor,
                        '&:hover': { bgcolor: config.nextColor, filter: 'brightness(0.9)' },
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        borderRadius: 3,
                        px: 2.5,
                        py: 1,
                        boxShadow: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {updatingId === ord._id ? 'Updating...' : config.nextLabel}
                    </Button>
                  )}

                  {/* Dropdown for specific/manual status changes */}
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select
                      value={ord.status}
                      disabled={updatingId === ord._id}
                      onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                      sx={{ borderRadius: 3, fontWeight: 700, fontSize: '0.82rem' }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Container>
  );
};

export default AdminDashboardPage;
