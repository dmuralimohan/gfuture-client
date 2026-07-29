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
  CircularProgress,
  IconButton,
  Badge,
  Snackbar,
  Stack,
} from '@mui/material';
import {
  Edit,
  Save,
  ExitToApp,
  Shield,
  Star,
  CardMembership,
  SwapHoriz,
  CheckCircle,
  Cancel,
  CameraAlt,
  LocalOffer,
  ContentCopy,
  Lock,
  AccountBalanceWallet,
  AddCircle,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address_street: user?.address_street || '',
    address_landmark: user?.address_landmark || '',
    address_state: user?.address_state || '',
    address_pincode: user?.address_pincode || '',
    profile_picture: user?.profile_picture || '',
  });

  // Sync form with user data when it loads or changes
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        address_street: user.address_street || '',
        address_landmark: user.address_landmark || '',
        address_state: user.address_state || '',
        address_pincode: user.address_pincode || '',
        profile_picture: user.profile_picture || '',
      });
    }
  }, [user]);

  const [message, setMessage] = useState({ text: '', severity: 'success' });
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [wallet, setWallet] = useState(null);
  const [walletTxns, setWalletTxns] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupProcessing, setTopupProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPlanAndOffers = async () => {
      setPlanLoading(true);
      setOffersLoading(true);
      setWalletLoading(true);
      try {
        const [planRes, offersRes, walletRes, walletTxnRes] = await Promise.allSettled([
          api.get('/api/plans/my'),
          api.get('/api/offers', { params: { target: user?.role } }),
          api.get('/api/wallet'),
          api.get('/api/wallet/transactions', { params: { limit: 10 } }),
        ]);
        if (planRes.status === 'fulfilled') setCurrentPlan(planRes.value.data.plan);
        if (offersRes.status === 'fulfilled') setOffers(offersRes.value.data.offers || []);
        if (walletRes.status === 'fulfilled') setWallet(walletRes.value.data.wallet || null);
        if (walletTxnRes.status === 'fulfilled') setWalletTxns(walletTxnRes.value.data.transactions || []);
      } catch {
        /* ignore */
      } finally {
        setPlanLoading(false);
        setOffersLoading(false);
        setWalletLoading(false);
      }
    };
    fetchPlanAndOffers();
  }, [isAuthenticated, user?.role]);

  const refreshWalletData = async () => {
    try {
      const [walletRes, walletTxnRes] = await Promise.all([
        api.get('/api/wallet'),
        api.get('/api/wallet/transactions', { params: { limit: 10 } }),
      ]);
      setWallet(walletRes.data.wallet || null);
      setWalletTxns(walletTxnRes.data.transactions || []);
    } catch {
      /* ignore */
    }
  };

  const openWalletTopupCheckout = (topup) => {
    if (!window.Razorpay) {
      setMessage({ text: 'Payment gateway is loading. Please try again.', severity: 'error' });
      return;
    }

    const razorpayPublicKey = import.meta.env.VITE_RAZORPAY_KEY_ID || topup?.razorpayKeyId || '';
    if (!razorpayPublicKey) {
      setMessage({ text: 'Razorpay key is not configured.', severity: 'error' });
      return;
    }

    const options = {
      key: razorpayPublicKey,
      amount: Math.round(Number(topup.amount || 0) * 100),
      currency: 'INR',
      name: 'GFuture',
      description: 'Wallet Top-up',
      order_id: topup.razorpayOrderId,
      prefill: {
        name: topup.customerName || user?.name || '',
        email: topup.customerEmail || user?.email || '',
        contact: topup.customerPhone || user?.phone || '',
      },
      notes: {
        walletTopupId: topup.id,
      },
      theme: {
        color: '#03288C',
      },
      modal: {
        ondismiss: () => {
          setTopupProcessing(false);
          setMessage({ text: 'Wallet top-up cancelled.', severity: 'info' });
        },
      },
      handler: async (response) => {
        try {
          await api.post('/api/wallet/topup/verify', {
            topupId: topup.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          await refreshWalletData();
          setTopupAmount('');
          setMessage({ text: `₹${Number(topup.amount).toFixed(2)} added to wallet`, severity: 'success' });
        } catch (err) {
          setMessage({ text: err.response?.data?.message || 'Top-up verification failed', severity: 'error' });
        } finally {
          setTopupProcessing(false);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      setTopupProcessing(false);
      setMessage({ text: `Payment failed: ${response?.error?.description || 'Please try again.'}`, severity: 'error' });
    });
    rzp.open();
  };

  const handleWalletTopup = async () => {
    const amount = Number(topupAmount);
    if (!Number.isFinite(amount) || amount < 1) {
      setMessage({ text: 'Minimum top-up amount is ₹1', severity: 'error' });
      return;
    }

    setTopupProcessing(true);
    try {
      const { data } = await api.post('/api/wallet/topup/initiate', { amount });
      if (!data?.topup?.razorpayOrderId) {
        throw new Error('Top-up initiation failed');
      }
      openWalletTopupCheckout(data.topup);
    } catch (err) {
      setTopupProcessing(false);
      setMessage({ text: err.response?.data?.message || 'Failed to initiate wallet top-up', severity: 'error' });
    }
  };

  const handleCancelPlan = async () => {
    try {
      await api.post('/api/plans/cancel');
      setCurrentPlan(null);
      setMessage({ text: 'Plan cancelled successfully', severity: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to cancel plan', severity: 'error' });
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  if (!isAuthenticated) return null;

  const handleSave = async () => {
    const result = await updateProfile(form);
    if (result.success) {
      setEditing(false);
      setMessage({ text: 'Profile updated successfully!', severity: 'success' });
    } else {
      setMessage({ text: result.message || 'Update failed', severity: 'error' });
    }
  };

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, profile_picture: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const avatarSrc = form.profile_picture || user?.profile_picture || '';

  return (
    <Box sx={ { py: 4, minHeight: '80vh', bgcolor: '#f0f4ff' } }>
      <Container maxWidth="md">
        <motion.div initial={ { opacity: 0, y: 20 } } animate={ { opacity: 1, y: 0 } }>
          <Typography variant="h3" fontWeight={ 800 } sx={ { mb: 4, fontSize: { xs: '1.8rem', md: '2.4rem' }, color: '#0E0E2E' } }>
            My Profile
          </Typography>

          {/* Profile Hero Card */ }
          <Card
            sx={ {
              borderRadius: 4,
              mb: 3,
              overflow: 'visible',
              background: 'linear-gradient(135deg, #03288C 0%, #1a56c4 50%, #2d8bc4 100%)',
              color: '#fff',
              position: 'relative',
            } }
          >
            <CardContent sx={ { p: { xs: 3, md: 4 } } }>
              <Box sx={ { display: 'flex', alignItems: 'center', gap: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' } } }>
                {/* Profile Picture with upload */ }
                <Badge
                  overlap="circular"
                  anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
                  badgeContent={
                    editing ? (
                      <IconButton
                        component="label"
                        sx={ {
                          bgcolor: '#fff',
                          width: 32,
                          height: 32,
                          boxShadow: 2,
                          '&:hover': { bgcolor: '#f0f0f0' },
                        } }
                      >
                        <CameraAlt sx={ { fontSize: 16, color: '#03288C' } } />
                        <input type="file" hidden accept="image/*" onChange={ handlePictureChange } />
                      </IconButton>
                    ) : null
                  }
                >
                  <Avatar
                    src={ avatarSrc }
                    sx={ {
                      width: 90,
                      height: 90,
                      fontSize: 36,
                      fontWeight: 800,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      border: '3px solid rgba(255,255,255,0.5)',
                    } }
                  >
                    { !avatarSrc && user?.name?.[0]?.toUpperCase() }
                  </Avatar>
                </Badge>

                <Box sx={ { flex: 1 } }>
                  <Typography variant="h5" fontWeight={ 700 }>{ user?.name }</Typography>
                  <Typography variant="body2" sx={ { opacity: 0.85 } }>{ user?.email }</Typography>
                  <Box sx={ { display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' } }>
                    <Chip
                      label={ user?.role?.toUpperCase() }
                      size="small"
                      sx={ {
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        backdropFilter: 'blur(10px)',
                      } }
                    />
                    { currentPlan && (
                      <Chip
                        icon={ <Star sx={ { color: '#ffd700 !important', fontSize: 16 } } /> }
                        label={ currentPlan.name }
                        size="small"
                        sx={ {
                          bgcolor: 'rgba(255,215,0,0.2)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        } }
                      />
                    ) }
                    <Chip
                      icon={ <CheckCircle sx={ { color: '#22c55e !important', fontSize: 16 } } /> }
                      label={ user?.is_email_verified ? 'Email Verified' : 'Email Not Verified' }
                      size="small"
                      sx={ {
                        bgcolor: user?.is_email_verified ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      } }
                    />
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  startIcon={ editing ? <Save /> : <Edit /> }
                  onClick={ () => (editing ? handleSave() : setEditing(true)) }
                  disabled={ loading }
                  sx={ {
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
                    fontWeight: 700,
                  } }
                >
                  { editing ? 'Save' : 'Edit Profile' }
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Tabs Card */ }
          <Card sx={ { borderRadius: 4, overflow: 'visible', boxShadow: '0 4px 32px rgba(15,43,102,0.08)' } }>
            <CardContent sx={ { p: { xs: 2, md: 4 } } }>
              <Tabs
                value={ tab }
                onChange={ (_, v) => setTab(v) }
                sx={ {
                  mb: 3,
                  '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '0.9rem' },
                  '& .Mui-selected': { color: '#03288C' },
                  '& .MuiTabs-indicator': { bgcolor: '#03288C' },
                } }
              >
                <Tab label="Personal Info" />
                <Tab label="My Plan" icon={ <CardMembership sx={ { fontSize: 18 } } /> } iconPosition="start" />
                <Tab label="Offers" icon={ <LocalOffer sx={ { fontSize: 18 } } /> } iconPosition="start" />
                <Tab label="Wallet" icon={ <AccountBalanceWallet sx={ { fontSize: 18 } } /> } iconPosition="start" />
                <Tab label="Security" icon={ <Shield sx={ { fontSize: 18 } } /> } iconPosition="start" />
              </Tabs>

              {/* ─── Personal Info Tab ─── */ }
              { tab === 0 && (
                <Grid container spacing={ 2.5 }>
                  <Grid size={ { xs: 12, sm: 6 } }>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={ form.name }
                      onChange={ (e) => setForm({ ...form, name: e.target.value }) }
                      disabled={ !editing }
                      sx={ { '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                    />
                  </Grid>
                  <Grid size={ { xs: 12, sm: 6 } }>
                    <TextField
                      fullWidth
                      label="Email"
                      value={ user?.email || '' }
                      disabled
                      InputProps={ {
                        endAdornment: <Lock sx={ { fontSize: 18, color: '#999' } } />,
                      } }
                      helperText="Email cannot be changed"
                      sx={ { '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                    />
                  </Grid>
                  <Grid size={ { xs: 12, sm: 6 } }>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={ form.phone }
                      onChange={ (e) => setForm({ ...form, phone: e.target.value }) }
                      disabled={ !editing }
                      placeholder="+91 0123456789"
                      sx={ { '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                    />
                  </Grid>
                  <Grid size={ { xs: 12, sm: 6 } }>
                    <TextField
                      fullWidth
                      label="Role"
                      value={ user?.role }
                      disabled
                      sx={ { '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                    />
                  </Grid>
                  <Grid size={ { xs: 12 } }>
                    <Typography variant="h6" sx={ { fontWeight: 700, mb: 1.5, mt: 1, color: '#0E0E2E' } }>
                      Address Information
                    </Typography>
                  </Grid>
                  <Grid size={ { xs: 12 } }>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={ form.address_street }
                      onChange={ (e) => setForm({ ...form, address_street: e.target.value }) }
                      disabled={ !editing }
                      placeholder="123 Main Street"
                      sx={ { '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                    />
                  </Grid>
                  <Grid size={ { xs: 12 } }>
                    <TextField
                      fullWidth
                      label="Landmark"
                      value={ form.address_landmark }
                      onChange={ (e) => setForm({ ...form, address_landmark: e.target.value }) }
                      disabled={ !editing }
                      placeholder="Near City Park"
                      sx={ { '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                    />
                  </Grid>
                  <Grid size={ { xs: 12, sm: 6 } }>
                    <TextField
                      fullWidth
                      label="State"
                      value={ form.address_state }
                      onChange={ (e) => setForm({ ...form, address_state: e.target.value }) }
                      disabled={ !editing }
                      placeholder="Maharashtra"
                      sx={ { '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                    />
                  </Grid>
                  <Grid size={ { xs: 12, sm: 6 } }>
                    <TextField
                      fullWidth
                      label="Pincode"
                      value={ form.address_pincode }
                      onChange={ (e) => setForm({ ...form, address_pincode: e.target.value }) }
                      disabled={ !editing }
                      placeholder="400001"
                      sx={ { '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                    />
                  </Grid>
                  <Grid size={ { xs: 12, sm: 6 } }>
                    <TextField
                      fullWidth
                      label="My Referral Code"
                      value={ user?.referral_code || '' }
                      disabled
                      InputProps={ {
                        endAdornment: user?.referral_code ? (
                          <IconButton size="small" onClick={ () => handleCopyCode(user.referral_code) }>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        ) : null,
                      } }
                      sx={ { '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                    />
                  </Grid>
                  <Grid size={ { xs: 12 } }>
                    <Typography variant="caption" color="text.secondary">
                      Member since { user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' }
                    </Typography>
                  </Grid>
                </Grid>
              ) }

              {/* ─── My Plan Tab ─── */ }
              { tab === 1 && (
                <Box>
                  { planLoading ? (
                    <Box sx={ { display: 'flex', justifyContent: 'center', py: 4 } }>
                      <CircularProgress sx={ { color: '#03288C' } } />
                    </Box>
                  ) : currentPlan ? (
                    <Card
                      sx={ {
                        p: 0,
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid rgba(15,43,102,0.1)',
                        mb: 2,
                      } }
                    >
                      <Box
                        sx={ {
                          background: 'linear-gradient(135deg, #03288C, #1a56c4)',
                          color: '#fff',
                          p: 3,
                        } }
                      >
                        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
                          <Star sx={ { color: '#ffd700' } } />
                          <Box sx={ { flex: 1 } }>
                            <Typography variant="h6" fontWeight={ 700 }>{ currentPlan.name }</Typography>
                            <Typography variant="body2" sx={ { opacity: 0.8 } }>{ currentPlan.description }</Typography>
                          </Box>
                          <Typography variant="h4" fontWeight={ 800 }>
                            ₹{ Number(currentPlan.price).toLocaleString() }
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={ { p: 3 } }>
                        { currentPlan.features && (
                          <Box sx={ { mb: 2 } }>
                            { (Array.isArray(currentPlan.features)
                              ? currentPlan.features
                              : JSON.parse(currentPlan.features || '[]')
                            ).map((f) => (
                              <Box key={ f } sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 1 } }>
                                <CheckCircle sx={ { fontSize: 18, color: '#10b981' } } />
                                <Typography variant="body2">{ f }</Typography>
                              </Box>
                            )) }
                          </Box>
                        ) }
                        <Divider sx={ { my: 2 } } />
                        <Box sx={ { display: 'flex', gap: 2 } }>
                          <Button
                            variant="contained"
                            startIcon={ <SwapHoriz /> }
                            onClick={ () => navigate('/pricing') }
                            sx={ { bgcolor: '#03288C', borderRadius: 2, '&:hover': { bgcolor: '#021A66' } } }
                          >
                            Change Plan
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={ <Cancel /> }
                            onClick={ handleCancelPlan }
                            sx={ { borderRadius: 2 } }
                          >
                            Cancel Plan
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                  ) : (
                    <Card sx={ { p: 4, borderRadius: 3, textAlign: 'center', border: '2px dashed rgba(3,40,140,0.2)', bgcolor: 'rgba(3,40,140,0.02)' } }>
                      <CardMembership sx={ { fontSize: 56, color: '#03288C', opacity: 0.3, mb: 2 } } />
                      <Typography variant="h6" fontWeight={ 700 } sx={ { mb: 1 } }>
                        No Active Plan
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={ { mb: 3, maxWidth: 400, mx: 'auto' } }>
                        Unlock premium features, priority support, and exclusive benefits by choosing a plan.
                      </Typography>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={ () => navigate('/pricing') }
                        sx={ {
                          bgcolor: '#03288C',
                          borderRadius: 2,
                          px: 4,
                          fontWeight: 700,
                          '&:hover': { bgcolor: '#021A66' },
                        } }
                      >
                        Explore Plans
                      </Button>
                    </Card>
                  ) }
                </Box>
              ) }

              {/* ─── Offers Tab ─── */ }
              { tab === 2 && (
                <Box>
                  { offersLoading ? (
                    <Box sx={ { display: 'flex', justifyContent: 'center', py: 4 } }>
                      <CircularProgress sx={ { color: '#03288C' } } />
                    </Box>
                  ) : offers.length === 0 ? (
                    <Card sx={ { p: 4, borderRadius: 3, textAlign: 'center', bgcolor: '#fafafa' } }>
                      <LocalOffer sx={ { fontSize: 56, color: '#ccc', mb: 2 } } />
                      <Typography variant="h6" fontWeight={ 700 } sx={ { mb: 1 } }>
                        No Offers Available
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Check back later for exclusive deals and discounts!
                      </Typography>
                    </Card>
                  ) : (
                    <Box sx={ { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 } }>
                      { offers.map((offer) => (
                        <motion.div
                          key={ offer.id }
                          initial={ { opacity: 0, y: 20 } }
                          animate={ { opacity: 1, y: 0 } }
                          transition={ { duration: 0.3 } }
                        >
                          <Card
                            sx={ {
                              borderRadius: 3,
                              overflow: 'hidden',
                              border: '1px solid rgba(3,40,140,0.08)',
                              transition: 'all 0.3s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(3,40,140,0.12)',
                              },
                            } }
                          >
                            { offer.image && (
                              <Box
                                sx={ {
                                  height: 120,
                                  backgroundImage: `linear-gradient(135deg, rgba(3,40,140,0.7), rgba(26,86,196,0.5)), url(${offer.image})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  position: 'relative',
                                  display: 'flex',
                                  alignItems: 'end',
                                  p: 2,
                                } }
                              >
                                { offer.badge && (
                                  <Chip
                                    label={ offer.badge }
                                    size="small"
                                    sx={ {
                                      position: 'absolute',
                                      top: 10,
                                      right: 10,
                                      bgcolor: '#ffd700',
                                      color: '#0E0E2E',
                                      fontWeight: 800,
                                      fontSize: '0.65rem',
                                      letterSpacing: '0.05em',
                                    } }
                                  />
                                ) }
                                <Typography variant="h6" fontWeight={ 800 } color="#fff" sx={ { textShadow: '0 2px 8px rgba(0,0,0,0.3)' } }>
                                  { offer.discount_percent > 0
                                    ? `${offer.discount_percent}% OFF`
                                    : `₹${offer.discount_flat} OFF` }
                                </Typography>
                              </Box>
                            ) }
                            <CardContent sx={ { p: 2.5 } }>
                              <Typography variant="subtitle1" fontWeight={ 700 } sx={ { mb: 0.5 } }>
                                { offer.title }
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={ { mb: 2, lineHeight: 1.5 } }>
                                { offer.description }
                              </Typography>
                              { offer.code && (
                                <Box
                                  sx={ {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1.5,
                                    bgcolor: 'rgba(3,40,140,0.04)',
                                    borderRadius: 2,
                                    border: '1px dashed rgba(3,40,140,0.2)',
                                  } }
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight={ 800 }
                                    sx={ { flex: 1, fontFamily: 'monospace', letterSpacing: '0.1em', color: '#03288C' } }
                                  >
                                    { offer.code }
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={ () => handleCopyCode(offer.code) }
                                    sx={ { color: copiedCode === offer.code ? '#10b981' : '#03288C' } }
                                  >
                                    { copiedCode === offer.code ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" /> }
                                  </IconButton>
                                </Box>
                              ) }
                            </CardContent>
                          </Card>
                        </motion.div>
                      )) }
                    </Box>
                  ) }
                </Box>
              ) }

              {/* ─── Security Tab ─── */ }
              { tab === 3 && (
                <Box>
                  { walletLoading ? (
                    <Box sx={ { display: 'flex', justifyContent: 'center', py: 4 } }>
                      <CircularProgress sx={ { color: '#03288C' } } />
                    </Box>
                  ) : (
                    <Stack spacing={ 2 }>
                      <Card sx={ { borderRadius: 3, p: 2.5, border: '1px solid rgba(3,40,140,0.12)' } }>
                        <Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 } }>
                          <Typography variant="subtitle2" color="text.secondary">Available Balance</Typography>
                          <Chip label={ `${wallet?.credit_points || 0} pts` } size="small" />
                        </Box>
                        <Typography variant="h4" fontWeight={ 800 } sx={ { color: '#03288C' } }>
                          ₹{ Number(wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Add money instantly using Razorpay
                        </Typography>
                      </Card>

                      <Card sx={ { borderRadius: 3, p: 2.5, border: '1px solid rgba(3,40,140,0.12)' } }>
                        <Typography variant="subtitle1" fontWeight={ 700 } sx={ { mb: 1.5 } }>Top-up Wallet</Typography>
                        <Box sx={ { display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 } }>
                          { [100, 250, 500, 1000].map((amt) => (
                            <Chip
                              key={ amt }
                              label={ `₹${amt}` }
                              onClick={ () => setTopupAmount(String(amt)) }
                              variant={ topupAmount === String(amt) ? 'filled' : 'outlined' }
                              color={ topupAmount === String(amt) ? 'primary' : 'default' }
                            />
                          )) }
                        </Box>
                        <Box sx={ { display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' } }>
                          <TextField
                            size="small"
                            label="Amount (₹)"
                            value={ topupAmount }
                            onChange={ (e) => setTopupAmount(e.target.value) }
                            sx={ { minWidth: 180 } }
                          />
                          <Button
                            variant="contained"
                            startIcon={ <AddCircle /> }
                            onClick={ handleWalletTopup }
                            disabled={ topupProcessing }
                            sx={ { bgcolor: '#03288C', '&:hover': { bgcolor: '#021A66' } } }
                          >
                            { topupProcessing ? 'Processing...' : 'Add Money' }
                          </Button>
                        </Box>
                      </Card>

                      <Card sx={ { borderRadius: 3, p: 2.5, border: '1px solid rgba(3,40,140,0.12)' } }>
                        <Typography variant="subtitle1" fontWeight={ 700 } sx={ { mb: 1.5 } }>Recent Wallet Transactions</Typography>
                        { walletTxns.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">No wallet transactions yet.</Typography>
                        ) : (
                          <Stack spacing={ 1 }>
                            { walletTxns.map((txn) => (
                              <Box
                                key={ txn.id }
                                sx={ {
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  p: 1.2,
                                  borderRadius: 2,
                                  bgcolor: 'rgba(3,40,140,0.03)',
                                } }
                              >
                                <Box>
                                  <Typography variant="body2" fontWeight={ 600 }>{ txn.description || txn.type }</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    { txn.created_at ? new Date(txn.created_at).toLocaleString('en-IN') : '' }
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="body2"
                                  fontWeight={ 700 }
                                  sx={ { color: Number(txn.amount) >= 0 ? '#16a34a' : '#dc2626' } }
                                >
                                  { Number(txn.amount) >= 0 ? '+' : '-' }₹{ Math.abs(Number(txn.amount || 0)).toFixed(2) }
                                </Typography>
                              </Box>
                            )) }
                          </Stack>
                        ) }
                      </Card>
                    </Stack>
                  ) }
                </Box>
              ) }

              {/* ─── Security Tab ─── */ }
              { tab === 4 && (
                <Box>
                  <Card sx={ { p: 3, borderRadius: 3, bgcolor: '#f0f4ff', border: '1px solid rgba(15,43,102,0.1)', mb: 2 } }>
                    <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
                      <Shield sx={ { color: '#03288C' } } />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={ 700 }>Token-Based Authentication</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Your session is secured with JWT tokens that auto-refresh every few minutes
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                  <Card sx={ { p: 3, borderRadius: 3, bgcolor: '#f0f4ff', border: '1px solid rgba(15,43,102,0.1)', mb: 3 } }>
                    <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
                      <Lock sx={ { color: '#03288C' } } />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={ 700 }>Email Protection</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Your email address is locked for security. Contact support to change it.
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={ <ExitToApp /> }
                    onClick={ () => {
                      logout();
                      navigate('/');
                    } }
                    sx={ { borderRadius: 2 } }
                  >
                    Sign Out
                  </Button>
                </Box>
              ) }
            </CardContent>
          </Card>
        </motion.div>
      </Container>

      {/* Snackbar */ }
      <Snackbar
        open={ !!message.text }
        autoHideDuration={ 3000 }
        onClose={ () => setMessage({ text: '', severity: 'success' }) }
        anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
      >
        <Alert
          severity={ message.severity }
          onClose={ () => setMessage({ text: '', severity: 'success' }) }
          sx={ { borderRadius: 2 } }
        >
          { message.text }
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
