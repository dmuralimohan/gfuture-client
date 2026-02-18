import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Avatar,
  Grid,
  Divider,
  Chip,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import { Edit, Save, ExitToApp, Shield, Star } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSave = async () => {
    const result = await updateProfile(form);
    if (result.success) {
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <Box sx={{ py: 4, minHeight: '80vh' }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 4, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            My Profile
          </Typography>

          {message && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>
          )}

          <Card sx={{ borderRadius: 4, mb: 3, overflow: 'visible' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              {/* Profile Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: '#1a3af5',
                    fontSize: 32,
                    fontWeight: 800,
                  }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={700}>{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                  <Chip
                    label={user?.role?.toUpperCase()}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: user?.role === 'provider' ? '#e8f0fe' : '#f0f4ff',
                      color: '#1a3af5',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
                <Button
                  variant="outlined"
                  startIcon={editing ? <Save /> : <Edit />}
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  disabled={loading}
                  sx={{
                    borderRadius: '30px',
                    borderColor: '#1a3af5',
                    color: '#1a3af5',
                    '&:hover': { bgcolor: 'rgba(26,58,245,0.05)' },
                  }}
                >
                  {editing ? 'Save' : 'Edit'}
                </Button>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label="Personal Info" />
                <Tab label="Security" />
              </Tabs>

              {tab === 0 && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="Full Name" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      disabled={!editing} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="Email" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      disabled={!editing} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="Phone" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      disabled={!editing} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Role" value={user?.role} disabled />
                  </Grid>
                </Grid>
              )}

              {tab === 1 && (
                <Box>
                  <Card sx={{ p: 3, borderRadius: 3, bgcolor: '#f0f4ff', border: '1px solid rgba(26,58,245,0.1)', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Shield sx={{ color: '#1a3af5' }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>Token-Based Authentication</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Your session is secured with JWT tokens that auto-refresh every few minutes
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<ExitToApp />}
                    onClick={() => { logout(); navigate('/'); }}
                    sx={{ borderRadius: '30px' }}
                  >
                    Sign Out
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Profile;
