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
  Button,
  LinearProgress,
  Divider,
  IconButton,
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
  CardMembership,
  LocalOffer,
  ArrowForward,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  'in-progress': 'primary',
  completed: 'success',
  cancelled: 'error',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [planStats, setPlanStats] = useState({ plans: [], totalSubs: 0 });
  const [offerCount, setOfferCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, plansRes, offersRes] = await Promise.allSettled([
          api.get('/api/admin/stats'),
          api.get('/api/admin/plans'),
          api.get('/api/admin/offers'),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (plansRes.status === 'fulfilled') {
          const plans = plansRes.value.data.plans || [];
          const totalSubs = plans.reduce((s, p) => s + (p.subscriber_count || 0), 0);
          setPlanStats({ plans, totalSubs });
        }
        if (offersRes.status === 'fulfilled') setOfferCount(offersRes.value.data.offers?.length || 0);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={ 800 } mb={ 3 }>Dashboard</Typography>
        <Grid container spacing={ 2 }>
          { Array.from({ length: 12 }).map((_, i) => (
            <Grid size={ { xs: 6, sm: 4, md: 3 } } key={ i }>
              <Skeleton variant="rounded" height={ 120 } sx={ { borderRadius: 3 } } />
            </Grid>
          )) }
        </Grid>
      </Box>
    );
  }

  const statCards = [
    { key: 'totalUsers', label: 'Total Users', icon: <People />, color: '#03288C', value: stats?.totalUsers },
    { key: 'totalCustomers', label: 'Customers', icon: <People />, color: '#1a56c4', value: stats?.totalCustomers },
    { key: 'totalProviders', label: 'Providers', icon: <Store />, color: '#2d8bc4', value: stats?.totalProviders },
    { key: 'totalOrders', label: 'Total Orders', icon: <ShoppingCart />, color: '#7c3aed', value: stats?.totalOrders },
    { key: 'totalServices', label: 'Services', icon: <TrendingUp />, color: '#059669', value: stats?.totalServices },
    { key: 'totalRevenue', label: 'Revenue', icon: <AttachMoney />, color: '#d97706', value: stats?.totalRevenue, prefix: '₹' },
    { key: 'totalPlatformFees', label: 'Platform Fees', icon: <AttachMoney />, color: '#dc2626', value: stats?.totalPlatformFees, prefix: '₹' },
    { key: 'pendingOrders', label: 'Pending', icon: <PendingActions />, color: '#f59e0b', value: stats?.pendingOrders },
    { key: 'completedOrders', label: 'Completed', icon: <CheckCircle />, color: '#10b981', value: stats?.completedOrders },
    { key: 'cancelledOrders', label: 'Cancelled', icon: <Cancel />, color: '#ef4444', value: stats?.cancelledOrders },
    { key: 'totalSubs', label: 'Subscribers', icon: <CardMembership />, color: '#8b5cf6', value: planStats.totalSubs },
    { key: 'activeOffers', label: 'Active Offers', icon: <LocalOffer />, color: '#ec4899', value: offerCount },
    { key: 'totalReferralJoins', label: 'Referral Joins', icon: <People />, color: '#0f766e', value: stats?.totalReferralJoins },
    { key: 'totalReferralPayout', label: 'Referral Payout', icon: <AttachMoney />, color: '#16a34a', value: stats?.totalReferralPayout, prefix: '₹' },
  ];

  return (
    <Box>
      {/* Header */ }
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 } }>
        <Box>
          <Typography variant="h5" fontWeight={ 800 } color="#0E0E2E">
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here&apos;s what&apos;s happening with G-Future today.
          </Typography>
        </Box>
      </Box>

      {/* Stat Cards */ }
      <Grid container spacing={ 2 } mb={ 3 }>
        { statCards.map((card) => (
          <Grid size={ { xs: 6, sm: 4, md: 3 } } key={ card.key }>
            <Card
              sx={ {
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: 'none',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' },
              } }
            >
              <CardContent sx={ { p: 2, '&:last-child': { pb: 2 } } }>
                <Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 } }>
                  <Avatar sx={ { bgcolor: `${card.color}15`, color: card.color, width: 40, height: 40 } }>
                    { card.icon }
                  </Avatar>
                </Box>
                <Typography variant="h5" fontWeight={ 800 } color="#0E0E2E">
                  { card.prefix || '' }{ typeof card.value === 'number' ? card.value.toLocaleString('en-IN') : 0 }
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={ 500 }>
                  { card.label }
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )) }
      </Grid>

      {/* Quick Actions */ }
      <Grid container spacing={ 2 } mb={ 3 }>
        { [
          { label: 'Manage Plans', path: '/admin/plans', icon: <CardMembership />, color: '#8b5cf6', desc: `${planStats.plans.length} plans` },
          { label: 'Manage Offers', path: '/admin/offers', icon: <LocalOffer />, color: '#ec4899', desc: `${offerCount} offers` },
          { label: 'View Analytics', path: '/admin/analytics', icon: <TrendingUp />, color: '#059669', desc: 'Charts & trends' },
          { label: 'Manage Services', path: '/admin/services', icon: <Store />, color: '#d97706', desc: `${stats?.totalServices || 0} services` },
        ].map((action) => (
          <Grid size={ { xs: 12, sm: 6, md: 3 } } key={ action.label }>
            <Card
              onClick={ () => navigate(action.path) }
              sx={ {
                borderRadius: 3,
                cursor: 'pointer',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: 'none',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: `0 8px 32px ${action.color}20`,
                  transform: 'translateY(-3px)',
                  borderColor: `${action.color}40`,
                },
              } }
            >
              <CardContent sx={ { p: 2.5, display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 2.5 } } }>
                <Avatar sx={ { bgcolor: `${action.color}15`, color: action.color, width: 48, height: 48 } }>
                  { action.icon }
                </Avatar>
                <Box sx={ { flex: 1 } }>
                  <Typography variant="subtitle2" fontWeight={ 700 }>{ action.label }</Typography>
                  <Typography variant="caption" color="text.secondary">{ action.desc }</Typography>
                </Box>
                <ArrowForward sx={ { color: '#ccc', fontSize: 18 } } />
              </CardContent>
            </Card>
          </Grid>
        )) }
      </Grid>

      {/* Plan Subscriptions Summary */ }
      { planStats.plans.length > 0 && (
        <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none', mb: 3 } }>
          <CardContent>
            <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 } }>
              <Typography variant="h6" fontWeight={ 700 }>Plan Subscriptions</Typography>
              <Button
                size="small"
                endIcon={ <ArrowForward /> }
                onClick={ () => navigate('/admin/plans') }
                sx={ { color: '#03288C', fontWeight: 600, textTransform: 'none' } }
              >
                View All
              </Button>
            </Box>
            <Grid container spacing={ 2 }>
              { planStats.plans.filter((p) => p.active).map((plan) => {
                const percentage = planStats.totalSubs > 0 ? ((plan.subscriber_count || 0) / planStats.totalSubs) * 100 : 0;
                return (
                  <Grid size={ { xs: 12, sm: 6, md: 3 } } key={ plan.id }>
                    <Box sx={ { p: 2, borderRadius: 2, bgcolor: plan.recommended ? 'rgba(3,40,140,0.04)' : 'rgba(0,0,0,0.02)', border: plan.recommended ? '1px solid rgba(3,40,140,0.15)' : '1px solid transparent' } }>
                      <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 1 } }>
                        <Typography variant="subtitle2" fontWeight={ 700 } sx={ { flex: 1 } }>{ plan.name }</Typography>
                        { plan.recommended ? <Star sx={ { fontSize: 16, color: '#ffd700' } } /> : null }
                      </Box>
                      <Typography variant="h6" fontWeight={ 800 } color="#03288C">
                        { plan.subscriber_count || 0 }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">subscribers</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={ percentage }
                        sx={ { mt: 1, borderRadius: 1, height: 4, bgcolor: 'rgba(0,0,0,0.06)', '& .MuiLinearProgress-bar': { bgcolor: '#03288C', borderRadius: 1 } } }
                      />
                    </Box>
                  </Grid>
                );
              }) }
            </Grid>
          </CardContent>
        </Card>
      ) }

      {/* Recent Orders & Users */ }
      <Grid container spacing={ 3 }>
        <Grid size={ { xs: 12, md: 7 } }>
          <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
            <CardContent>
              <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 } }>
                <Typography variant="h6" fontWeight={ 700 }>Recent Orders</Typography>
                <Button
                  size="small"
                  endIcon={ <ArrowForward /> }
                  onClick={ () => navigate('/admin/orders') }
                  sx={ { color: '#03288C', fontWeight: 600, textTransform: 'none' } }
                >
                  View All
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={ { fontWeight: 700 } }>Order ID</TableCell>
                      <TableCell sx={ { fontWeight: 700 } }>Customer</TableCell>
                      <TableCell sx={ { fontWeight: 700 } }>Total</TableCell>
                      <TableCell sx={ { fontWeight: 700 } }>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    { stats?.recentOrders?.map((order) => (
                      <TableRow key={ order.id } hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={ 600 } sx={ { fontFamily: 'monospace' } }>
                            { order.id?.substring(0, 8) }...
                          </Typography>
                        </TableCell>
                        <TableCell>{ order.customer_name || 'N/A' }</TableCell>
                        <TableCell>₹{ order.total?.toLocaleString('en-IN') }</TableCell>
                        <TableCell>
                          <Chip
                            label={ order.status }
                            size="small"
                            color={ statusColors[order.status] || 'default' }
                            sx={ { fontWeight: 600, fontSize: 11 } }
                          />
                        </TableCell>
                      </TableRow>
                    )) }
                    { (!stats?.recentOrders || stats.recentOrders.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={ 4 } align="center" sx={ { py: 3 } }>
                          <Typography color="text.secondary">No orders yet</Typography>
                        </TableCell>
                      </TableRow>
                    ) }
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={ { xs: 12, md: 5 } }>
          <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
            <CardContent>
              <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 } }>
                <Typography variant="h6" fontWeight={ 700 }>Recent Users</Typography>
                <Button
                  size="small"
                  endIcon={ <ArrowForward /> }
                  onClick={ () => navigate('/admin/customers') }
                  sx={ { color: '#03288C', fontWeight: 600, textTransform: 'none' } }
                >
                  View All
                </Button>
              </Box>
              <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
                { stats?.recentUsers?.map((u) => (
                  <Box
                    key={ u.id }
                    sx={ {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(0,0,0,0.02)',
                    } }
                  >
                    <Avatar sx={ { bgcolor: '#03288C', width: 36, height: 36, fontSize: 14 } }>
                      { u.name?.[0]?.toUpperCase() }
                    </Avatar>
                    <Box sx={ { flex: 1, minWidth: 0 } }>
                      <Typography variant="body2" fontWeight={ 600 } noWrap>
                        { u.name }
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        { u.email }
                      </Typography>
                    </Box>
                    <Chip
                      label={ u.role }
                      size="small"
                      sx={ {
                        fontWeight: 600,
                        fontSize: 10,
                        bgcolor: u.role === 'provider' ? '#059669' : u.role === 'admin' ? '#7c3aed' : '#03288C',
                        color: '#fff',
                      } }
                    />
                  </Box>
                )) }
                { (!stats?.recentUsers || stats.recentUsers.length === 0) && (
                  <Typography color="text.secondary" textAlign="center" py={ 3 }>
                    No users yet
                  </Typography>
                ) }
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
