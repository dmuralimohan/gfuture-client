import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  People,
  Store,
  ShoppingCart,
  TrendingUp,
  AttachMoney,
  PendingActions,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import api from '../../utils/api';

const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: <People />, color: '#03288C' },
  { key: 'totalCustomers', label: 'Customers', icon: <People />, color: '#1a56c4' },
  { key: 'totalProviders', label: 'Providers', icon: <Store />, color: '#2d8bc4' },
  { key: 'totalOrders', label: 'Total Orders', icon: <ShoppingCart />, color: '#7c3aed' },
  { key: 'totalServices', label: 'Services', icon: <TrendingUp />, color: '#059669' },
  { key: 'totalRevenue', label: 'Total Revenue', icon: <AttachMoney />, color: '#d97706', prefix: '₹' },
  { key: 'totalPlatformFees', label: 'Platform Fees', icon: <AttachMoney />, color: '#dc2626', prefix: '₹' },
  { key: 'pendingOrders', label: 'Pending', icon: <PendingActions />, color: '#f59e0b' },
  { key: 'completedOrders', label: 'Completed', icon: <CheckCircle />, color: '#10b981' },
  { key: 'cancelledOrders', label: 'Cancelled', icon: <Cancel />, color: '#ef4444' },
];

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  'in-progress': 'primary',
  completed: 'success',
  cancelled: 'error',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/admin/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={800} mb={3}>Dashboard</Typography>
        <Grid container spacing={2}>
          {Array.from({ length: 10 }).map((_, i) => (
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={i}>
              <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} color="#0E0E2E" mb={3}>
        Dashboard
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={2} mb={4}>
        {statCards.map((card) => (
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={card.key}>
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: 'none',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' },
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Avatar sx={{ bgcolor: `${card.color}15`, color: card.color, width: 40, height: 40 }}>
                    {card.icon}
                  </Avatar>
                </Box>
                <Typography variant="h5" fontWeight={800} color="#0E0E2E">
                  {card.prefix || ''}{typeof stats?.[card.key] === 'number' ? stats[card.key].toLocaleString('en-IN') : 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {card.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Orders & Users */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Recent Orders</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats?.recentOrders?.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                            {order.id?.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>{order.customer_name || 'N/A'}</TableCell>
                        <TableCell>₹{order.total?.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            size="small"
                            color={statusColors[order.status] || 'default'}
                            sx={{ fontWeight: 600, fontSize: 11 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">No orders yet</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Recent Users</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {stats?.recentUsers?.map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(0,0,0,0.02)',
                    }}
                  >
                    <Avatar sx={{ bgcolor: '#03288C', width: 36, height: 36, fontSize: 14 }}>
                      {user.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {user.email}
                      </Typography>
                    </Box>
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: 10,
                        bgcolor: user.role === 'provider' ? '#059669' : user.role === 'admin' ? '#7c3aed' : '#03288C',
                        color: '#fff',
                      }}
                    />
                  </Box>
                ))}
                {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                  <Typography color="text.secondary" textAlign="center" py={3}>
                    No users yet
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
