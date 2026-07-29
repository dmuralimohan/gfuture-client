import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
} from '@mui/material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../utils/api';

const COLORS = ['#03288C', '#1a56c4', '#2d8bc4', '#7c3aed', '#059669', '#d97706', '#dc2626', '#f59e0b'];

const AdminAnalytics = () => {
  const [period, setPeriod] = useState('daily');
  const [dailyData, setDailyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dailyRes, monthlyRes, statsRes] = await Promise.all([
          api.get('/api/admin/analytics/daily', { params: { days: 30 } }),
          api.get('/api/admin/analytics/monthly', { params: { months: 12 } }),
          api.get('/api/admin/stats'),
        ]);
        setDailyData(dailyRes.data);
        setMonthlyData(monthlyRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={ 800 } mb={ 3 }>Analytics</Typography>
        <Grid container spacing={ 3 }>
          { Array.from({ length: 4 }).map((_, i) => (
            <Grid size={ { xs: 12, md: 6 } } key={ i }>
              <Skeleton variant="rounded" height={ 350 } sx={ { borderRadius: 3 } } />
            </Grid>
          )) }
        </Grid>
      </Box>
    );
  }

  const isDaily = period === 'daily';
  const orderData = isDaily ? dailyData?.dailyOrders || [] : monthlyData?.monthlyOrders || [];
  const signupData = isDaily ? dailyData?.dailySignups || [] : monthlyData?.monthlySignups || [];
  const xKey = isDaily ? 'date' : 'month';

  // Format labels
  const formatDate = (val) => {
    if (!val) return '';
    if (isDaily) {
      const d = new Date(val);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }
    const parts = val.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(parts[1], 10) - 1]} ${parts[0]?.slice(2)}`;
  };

  const pieData = [
    { name: 'Customers', value: stats?.totalCustomers || 0 },
    { name: 'Providers', value: stats?.totalProviders || 0 },
  ];

  const orderPieData = [
    { name: 'Pending', value: stats?.pendingOrders || 0 },
    { name: 'Completed', value: stats?.completedOrders || 0 },
    { name: 'Cancelled', value: stats?.cancelledOrders || 0 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={ {
            bgcolor: '#fff',
            p: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.06)',
          } }
        >
          <Typography variant="body2" fontWeight={ 700 } mb={ 0.5 }>
            { isDaily ? label : formatDate(label) }
          </Typography>
          { payload.map((entry, index) => (
            <Typography key={ index } variant="caption" display="block" sx={ { color: entry.color } }>
              { entry.name }: { typeof entry.value === 'number' && entry.name.toLowerCase().includes('revenue')
                ? `₹${entry.value.toLocaleString('en-IN')}`
                : entry.value }
            </Typography>
          )) }
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 } }>
        <Typography variant="h5" fontWeight={ 800 } color="#0E0E2E">
          Analytics
        </Typography>
        <ToggleButtonGroup
          value={ period }
          exclusive
          onChange={ (_, val) => val && setPeriod(val) }
          size="small"
          sx={ { '& .MuiToggleButton-root': { borderRadius: 2, px: 2.5, fontWeight: 600, textTransform: 'none' } } }
        >
          <ToggleButton value="daily">Daily (30d)</ToggleButton>
          <ToggleButton value="monthly">Monthly (12m)</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={ 3 }>
        {/* Revenue Chart */ }
        <Grid size={ { xs: 12, md: 6 } }>
          <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
            <CardContent>
              <Typography variant="h6" fontWeight={ 700 } mb={ 2 }>
                Revenue { isDaily ? '(Daily)' : '(Monthly)' }
              </Typography>
              <ResponsiveContainer width="100%" height={ 300 }>
                <AreaChart data={ orderData }>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#03288C" stopOpacity={ 0.3 } />
                      <stop offset="95%" stopColor="#03288C" stopOpacity={ 0 } />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey={ xKey } tickFormatter={ formatDate } tick={ { fontSize: 11 } } />
                  <YAxis tick={ { fontSize: 11 } } tickFormatter={ (v) => `₹${v}` } />
                  <Tooltip content={ <CustomTooltip /> } />
                  <Area type="monotone" dataKey="revenue" stroke="#03288C" strokeWidth={ 2 } fill="url(#revenueGrad)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Orders Chart */ }
        <Grid size={ { xs: 12, md: 6 } }>
          <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
            <CardContent>
              <Typography variant="h6" fontWeight={ 700 } mb={ 2 }>
                Orders { isDaily ? '(Daily)' : '(Monthly)' }
              </Typography>
              <ResponsiveContainer width="100%" height={ 300 }>
                <BarChart data={ orderData }>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey={ xKey } tickFormatter={ formatDate } tick={ { fontSize: 11 } } />
                  <YAxis tick={ { fontSize: 11 } } />
                  <Tooltip content={ <CustomTooltip /> } />
                  <Bar dataKey="orders" fill="#1a56c4" radius={ [6, 6, 0, 0] } name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* User Signups Chart */ }
        <Grid size={ { xs: 12, md: 6 } }>
          <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
            <CardContent>
              <Typography variant="h6" fontWeight={ 700 } mb={ 2 }>
                User Signups { isDaily ? '(Daily)' : '(Monthly)' }
              </Typography>
              <ResponsiveContainer width="100%" height={ 300 }>
                <LineChart data={ signupData }>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey={ xKey } tickFormatter={ formatDate } tick={ { fontSize: 11 } } />
                  <YAxis tick={ { fontSize: 11 } } />
                  <Tooltip content={ <CustomTooltip /> } />
                  <Legend />
                  <Line type="monotone" dataKey="customers" stroke="#03288C" strokeWidth={ 2 } dot={ { r: 3 } } name="Customers" />
                  <Line type="monotone" dataKey="providers" stroke="#059669" strokeWidth={ 2 } dot={ { r: 3 } } name="Providers" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* GST Charges */ }
        <Grid size={ { xs: 12, md: 6 } }>
          <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
            <CardContent>
              <Typography variant="h6" fontWeight={ 700 } mb={ 2 }>
                GST Charges { isDaily ? '(Daily)' : '(Monthly)' }
              </Typography>
              <ResponsiveContainer width="100%" height={ 300 }>
                <AreaChart data={ orderData }>
                  <defs>
                    <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={ 0.3 } />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={ 0 } />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey={ xKey } tickFormatter={ formatDate } tick={ { fontSize: 11 } } />
                  <YAxis tick={ { fontSize: 11 } } tickFormatter={ (v) => `₹${v}` } />
                  <Tooltip content={ <CustomTooltip /> } />
                  <Area type="monotone" dataKey="platform_fees" stroke="#7c3aed" strokeWidth={ 2 } fill="url(#feeGrad)" name="GST Charges Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* User Distribution Pie */ }
        <Grid size={ { xs: 12, sm: 6, md: 4 } }>
          <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
            <CardContent>
              <Typography variant="h6" fontWeight={ 700 } mb={ 2 }>
                User Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={ 250 }>
                <PieChart>
                  <Pie data={ pieData } cx="50%" cy="50%" innerRadius={ 60 } outerRadius={ 90 } dataKey="value" nameKey="name" label={ ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` }>
                    { pieData.map((_, index) => (
                      <Cell key={ `cell-${index}` } fill={ COLORS[index % COLORS.length] } />
                    )) }
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Status Pie */ }
        <Grid size={ { xs: 12, sm: 6, md: 4 } }>
          <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
            <CardContent>
              <Typography variant="h6" fontWeight={ 700 } mb={ 2 }>
                Order Status
              </Typography>
              <ResponsiveContainer width="100%" height={ 250 }>
                <PieChart>
                  <Pie data={ orderPieData } cx="50%" cy="50%" innerRadius={ 60 } outerRadius={ 90 } dataKey="value" nameKey="name" label={ ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` }>
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Stats Card */ }
        <Grid size={ { xs: 12, sm: 12, md: 4 } }>
          <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none', height: '100%' } }>
            <CardContent>
              <Typography variant="h6" fontWeight={ 700 } mb={ 2 }>
                Quick Summary
              </Typography>
              <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
                { [
                  { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`, color: '#03288C' },
                  { label: 'Platform Earnings', value: `₹${stats?.totalPlatformFees?.toLocaleString('en-IN') || 0}`, color: '#7c3aed' },
                  { label: 'Active Services', value: stats?.totalServices || 0, color: '#059669' },
                  { label: 'Total Users', value: stats?.totalUsers || 0, color: '#1a56c4' },
                  { label: 'Completion Rate', value: stats?.totalOrders > 0 ? `${((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}%` : '0%', color: '#10b981' },
                ].map((item) => (
                  <Box key={ item.label } sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' } }>
                    <Typography variant="body2" color="text.secondary">{ item.label }</Typography>
                    <Typography variant="body1" fontWeight={ 700 } sx={ { color: item.color } }>{ item.value }</Typography>
                  </Box>
                )) }
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAnalytics;
