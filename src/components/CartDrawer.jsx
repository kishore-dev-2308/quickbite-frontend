import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  LinearProgress,
  Avatar,
  Stack,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    tax,
    totalAmount,
    FREE_DELIVERY_THRESHOLD,
  } = useCart();
  const { isAdmin } = useAuth();

  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 440 },
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#fff7ed', color: '#ea580c', width: 42, height: 42 }}>
            <ShoppingBagOutlinedIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
              Your Order Cart
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {items.length} unique items
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={() => setIsCartOpen(false)} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Free Delivery Bar */}
      {items.length > 0 && (
        <Box sx={{ p: 2, bgcolor: '#fffbeb', borderBottom: '1px solid #fef3c7' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" fontWeight={800} color="#92400e" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AutoAwesomeIcon sx={{ fontSize: 14, color: '#d97706' }} />
              {amountNeededForFreeDelivery === 0
                ? '🎉 Unlocked FREE Delivery!'
                : `Add $${amountNeededForFreeDelivery.toFixed(2)} more for FREE delivery`}
            </Typography>
            <Typography variant="caption" fontWeight={800} color="#92400e">
              {progressPercent.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 7,
              borderRadius: 4,
              bgcolor: '#fef3c7',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#ea580c',
                borderRadius: 4,
              },
            }}
          />
        </Box>
      )}

      {/* Cart Items List */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        {items.length === 0 ? (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 8 }}>
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, mb: 2 }}>
              🍽️
            </Box>
            <Typography variant="h6" fontWeight={800} color="#334155" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 260, mb: 3 }}>
              Explore our chef-crafted menu and add your favorite dishes!
            </Typography>
            <Button
              variant="contained"
              onClick={() => setIsCartOpen(false)}
              sx={{ bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' } }}
            >
              Browse Food Menu
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {items.map((item) => (
              <Box
                key={item._id}
                sx={{
                  display: 'flex',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 3,
                  border: '1px solid #f1f5f9',
                  bgcolor: '#f8fafc',
                }}
              >
                <Box
                  component="img"
                  src={item.image}
                  alt={item.name}
                  sx={{ width: 72, height: 72, borderRadius: 2.5, objectFit: 'cover' }}
                />
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="body2" fontWeight={800} color="#0f172a" sx={{ lineHeight: 1.2 }}>
                      {item.name}
                    </Typography>
                    <IconButton size="small" onClick={() => removeFromCart(item._id)} sx={{ color: '#94a3b8', p: 0.5, '&:hover': { color: '#e11d48' } }}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" fontWeight={800} color="primary.main">
                    ${item.price.toFixed(2)}
                  </Typography>

                  {/* Quantity Stepper */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 2, px: 0.5, py: 0.2 }}>
                      <IconButton size="small" onClick={() => updateQuantity(item._id, item.quantity - 1)} sx={{ p: 0.3 }}>
                        <RemoveIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <Typography variant="caption" fontWeight={800} sx={{ width: 22, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton size="small" onClick={() => updateQuantity(item._id, item.quantity + 1)} sx={{ p: 0.3 }}>
                        <AddIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" fontWeight={800} color="#0f172a">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* Footer Calculation & Checkout CTA */}
      {items.length > 0 && (
        <Box sx={{ p: 2.5, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
          <Stack spacing={1} sx={{ mb: 2 }}>
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
              <Typography variant="body2" color="text.secondary">Estimated Tax (8%)</Typography>
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

          {isAdmin ? (
            <Box>
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontWeight: 600 }}>
                You are signed in as Kitchen Staff. Staff accounts manage meals and cannot place customer orders.
              </Alert>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/admin');
                }}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  bgcolor: '#b45309',
                  boxShadow: '0 8px 20px rgba(180, 83, 9, 0.3)',
                  '&:hover': { bgcolor: '#92400e' },
                }}
              >
                Go to Kitchen Dashboard
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              fullWidth
              onClick={handleCheckout}
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.5,
                fontSize: '0.95rem',
                fontWeight: 800,
                bgcolor: '#ea580c',
                boxShadow: '0 8px 20px rgba(234, 88, 12, 0.3)',
                '&:hover': { bgcolor: '#c2410c' },
              }}
            >
              Proceed to Checkout
            </Button>
          )}
        </Box>
      )}
    </Drawer>
  );
};

export default CartDrawer;
