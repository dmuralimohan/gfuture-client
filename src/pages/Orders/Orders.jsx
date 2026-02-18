import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Button,
  CircularProgress,
} from '@mui/material';
import { ShoppingBag, AccessTime, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const statusColors = {
  pending: { bg: '#fef3c7', text: '#d97706' },
  confirmed: { bg: '#e0f2fe', text: '#0284c7' },
  'in-progress': { bg: '#dbeafe', text: '#2563eb' },
  completed: { bg: '#dcfce7', text: '#16a34a' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
};

const defaultStatusColor = { bg: '#f3f4f6', text: '#6b7280' };

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/orders');
        // Normalize backend orders to display shape
        const normalized = data.orders.map((o) => ({
          id: o.id?.substring(0, 16) || o.id,
          fullId: o.id,
          service: o.items?.map((i) => i.service_name).join(', ') || 'Service',
          provider: 'Assigned Provider',
          status: o.status,
          amount: o.subtotal,
          platformFee: o.platform_fee,
          date: o.scheduled_date || o.created_at?.split('T')[0] || '',
          time: o.scheduled_time || '',
        }));
        setOrders(normalized);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ py: 4, minHeight: '80vh' }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{ mb: 1, fontSize: { xs: '1.8rem', md: '2.4rem' } }}
          >
            My Orders
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Track and manage your service bookings
          </Typography>
        </motion.div>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#1a3af5' }} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Loading orders...
            </Typography>
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <ShoppingBag sx={{ fontSize: 80, color: '#d0d5dd', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              No orders yet
            </Typography>
            <Button variant="contained" onClick={() => navigate('/services')}
              sx={{ bgcolor: '#1a3af5', borderRadius: '30px', mt: 2 }}>
              Browse Services
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '1px solid rgba(26,58,245,0.06)',
                    '&:hover': { boxShadow: '0 6px 24px rgba(26,58,245,0.08)' },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>{order.service}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.id} · Provider: {order.provider}
                        </Typography>
                      </Box>
                      <Chip
                        label={order.status.replace('-', ' ')}
                        size="small"
                        sx={{
                          bgcolor: (statusColors[order.status] || defaultStatusColor).bg,
                          color: (statusColors[order.status] || defaultStatusColor).text,
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 16, color: '#5a6a80' }} />
                        <Typography variant="caption" color="text.secondary">
                          {order.date} at {order.time}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#1a3af5', ml: 'auto' }}>
                        ₹{order.amount} <Typography component="span" variant="caption" color="text.secondary">+ ₹{order.platformFee.toFixed(2)} fee</Typography>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Orders;