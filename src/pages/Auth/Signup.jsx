import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  CheckCircle,
  Sms,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const OTP_LENGTH = 6;

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    role: 'customer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!form.phone || form.phone.replace(/\D/g, '').length < 10) {
      setOtpError('Please enter a valid 10-digit phone number');
      return;
    }
    setOtpSending(true);
    setOtpError('');
    try {
      await api.post('/api/otp/send', { phone: form.phone });
      setOtpSent(true);
      setCountdown(60);
      setOtpSuccess('OTP sent to your phone!');
      setTimeout(() => setOtpSuccess(''), 5000);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const newValues = [...otpValues];
      for (let i = 0; i < digits.length; i++) {
        if (index + i < OTP_LENGTH) {
          newValues[index + i] = digits[i];
        }
      }
      setOtpValues(newValues);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;
    const newValues = [...otpValues];
    newValues[index] = value;
    setOtpValues(newValues);

    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otp = otpValues.join('');
    if (otp.length !== OTP_LENGTH) {
      setOtpError('Please enter the complete 6-digit OTP');
      return;
    }
    setOtpVerifying(true);
    setOtpError('');
    try {
      await api.post('/api/otp/verify', { phone: form.phone, otp });
      setOtpVerified(true);
      setOtpSuccess('Phone number verified!');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.phone) {
      setError('Please fill in all required fields');
      return;
    }
    if (!otpVerified) {
      setError('Please verify your phone number with OTP');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const result = await signup({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: form.role,
      referralCode: form.referralCode.trim() || undefined,
    });
    if (result.success) {
      navigate(result.user.role === 'provider' ? '/provider/dashboard' : '/');
    } else {
      setError(result.message);
    }
  };

  return (
    <Box
      sx={ {
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        py: 6,
        background: 'linear-gradient(135deg, #eaf1fb 0%, #f0f5ff 100%)',
      } }
    >
      <Container maxWidth="sm">
        <motion.div
          initial={ { opacity: 0, y: 40 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.6 } }
        >
          <Card sx={ { borderRadius: 4, boxShadow: '0 8px 40px rgba(15,43,102,0.08)' } }>
            <CardContent sx={ { p: { xs: 3, md: 5 } } }>
              <Box sx={ { textAlign: 'center', mb: 4 } }>
                <Box
                  component="img"
                  src="/logo-header.png"
                  alt="G-Future"
                  sx={ { height: 44, width: 'auto', mx: 'auto', mb: 2, display: 'block' } }
                />
                <Typography variant="h4" fontWeight={ 800 }>
                  Join G-Future
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={ { mt: 1 } }>
                  Create your account and start earning together
                </Typography>
              </Box>

              {/* Role Toggle */ }
              <Box sx={ { display: 'flex', justifyContent: 'center', mb: 3 } }>
                <ToggleButtonGroup
                  value={ form.role }
                  exclusive
                  onChange={ (_, val) => val && setForm({ ...form, role: val }) }
                  sx={ {
                    gap: 1.5,
                    '& .MuiToggleButton-root': {
                      borderRadius: '24px !important',
                      px: 3,
                      py: 1,
                      border: '2px solid rgba(15,43,102,0.2)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      '&.Mui-selected': {
                        bgcolor: '#03288C',
                        color: '#fff',
                        borderColor: '#03288C',
                        '&:hover': { bgcolor: '#021A66' },
                      },
                    },
                  } }
                >
                  <ToggleButton value="customer">I'm a Customer</ToggleButton>
                  <ToggleButton value="provider">I'm a Service Provider</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              { error && (
                <Alert severity="error" sx={ { mb: 3, borderRadius: 2 } }>
                  { error }
                </Alert>
              ) }

              <form onSubmit={ handleSubmit }>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={ form.name }
                  onChange={ handleChange }
                  sx={ { mb: 2 } }
                  InputProps={ {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={ { color: '#5a6a80' } } />
                      </InputAdornment>
                    ),
                  } }
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={ form.email }
                  onChange={ handleChange }
                  sx={ { mb: 2 } }
                  InputProps={ {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={ { color: '#5a6a80' } } />
                      </InputAdornment>
                    ),
                  } }
                />

                {/* Phone + OTP Section */ }
                <Box
                  sx={ {
                    mb: 2,
                    p: 2,
                    borderRadius: 3,
                    border: otpVerified
                      ? '2px solid #22c55e'
                      : otpSent
                        ? '2px solid #03288C'
                        : '1px solid rgba(0,0,0,0.12)',
                    bgcolor: otpVerified ? '#f0fdf4' : otpSent ? '#f0f4ff' : 'transparent',
                    transition: 'all 0.3s ease',
                  } }
                >
                  <Box sx={ { display: 'flex', gap: 1, alignItems: 'flex-start' } }>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={ form.phone }
                      onChange={ (e) => {
                        handleChange(e);
                        if (otpSent) {
                          setOtpSent(false);
                          setOtpVerified(false);
                          setOtpValues(Array(OTP_LENGTH).fill(''));
                        }
                      } }
                      disabled={ otpVerified }
                      placeholder="0123456789"
                      InputProps={ {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={ { color: otpVerified ? '#22c55e' : '#5a6a80' } } />
                          </InputAdornment>
                        ),
                        endAdornment: otpVerified ? (
                          <InputAdornment position="end">
                            <Chip
                              icon={ <CheckCircle sx={ { fontSize: 16 } } /> }
                              label="Verified"
                              size="small"
                              sx={ {
                                bgcolor: '#22c55e',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                              } }
                            />
                          </InputAdornment>
                        ) : null,
                      } }
                    />
                    { !otpSent && !otpVerified && (
                      <Button
                        variant="contained"
                        onClick={ handleSendOtp }
                        disabled={ otpSending || !form.phone }
                        sx={ {
                          mt: 0.5,
                          minWidth: 110,
                          height: 48,
                          bgcolor: '#03288C',
                          color: '#fff',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap',
                          '&:hover': { bgcolor: '#021A66', color: '#fff' },
                          '&.Mui-disabled': { color: '#fff' },
                        } }
                      >
                        { otpSending ? <CircularProgress size={ 20 } color="inherit" /> : 'Send OTP' }
                      </Button>
                    ) }
                  </Box>

                  {/* OTP Input */ }
                  <AnimatePresence>
                    { otpSent && !otpVerified && (
                      <motion.div
                        initial={ { opacity: 0, height: 0 } }
                        animate={ { opacity: 1, height: 'auto' } }
                        exit={ { opacity: 0, height: 0 } }
                        transition={ { duration: 0.3 } }
                      >
                        <Box sx={ { mt: 2 } }>
                          <Typography variant="caption" color="text.secondary" sx={ { mb: 1.5, display: 'block' } }>
                            Enter the 6-digit OTP sent to your phone
                          </Typography>

                          {/* OTP Boxes */ }
                          <Box sx={ { display: 'flex', gap: 1, justifyContent: 'center', mb: 2 } }>
                            { otpValues.map((val, i) => (
                              <TextField
                                key={ i }
                                inputRef={ (el) => { otpRefs.current[i] = el; } }
                                value={ val }
                                onChange={ (e) => handleOtpChange(i, e.target.value) }
                                onKeyDown={ (e) => handleOtpKeyDown(i, e) }
                                inputProps={ {
                                  maxLength: i === 0 ? OTP_LENGTH : 1,
                                  style: {
                                    textAlign: 'center',
                                    fontSize: '1.4rem',
                                    fontWeight: 700,
                                    fontFamily: 'Poppins',
                                    padding: '10px 0',
                                  },
                                } }
                                sx={ {
                                  width: 48,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: '#fff',
                                    '&.Mui-focused': {
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#03288C',
                                        borderWidth: 2,
                                      },
                                    },
                                  },
                                } }
                              />
                            )) }
                          </Box>

                          { otpError && (
                            <Alert severity="error" sx={ { mb: 1.5, borderRadius: 2, py: 0.5 } }>
                              { otpError }
                            </Alert>
                          ) }
                          { otpSuccess && (
                            <Alert severity="success" sx={ { mb: 1.5, borderRadius: 2, py: 0.5 } }>
                              { otpSuccess }
                            </Alert>
                          ) }

                          <Box sx={ { display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' } }>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={ otpVerifying ? <CircularProgress size={ 16 } color="inherit" /> : <CheckCircle /> }
                              onClick={ handleVerifyOtp }
                              disabled={ otpVerifying || otpValues.join('').length !== OTP_LENGTH }
                              sx={ {
                                bgcolor: '#22c55e',
                                color: '#fff',
                                borderRadius: 2,
                                fontWeight: 600,
                                '&:hover': { bgcolor: '#16a34a', color: '#fff' },
                                '&.Mui-disabled': { color: '#fff' },
                              } }
                            >
                              { otpVerifying ? 'Verifying...' : 'Verify OTP' }
                            </Button>
                            <Button
                              size="small"
                              disabled={ countdown > 0 }
                              onClick={ handleSendOtp }
                              sx={ { color: '#5a6a80', fontSize: '0.8rem' } }
                            >
                              { countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP' }
                            </Button>
                          </Box>
                        </Box>
                      </motion.div>
                    ) }
                  </AnimatePresence>
                </Box>

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={ showPassword ? 'text' : 'password' }
                  value={ form.password }
                  onChange={ handleChange }
                  sx={ { mb: 2 } }
                  InputProps={ {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={ { color: '#5a6a80' } } />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={ () => setShowPassword(!showPassword) } edge="end">
                          { showPassword ? <VisibilityOff /> : <Visibility /> }
                        </IconButton>
                      </InputAdornment>
                    ),
                  } }
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={ form.confirmPassword }
                  onChange={ handleChange }
                  sx={ { mb: 3 } }
                  InputProps={ {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={ { color: '#5a6a80' } } />
                      </InputAdornment>
                    ),
                  } }
                />

                <TextField
                  fullWidth
                  label="Referral Code (Optional)"
                  name="referralCode"
                  value={ form.referralCode }
                  onChange={ handleChange }
                  placeholder="Enter referral code"
                  sx={ { mb: 3 } }
                  InputProps={ {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Sms sx={ { color: '#5a6a80' } } />
                      </InputAdornment>
                    ),
                  } }
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={ loading || !otpVerified }
                  sx={ {
                    bgcolor: '#03288C',
                    color: '#fff',
                    borderRadius: '6px',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    width: '85%',
                    mx: 'auto',
                    display: 'block',
                    '&:hover': { bgcolor: '#021A66', color: '#fff' },
                    '&.Mui-disabled': {
                      bgcolor: otpVerified ? undefined : '#ccc',
                      color: '#fff',
                    },
                  } }
                >
                  { loading ? 'Creating Account...' : 'Create Account' }
                </Button>

                { !otpVerified && (
                  <Typography variant="caption" color="text.secondary" sx={ { display: 'block', textAlign: 'center', mt: 1 } }>
                    Verify your phone number to enable signup
                  </Typography>
                ) }
              </form>

              <Divider sx={ { my: 3 } }>
                <Typography variant="caption" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Typography variant="body2" sx={ { textAlign: 'center', color: '#5a6a80' } }>
                Already have an account?{ ' ' }
                <Box
                  component={ Link }
                  to="/login"
                  sx={ { color: '#03288C', fontWeight: 600, textDecoration: 'none' } }
                >
                  Sign in
                </Box>
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Signup;

