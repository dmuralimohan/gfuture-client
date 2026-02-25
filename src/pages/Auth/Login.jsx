import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate(result.user.role === 'provider' ? '/provider/dashboard' : '/');
    } else {
      setError(result.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        py: 6,
        background: 'linear-gradient(135deg, #eaf1fb 0%, #f0f5ff 100%)',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{ borderRadius: 4, boxShadow: '0 8px 40px rgba(15,43,102,0.08)' }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  component="img"
                  src="/logo-header.png"
                  alt="G-Future"
                  sx={{ height: 44, width: 'auto', mx: 'auto', mb: 2, display: 'block' }}
                />
                <Typography variant="h4" fontWeight={800}>
                  Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Sign in to your G-Future account
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  sx={{ mb: 2.5 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#5a6a80' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#5a6a80' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    bgcolor: '#03288C',
                    borderRadius: '6px',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    width: '85%',
                    mx: 'auto',
                    display: 'block',
                    '&:hover': { bgcolor: '#021A66' },
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <Divider sx={{ my: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Typography variant="body2" sx={{ textAlign: 'center', color: '#5a6a80' }}>
                Don't have an account?{' '}
                <Box
                  component={Link}
                  to="/signup"
                  sx={{ color: '#03288C', fontWeight: 600, textDecoration: 'none' }}
                >
                  Sign up for free
                </Box>
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
