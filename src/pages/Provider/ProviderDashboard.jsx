import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Tab,
  Tabs,
  Avatar,
  Button,
  LinearProgress,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  TrendingUp,
  Star,
  CheckCircle,
  Schedule,
  CurrencyRupee,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const mockOrders = [
  { id: 'ORD001', customer: 'Priya S.', service: 'Washing Machine Repair', status: 'pending', amount: 399, date: '2026-02-18' },
  { id: 'ORD002', customer: 'Rahul M.', service: 'AC Service', status: 'completed', amount: 549, date: '2026-02-17' },
  { id: 'ORD003', customer: 'Sneha K.', service: 'Washing Machine Repair', status: 'in-progress', amount: 399, date: '2026-02-16' },
];

const statusColors = {
  pending: '#f59e0b',
  'in-progress': '#3b82f6',
  completed: '#22c55e',
  cancelled: '#ef4444',
};

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider') return;
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/orders');
        const normalized = data.orders.map((o) => ({
          id: o.id?.substring(0, 8),
          fullId: o.id,
          customer: o.customer_id?.substring(0, 8) || 'Customer',
          service: o.items?.map((i) => i.service_name).join(', ') || 'Service',
          status: o.status,
          amount: o.subtotal,
          date: o.scheduled_date || o.created_at?.split('T')[0] || '',
        }));
        setOrders(normalized);
      } catch {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'provider') {
    return null;
  }

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const revenue = orders.filter((o) => o.status === 'completed').reduce((acc, o) => acc + (o.amount || 0), 0);
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const stats = [
    { label: 'Total Orders', value: String(totalOrders), icon: <Assignment />, color: '#03288C' },
    { label: 'Revenue', value: `₹${revenue.toLocaleString()}`, icon: <CurrencyRupee />, color: '#22c55e' },
    { label: 'Rating', value: '4.8', icon: <Star />, color: '#f59e0b' },
    { label: 'Completion', value: `${completionRate}%`, icon: <TrendingUp />, color: '#8b5cf6' },
  ];

  return (
    <Box sx={{ py: 4, minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 1, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            Provider Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Welcome back, {user?.name}! Here's your overview.
          </Typography>
        </motion.div>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card sx={{ borderRadius: 3, border: '1px solid rgba(15,43,102,0.06)' }}>
                  <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: `${stat.color}15`, color: stat.color, mx: 'auto', mb: 1.5 }}>
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h5" fontWeight={800}>{stat.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Card sx={{ borderRadius: 4 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, pt: 1 }}>
            <Tab label="Recent Orders" />
            <Tab label="Service Settings" />
          </Tabs>
          <Divider />
          <CardContent sx={{ p: 3 }}>
            {tab === 0 && (
              <Box>
                {loadingOrders ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={32} sx={{ color: '#03288C' }} />
                  </Box>
                ) : orders.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No orders yet. Once customers book your services, they'll appear here.
                    </Typography>
                  </Box>
                ) : (
                orders.map((order, index) => (
                  <motion.div key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': { bgcolor: '#f8fafc' },
                      }}
                    >
                      <Avatar sx={{ bgcolor: '#eaf1fb', color: '#03288C' }}>
                        {order.customer[0]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>{order.service}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customer} · {order.date}
                        </Typography>
                      </Box>
                      <Chip
                        label={order.status}
                        size="small"
                        sx={{
                          bgcolor: `${statusColors[order.status]}15`,
                          color: statusColors[order.status],
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        ₹{order.amount}
                      </Typography>
                    </Box>
                  </motion.div>
                ))
                )}
              </Box>
            )}

            {tab === 1 && (
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Manage your service categories, pricing, availability,
                  and work areas from here.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ProviderDashboard;
