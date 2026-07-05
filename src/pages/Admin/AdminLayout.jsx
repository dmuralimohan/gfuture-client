import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  People,
  Store,
  Category,
  ShoppingCart,
  BarChart,
  Menu as MenuIcon,
  Logout,
  ArrowBack,
  AdminPanelSettings,
  Payment,
  CardMembership,
  LocalOffer,
  TuneRounded,
  ViewCarousel,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

const menuItems = [
  { label: 'Dashboard', path: '/admin', icon: <Dashboard /> },
  { label: 'Customers', path: '/admin/customers', icon: <People /> },
  { label: 'Providers', path: '/admin/providers', icon: <Store /> },
  { label: 'Services', path: '/admin/services', icon: <Category /> },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingCart /> },
  { label: 'Categories', path: '/admin/categories', icon: <Category /> },
  { label: 'Analytics', path: '/admin/analytics', icon: <BarChart /> },
  { label: 'Payments', path: '/admin/payments', icon: <Payment /> },
  { label: 'Plans', path: '/admin/plans', icon: <CardMembership /> },
  { label: 'Offers', path: '/admin/offers', icon: <LocalOffer /> },
  { label: 'Promo Cards', path: '/admin/promo-cards', icon: <ViewCarousel /> },
  { label: 'Settings', path: '/admin/settings', icon: <TuneRounded /> },
];

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const drawerContent = (
    <Box sx={ { height: '100%', display: 'flex', flexDirection: 'column' } }>
      {/* Logo Section */ }
      <Box sx={ { p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 } }>
        <Avatar sx={ { bgcolor: '#03288C', width: 40, height: 40 } }>
          <AdminPanelSettings />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={ 800 } color="#03288C">
            G-Future
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Admin Panel
          </Typography>
        </Box>
      </Box>
      <Divider />

      {/* Navigation */ }
      <List sx={ { flex: 1, px: 1.5, py: 1 } }>
        { menuItems.map((item) => {
          const isActive =
            item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);
          return (
            <ListItem key={ item.path } disablePadding sx={ { mb: 0.5 } }>
              <ListItemButton
                component={ Link }
                to={ item.path }
                onClick={ () => isMobile && setMobileOpen(false) }
                sx={ {
                  borderRadius: 2,
                  py: 1.2,
                  bgcolor: isActive ? 'rgba(3, 40, 140, 0.08)' : 'transparent',
                  color: isActive ? '#03288C' : '#5a6a80',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(3, 40, 140, 0.12)' : 'rgba(0,0,0,0.04)',
                  },
                } }
              >
                <ListItemIcon sx={ { color: 'inherit', minWidth: 40 } }>{ item.icon }</ListItemIcon>
                <ListItemText
                  primary={ item.label }
                  primaryTypographyProps={ { fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' } }
                />
              </ListItemButton>
            </ListItem>
          );
        }) }
      </List>

      <Divider />
      {/* User Info */ }
      <Box sx={ { p: 2 } }>
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 } }>
          <Avatar sx={ { bgcolor: '#03288C', width: 36, height: 36, fontSize: 14 } }>
            { user?.name?.[0]?.toUpperCase() || 'A' }
          </Avatar>
          <Box sx={ { flex: 1, minWidth: 0 } }>
            <Typography variant="body2" fontWeight={ 700 } noWrap>
              { user?.name }
            </Typography>
            <Chip label="Admin" size="small" sx={ { height: 20, fontSize: 10, bgcolor: '#03288C', color: '#fff' } } />
          </Box>
        </Box>
        <ListItemButton
          onClick={ handleLogout }
          sx={ { borderRadius: 2, py: 0.8, color: '#d32f2f', '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' } } }
        >
          <ListItemIcon sx={ { color: 'inherit', minWidth: 36 } }>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={ { fontSize: '0.85rem', fontWeight: 600 } } />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={ { display: 'flex', minHeight: '100vh', bgcolor: '#f0f4ff' } }>
      {/* Sidebar */ }
      { isMobile ? (
        <Drawer
          variant="temporary"
          open={ mobileOpen }
          onClose={ () => setMobileOpen(false) }
          ModalProps={ { keepMounted: true } }
          PaperProps={ { sx: { width: DRAWER_WIDTH, borderRight: '1px solid rgba(0,0,0,0.06)' } } }
        >
          { drawerContent }
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          PaperProps={ {
            sx: {
              width: DRAWER_WIDTH,
              borderRight: '1px solid rgba(0,0,0,0.06)',
              bgcolor: '#ffffff',
            },
          } }
        >
          { drawerContent }
        </Drawer>
      ) }

      {/* Main Content */ }
      <Box sx={ { flex: 1, display: 'flex', flexDirection: 'column', ml: { md: `${DRAWER_WIDTH}px` }, minWidth: 0, overflow: 'hidden' } }>
        <AppBar
          position="sticky"
          elevation={ 0 }
          sx={ {
            bgcolor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          } }
        >
          <Toolbar>
            { isMobile && (
              <IconButton onClick={ () => setMobileOpen(true) } sx={ { mr: 1, color: '#03288C' } }>
                <MenuIcon />
              </IconButton>
            ) }
            <IconButton component={ Link } to="/" sx={ { mr: 1, color: '#5a6a80' } } size="small">
              <ArrowBack fontSize="small" />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              Back to Site
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={ { flex: 1, p: { xs: 2, md: 3 }, maxWidth: 1400, width: '100%', mx: 'auto', minWidth: 0, overflow: 'hidden' } }>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
