import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Button,
  Divider,
  Alert,
  Stack,
  Avatar,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, menuApi } from '../api/client';
import AuthModal from '../components/AuthModal';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, tax, totalAmount, clearCart, syncWithMenu } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState(0);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    notes: '',
    paymentMethod: 'Cash on Delivery',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const syncCurrentCart = async () => {
      try {
        const res = await menuApi.getMenu();
        const liveItems = res.data || [];
        if (liveItems.length > 0 && syncWithMenu) {
          syncWithMenu(liveItems);
        }
      } catch (err) {
        // silent
      }
    };
    syncCurrentCart();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        customerPhone: prev.customerPhone || user.phone || '',
        deliveryAddress: prev.deliveryAddress || user.address || '',
      }));
    }
  }, [user]);

  // Block kitchen staff / admin from accessing customer checkout
  if (isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Box sx={{ width: 84, height: 84, borderRadius: '50%', bgcolor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, mx: 'auto', mb: 2 }}>
          🧑‍🍳
        </Box>
        <Typography variant="h4" fontWeight={900} gutterBottom color="#0f172a">
          Kitchen Staff Cannot Place Orders
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
          You are signed in with a Kitchen Staff account. This role is strictly designated for reviewing incoming orders, preparing meals, and managing kitchen dispatch.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            component={Link}
            to="/admin"
            variant="contained"
            sx={{ bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' }, fontWeight: 800, py: 1.2, px: 3 }}
          >
            Go to Kitchen Dashboard
          </Button>
          <Button
            variant="outlined"
            onClick={logout}
            sx={{ borderColor: '#cbd5e1', color: '#334155', fontWeight: 800, py: 1.2, px: 3 }}
          >
            Sign Out to Order
          </Button>
        </Stack>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, mx: 'auto', mb: 2 }}>
          🛒
        </Box>
        <Typography variant="h5" fontWeight={900} gutterBottom>
          Your cart is currently empty
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Please add dishes from our menu before proceeding to checkout.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          startIcon={<ArrowBackIcon />}
          sx={{ bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' } }}
        >
          Return to Food Menu
        </Button>
      </Container>
    );
  }

  const validateForm = () => {
    const errors = {};
    if (!formData.customerName.trim()) {
      errors.customerName = 'Please enter your full recipient name';
    }
    if (!formData.customerPhone.trim()) {
      errors.customerPhone = 'Please provide a valid contact phone number';
    }
    if (!formData.deliveryAddress.trim()) {
      errors.deliveryAddress = 'Please provide your full delivery address';
    } else if (formData.deliveryAddress.trim().length < 5) {
      errors.deliveryAddress = 'Delivery address must be at least 5 characters (e.g. Street, Apt, City)';
    } else if (formData.deliveryAddress.trim().length > 300) {
      errors.deliveryAddress = 'Delivery address cannot exceed 300 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setError('');
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!isAuthenticated) {
      setError('Please sign in or create an account to confirm and place your order.');
      setIsAuthModalOpen(true);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        deliveryAddress: formData.deliveryAddress.trim(),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes.trim(),
        items: items.map((i) => ({
          menuItemId: i._id,
          name: i.name,
          quantity: i.quantity,
        })),
      };

      const response = await orderApi.createOrder(payload);
      const createdOrder = response.data.order;

      // Save order ID into recent orders in local storage (for guest tracking & post-login linking)
      try {
        const existingRecent = JSON.parse(localStorage.getItem('quickbite_recent_orders') || '[]');
        if (!existingRecent.includes(createdOrder._id)) {
          localStorage.setItem('quickbite_recent_orders', JSON.stringify([createdOrder._id, ...existingRecent]));
        }
      } catch {
        // silent
      }

      clearCart();

      navigate(`/orders/${createdOrder._id}`, {
        state: { orderCreated: true },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Top Breadcrumb */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          size="small"
          sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}
        >
          Back to Menu
        </Button>
        <Typography variant="h4" fontWeight={900} color="#0f172a">
          Checkout & Delivery
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter destination details and choose your payment preference
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 4, borderRadius: 3 }}
          action={
            error.toLowerCase().includes('menu item') || error.toLowerCase().includes('cart') ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  clearCart();
                  navigate('/');
                }}
              >
                Clear Cart & Return
              </Button>
            ) : null
          }
        >
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmitOrder}>
        <Grid container spacing={4}>
          {/* Left Form: Delivery & Payment Inputs */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              {/* Account Status Card */}
              {!isAuthenticated ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: '#fff7ed',
                    border: '1.5px solid #fed7aa',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Typography sx={{ fontSize: 26 }}>🔒</Typography>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={900} color="#9a3412">
                        Account Required to Place Order
                      </Typography>
                      <Typography variant="body2" color="#7c2d12">
                        Please sign in or register before completing your order. This securely links your meal and enables live courier tracking.
                      </Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1.5} sx={{ mt: 2 }} flexWrap="wrap" gap={1}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setAuthModalTab(0);
                        setIsAuthModalOpen(true);
                      }}
                      sx={{
                        bgcolor: '#ea580c',
                        color: '#ffffff',
                        fontWeight: 800,
                        borderRadius: 2.5,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#c2410c' },
                      }}
                    >
                      Sign In to Account
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setAuthModalTab(1);
                        setIsAuthModalOpen(true);
                      }}
                      sx={{
                        borderColor: '#ea580c',
                        color: '#ea580c',
                        fontWeight: 800,
                        borderRadius: 2.5,
                        textTransform: 'none',
                        '&:hover': { borderColor: '#c2410c', bgcolor: '#fff7ed' },
                      }}
                    >
                      Create New Account
                    </Button>
                  </Stack>
                </Paper>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontSize: 20 }}>✅</Typography>
                    <Box>
                      <Typography variant="body2" fontWeight={800} color="#065f46">
                        Ordering as {user?.name}
                      </Typography>
                      <Typography variant="caption" color="#047857">
                        {user?.email} • Delivery will be saved to your account
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label="Verified Account" size="small" sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 800 }} />
                </Paper>
              )}

              {/* Delivery Details Paper */}
              <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2.5, mb: 3, borderBottom: '1px solid #f1f5f9' }}>
                  <Avatar sx={{ bgcolor: '#fff7ed', color: '#ea580c', width: 40, height: 40 }}>
                    <LocationOnOutlinedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                      Delivery Destination
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Where should our courier drop off your meal?
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={2.5}>
                  <TextField
                    label="Recipient Full Name *"
                    name="customerName"
                    fullWidth
                    value={formData.customerName}
                    onChange={handleInputChange}
                    error={Boolean(fieldErrors.customerName)}
                    helperText={fieldErrors.customerName}
                  />

                  <TextField
                    label="Contact Phone Number *"
                    name="customerPhone"
                    fullWidth
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    error={Boolean(fieldErrors.customerPhone)}
                    helperText={fieldErrors.customerPhone}
                  />

                  <TextField
                    label="Complete Delivery Address *"
                    name="deliveryAddress"
                    multiline
                    rows={3}
                    fullWidth
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    error={Boolean(fieldErrors.deliveryAddress)}
                    helperText={fieldErrors.deliveryAddress}
                  />

                  <TextField
                    label="Special Delivery Instructions (Optional)"
                    name="notes"
                    fullWidth
                    placeholder="e.g. Gate code #1234, leave by front doorstep"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </Stack>
              </Paper>

              {/* Payment & Simulation Controls */}
              <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2.5, mb: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                  <Avatar sx={{ bgcolor: '#fff7ed', color: '#ea580c', width: 40, height: 40 }}>
                    <PaymentOutlinedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                      Payment Method
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Select your payment option
                    </Typography>
                  </Box>
                </Box>

                <RadioGroup
                  row
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  sx={{ gap: 2 }}
                >
                  <FormControlLabel
                    value="Cash on Delivery"
                    control={<Radio color="primary" />}
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={800}>Cash on Delivery</Typography>
                        <Typography variant="caption" color="text.secondary">Pay upon receiving food</Typography>
                      </Box>
                    }
                    sx={{
                      m: 0,
                      p: 1.5,
                      flex: 1,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: formData.paymentMethod === 'Cash on Delivery' ? '#ea580c' : '#e2e8f0',
                      bgcolor: formData.paymentMethod === 'Cash on Delivery' ? '#fff7ed' : '#ffffff',
                    }}
                  />
                  <FormControlLabel
                    value="Credit/Debit Card"
                    control={<Radio color="primary" />}
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={800}>Card Payment</Typography>
                        <Typography variant="caption" color="text.secondary">Instant contactless card payment</Typography>
                      </Box>
                    }
                    sx={{
                      m: 0,
                      p: 1.5,
                      flex: 1,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: formData.paymentMethod === 'Credit/Debit Card' ? '#ea580c' : '#e2e8f0',
                      bgcolor: formData.paymentMethod === 'Credit/Debit Card' ? '#fff7ed' : '#ffffff',
                    }}
                  />
                </RadioGroup>
              </Paper>
            </Stack>
          </Grid>

          {/* Right Summary Sidebar */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 4 },
                borderRadius: 4,
                border: '1px solid #e2e8f0',
                position: { md: 'sticky' },
                top: { md: 100 },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, mb: 2, borderBottom: '1px solid #f1f5f9' }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingBagOutlinedIcon fontSize="small" sx={{ color: '#ea580c' }} />
                  Order Summary
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ bgcolor: '#f1f5f9', px: 1.5, py: 0.5, borderRadius: 2 }}>
                  {items.length} items
                </Typography>
              </Box>

              {/* Items List */}
              <Stack spacing={1.5} sx={{ maxHeight: 240, overflowY: 'auto', mb: 3, pr: 0.5 }}>
                {items.map((item) => (
                  <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box component="img" src={item.image} alt={item.name} sx={{ width: 40, height: 40, borderRadius: 2, objectFit: 'cover' }} />
                      <Box>
                        <Typography variant="body2" fontWeight={800} noWrap sx={{ maxWidth: 170 }}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">Qty: {item.quantity}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" fontWeight={800}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2" fontWeight={700}>${subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Delivery Fee</Typography>
                  <Typography variant="body2" fontWeight={800} color={deliveryFee === 0 ? 'success.main' : 'text.primary'}>
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Tax (8%)</Typography>
                  <Typography variant="body2" fontWeight={700}>${tax.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={900}>Total Amount</Typography>
                  <Typography variant="h6" fontWeight={900} color="primary.main">
                    ${totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting}
                startIcon={<CheckCircleOutlinedIcon />}
                sx={{
                  py: 1.8,
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  bgcolor: '#ea580c',
                  boxShadow: '0 8px 20px rgba(234, 88, 12, 0.3)',
                  '&:hover': { bgcolor: '#c2410c' },
                }}
              >
                {submitting ? 'Placing Order...' : `Confirm & Place Order ($${totalAmount.toFixed(2)})`}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Auth Modal for Unauthenticated Checkouts */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </Container>
  );
};

export default CheckoutPage;
