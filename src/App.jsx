import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Container, Typography, Chip } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
                {/* Header Navbar */}
                <Navbar />

                {/* Cart Drawer */}
                <CartDrawer />

                {/* Main Views */}
                <Box component="main" sx={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<MenuPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders/:id" element={<OrderTrackingPage />} />
                    <Route path="/orders" element={<OrderHistoryPage />} />
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Box>

                {/* Footer */}
                <Box
                  component="footer"
                  sx={{
                    bgcolor: '#ffffff',
                    borderTop: '1px solid #e2e8f0',
                    py: 5,
                    mt: 'auto',
                  }}
                >
                  <Container maxWidth="lg">
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">🍔</Typography>
                        <Typography variant="body2" fontWeight={800} color="#0f172a">
                          QuickBite
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          — Fresh, hot, and handcrafted comfort food delivered straight to your door.
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label="🌿 Fresh Ingredients" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
                        <Chip label="⚡ Fast Delivery" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
                        <Chip label="⭐ 4.9 Star Rating" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
                      </Box>
                    </Box>
                  </Container>
                </Box>
              </Box>
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
