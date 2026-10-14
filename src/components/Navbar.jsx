import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
  IconButton,
  Badge,
  Chip,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CloseIcon from '@mui/icons-material/Close';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import AuthModal from './AuthModal';

const Navbar = () => {
  const location = useLocation();
  const { itemCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isConnected } = useSocket();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ height: 74, justifyContent: 'space-between' }}>
            {/* Left: Mobile Hamburger & Brand Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton
                color="inherit"
                aria-label="open mobile drawer"
                edge="start"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ display: { md: 'none' }, mr: 0.5 }}
              >
                <MenuIcon />
              </IconButton>

              <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                    fontSize: 22,
                  }}
                >
                  🍔
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{
                      fontWeight: 900,
                      color: '#0f172a',
                      letterSpacing: '-0.02em',
                      display: 'block',
                      lineHeight: 1.1,
                    }}
                  >
                    Quick<span style={{ color: '#ea580c' }}>Bite</span>
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#94a3b8',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontSize: '0.65rem',
                    }}
                  >
                    Real-time Delivery
                  </Typography>
                </Box>
              </Link>
            </Box>

            {/* Center: Desktop Navigation Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Button
                component={Link}
                to="/"
                sx={{
                  color: location.pathname === '/' ? 'primary.main' : 'text.secondary',
                  fontWeight: location.pathname === '/' ? 800 : 600,
                  backgroundColor: location.pathname === '/' ? '#fff7ed' : 'transparent',
                  '&:hover': { backgroundColor: '#ffedd5' },
                }}
              >
                Menu
              </Button>
              {!isAdmin && (
                <Button
                  component={Link}
                  to="/orders"
                  sx={{
                    color: location.pathname === '/orders' ? 'primary.main' : 'text.secondary',
                    fontWeight: location.pathname === '/orders' ? 800 : 600,
                    backgroundColor: location.pathname === '/orders' ? '#fff7ed' : 'transparent',
                    '&:hover': { backgroundColor: '#ffedd5' },
                  }}
                >
                  {isAuthenticated ? 'My Orders' : 'Track Orders'}
                </Button>
              )}
              {isAdmin && (
                <Button
                  component={Link}
                  to="/admin"
                  startIcon={<AdminPanelSettingsIcon sx={{ color: '#d97706' }} />}
                  sx={{
                    color: '#b45309',
                    backgroundColor: '#fef3c7',
                    fontWeight: 700,
                    border: '1px solid #fde68a',
                    '&:hover': { backgroundColor: '#fde68a' },
                  }}
                >
                  Kitchen Admin
                </Button>
              )}
            </Box>

            {/* Right: WebSocket Sync Status, Cart Badge, Auth */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
              {/* WebSocket Live Badge */}
              <Chip
                icon={
                  <FiberManualRecordIcon
                    sx={{
                      fontSize: '10px !important',
                      color: isConnected ? '#10b981 !important' : '#f43f5e !important',
                      animation: isConnected ? 'pulse 2s infinite' : 'none',
                    }}
                  />
                }
                label={isConnected ? 'Live Updates' : 'Offline'}
                size="small"
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  backgroundColor: isConnected ? '#ecfdf5' : '#fff1f2',
                  color: isConnected ? '#065f46' : '#9f1239',
                  borderColor: isConnected ? '#a7f3d0' : '#fecdd3',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
                variant="outlined"
              />

              {/* Shopping Bag Button (customers & guests only) */}
              {!isAdmin && (
                <IconButton
                  onClick={() => setIsCartOpen(true)}
                  aria-label="open cart"
                  sx={{
                    backgroundColor: '#f1f5f9',
                    color: '#1e293b',
                    borderRadius: 3,
                    p: 1.2,
                    '&:hover': { backgroundColor: '#ffedd5', color: '#ea580c' },
                  }}
                >
                  <Badge badgeContent={itemCount} color="primary" overlap="circular">
                    <ShoppingBagOutlinedIcon fontSize="small" />
                  </Badge>
                </IconButton>
              )}

              {/* User Profile or Sign In */}
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={handleUserMenuOpen}
                    sx={{
                      borderRadius: 3,
                      p: '6px 14px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        backgroundColor: '#ea580c',
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                        display: { xs: 'none', sm: 'inline' },
                        maxWidth: 90,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user.name.split(' ')[0]}
                    </Typography>
                  </Button>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleUserMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      sx: {
                        borderRadius: 3,
                        mt: 1.5,
                        minWidth: 200,
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">Signed in as</Typography>
                      <Typography variant="subtitle2" fontWeight={800} noWrap>{user.email}</Typography>
                      <Chip label={user.role} size="small" sx={{ mt: 0.5, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }} />
                    </Box>
                    <Divider />
                    {!isAdmin && (
                      <MenuItem component={Link} to="/orders" onClick={handleUserMenuClose}>
                        <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>My Orders</ListItemText>
                      </MenuItem>
                    )}
                    {isAdmin && (
                      <MenuItem component={Link} to="/admin" onClick={handleUserMenuClose}>
                        <ListItemIcon><AdminPanelSettingsIcon fontSize="small" sx={{ color: '#d97706' }} /></ListItemIcon>
                        <ListItemText sx={{ color: '#b45309', fontWeight: 700 }}>Kitchen Admin</ListItemText>
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                      <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                      <ListItemText>Sign Out</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setIsAuthModalOpen(true)}
                  startIcon={<PersonOutlinedIcon />}
                  sx={{
                    borderRadius: 3,
                    fontWeight: 700,
                    px: { xs: 1.5, sm: 2.5 },
                    py: 1,
                  }}
                >
                  Sign In
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: { width: 280, p: 2, borderRadius: '0 20px 20px 0' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={900}>QuickBite</Typography>
          <IconButton onClick={() => setMobileDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/"
              onClick={() => setMobileDrawerOpen(false)}
              selected={location.pathname === '/'}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon><RestaurantMenuIcon color={location.pathname === '/' ? 'primary' : 'inherit'} /></ListItemIcon>
              <ListItemText primary="Food Menu" primaryTypographyProps={{ fontWeight: 700 }} />
            </ListItemButton>
          </ListItem>
          {!isAdmin && (
            <ListItem disablePadding sx={{ mt: 1 }}>
              <ListItemButton
                component={Link}
                to="/orders"
                onClick={() => setMobileDrawerOpen(false)}
                selected={location.pathname === '/orders'}
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon><ReceiptLongIcon color={location.pathname === '/orders' ? 'primary' : 'inherit'} /></ListItemIcon>
                <ListItemText primary={isAuthenticated ? "My Past Orders" : "Track Orders"} primaryTypographyProps={{ fontWeight: 700 }} />
              </ListItemButton>
            </ListItem>
          )}
          {isAdmin && (
            <ListItem disablePadding sx={{ mt: 1 }}>
              <ListItemButton
                component={Link}
                to="/admin"
                onClick={() => setMobileDrawerOpen(false)}
                selected={location.pathname === '/admin'}
                sx={{ borderRadius: 2, backgroundColor: '#fef3c7' }}
              >
                <ListItemIcon><AdminPanelSettingsIcon sx={{ color: '#d97706' }} /></ListItemIcon>
                <ListItemText primary="Kitchen Management" primaryTypographyProps={{ fontWeight: 700, color: '#b45309' }} />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Drawer>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;
