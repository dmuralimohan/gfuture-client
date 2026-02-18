import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart,
  Person,
  Home,
  Store,
  Settings,
  Logout,
  Close,
  WorkOutline,
  AttachMoney,
  Info,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const navLinks = [
  { label: 'Home', path: '/', icon: <Home /> },
  { label: 'Marketplace', path: '/services', icon: <Store /> },
  { label: 'How It Works', path: '/how-it-works', icon: <WorkOutline /> },
  { label: 'Pricing', path: '/pricing', icon: <AttachMoney /> },
  { label: 'About Us', path: '/about', icon: <Info /> },
];

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleCloseMenu();
    navigate('/');
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(26,58,245,0.08)',
        }}
      >
        <Toolbar sx={{ maxWidth: 1280, width: '100%', mx: 'auto', px: { xs: 2, md: 3 } }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', mr: 4 }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0a1628, #1a3af5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontFamily: 'Poppins',
                fontSize: 18,
              }}
            >
              G
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Poppins',
                fontWeight: 700,
                color: '#0a1628',
                fontSize: '1.25rem',
              }}
            >
              G-Futurē
            </Typography>
          </Box>

          {/* Desktop Nav */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Button
                    key={link.path}
                    component={Link}
                    to={link.path}
                    sx={{
                      color: isActive ? '#1a3af5' : '#5a6a80',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.8rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      position: 'relative',
                      px: 2,
                      '&::after': isActive
                        ? {
                            content: '""',
                            position: 'absolute',
                            bottom: 6,
                            left: '20%',
                            width: '60%',
                            height: 2,
                            bgcolor: '#1a3af5',
                            borderRadius: 1,
                          }
                        : {},
                      '&:hover': { color: '#1a3af5', background: 'transparent' },
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            {/* Cart */}
            <IconButton onClick={() => navigate('/cart')} sx={{ color: '#0a1628' }}>
              <Badge badgeContent={totalItems} color="primary">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {isAuthenticated ? (
              <>
                <IconButton onClick={handleProfileMenu}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: '#1a3af5',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  PaperProps={{
                    sx: { mt: 1.5, borderRadius: 3, minWidth: 200, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => { handleCloseMenu(); navigate('/profile'); }}>
                    <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                    Profile
                  </MenuItem>
                  {user?.role === 'provider' && (
                    <MenuItem onClick={() => { handleCloseMenu(); navigate('/provider/dashboard'); }}>
                      <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
                      Provider Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => { handleCloseMenu(); navigate('/orders'); }}>
                    <ListItemIcon><Store fontSize="small" /></ListItemIcon>
                    My Orders
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#0a1628',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    '&:hover': { background: 'transparent', color: '#1a3af5' },
                  }}
                >
                  Log in
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/signup')}
                  sx={{
                    bgcolor: '#0a1628',
                    borderRadius: '24px',
                    px: 3,
                    fontSize: '0.85rem',
                    '&:hover': { bgcolor: '#1a3af5' },
                  }}
                >
                  Join Platform
                </Button>
              </Box>
            )}

            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: '#0a1628' }}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280, borderRadius: '16px 0 0 16px' } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Menu</Typography>
          <IconButton onClick={() => setDrawerOpen(false)}><Close /></IconButton>
        </Box>
        <Divider />
        <List>
          {navLinks.map((link) => (
            <ListItem
              key={link.path}
              component={Link}
              to={link.path}
              onClick={() => setDrawerOpen(false)}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                color: location.pathname === link.path ? '#1a3af5' : '#0a1628',
                bgcolor: location.pathname === link.path ? 'rgba(26,58,245,0.06)' : 'transparent',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{link.icon}</ListItemIcon>
              <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Header;
