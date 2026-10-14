import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Tabs,
  Tab,
  Stack,
  Paper,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, initialTab = 0 }) => {
  const { login, register } = useAuth();
  const [tabIndex, setTabIndex] = useState(initialTab); // 0 = Sign In, 1 = Register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (isOpen) {
      setTabIndex(initialTab);
      setError('');
      setSuccessMsg('');
      setLoading(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (tabIndex === 1) {
        await register(formData);
        setSuccessMsg('Account created successfully! Welcome to QuickBite.');
      } else {
        await login(formData.email, formData.password);
        setSuccessMsg('Signed in successfully! Welcome back.');
      }
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
        setLoading(false);
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleDemoFill = (email, password) => {
    setTabIndex(0);
    setFormData((prev) => ({
      ...prev,
      email,
      password,
    }));
    setError('');
    setSuccessMsg('Sample credentials loaded! Click "Sign In" below to continue.');
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: { xs: 1, sm: 2 },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              bgcolor: '#fff7ed',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockOutlinedIcon fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight={800}>
            {tabIndex === 0 ? 'Welcome Back' : 'Create Account'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Tabs for switching between Sign In and Sign Up */}
        <Tabs
          value={tabIndex}
          onChange={(e, val) => {
            setTabIndex(val);
            setError('');
            setSuccessMsg('');
          }}
          variant="fullWidth"
          sx={{ mb: 2.5, borderBottom: '1px solid #e2e8f0' }}
        >
          <Tab label="Sign In" sx={{ fontWeight: 700 }} />
          <Tab label="Sign Up" sx={{ fontWeight: 700 }} />
        </Tabs>

        {/* Quick Sign-In */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 2.5,
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
          }}
        >
          <Typography
            variant="caption"
            fontWeight={800}
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, textTransform: 'uppercase' }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 13, color: '#f59e0b' }} />
            Quick Sign-In
          </Typography>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                onClick={() => handleDemoFill('customer@quickbite.com', 'password123')}
                sx={{
                  bgcolor: '#ffffff',
                  borderColor: '#e2e8f0',
                  color: '#1e293b',
                  fontSize: '0.72rem',
                  p: 0.8,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  '&:hover': { borderColor: '#ea580c', bgcolor: '#fff7ed' },
                }}
              >
                <Typography variant="caption" fontWeight={800} color="#0f172a">👤 Customer</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>password123</Typography>
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                onClick={() => handleDemoFill('admin@quickbite.com', 'admin123')}
                sx={{
                  bgcolor: '#ffffff',
                  borderColor: '#e2e8f0',
                  color: '#1e293b',
                  fontSize: '0.72rem',
                  p: 0.8,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  '&:hover': { borderColor: '#d97706', bgcolor: '#fef3c7' },
                }}
              >
                <Typography variant="caption" fontWeight={800} color="#b45309">👨‍🍳 Kitchen Staff</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>admin123</Typography>
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {successMsg}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Input Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {tabIndex === 1 && (
              <TextField
                label="Full Name"
                name="name"
                required
                size="small"
                fullWidth
                value={formData.name}
                onChange={handleChange}
              />
            )}

            <TextField
              label="Email Address"
              name="email"
              type="email"
              required
              size="small"
              fullWidth
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              required
              size="small"
              fullWidth
              value={formData.password}
              onChange={handleChange}
            />

            {tabIndex === 1 && (
              <>
                <TextField
                  label="Phone Number"
                  name="phone"
                  size="small"
                  fullWidth
                  value={formData.phone}
                  onChange={handleChange}
                />
                <TextField
                  label="Delivery Address"
                  name="address"
                  size="small"
                  fullWidth
                  value={formData.address}
                  onChange={handleChange}
                />
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.2,
                mt: 1,
                fontWeight: 800,
                bgcolor: '#ea580c',
                '&:hover': { bgcolor: '#c2410c' },
              }}
            >
              {loading ? 'Processing...' : tabIndex === 0 ? 'Sign In' : 'Create Account'}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
