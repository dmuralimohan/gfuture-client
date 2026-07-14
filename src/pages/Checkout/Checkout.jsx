import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
  ArrowBack,
  QrCode2,
  Payment,
  AccountBalance,
  ContentCopy,
  Timer,
  LocalOffer,
  ReceiptLong,
  CreditCard,
  Security,
  Print,
  ShoppingBag,
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const steps = ['Address', 'Schedule', 'Payment', 'Pay Now'];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, platformFee, platformFeeRate, extraFeeLabel, extraFeeAmount, total, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  // Payment state
  const [orderId, setOrderId] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [paymentTimer, setPaymentTimer] = useState(600); // 10 minutes
  const [copied, setCopied] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [razorpayProcessing, setRazorpayProcessing] = useState(false);
  const [verifiedPayment, setVerifiedPayment] = useState(null);
  const timerRef = useRef(null);
  const pollRef = useRef(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [schedule, setSchedule] = useState({ date: '', time: '' });
  const [addressErrors, setAddressErrors] = useState({});
  const [scheduleErrors, setScheduleErrors] = useState({});

  // Validation helpers
  const validateAddress = () => {
    const errs = {};
    if (!address.line1.trim()) errs.line1 = 'Address Line 1 is required';
    if (!address.city.trim()) errs.city = 'City is required';
    if (!address.state.trim()) errs.state = 'State is required';
    if (!address.pincode.trim()) errs.pincode = 'PIN Code is required';
    else if (!/^\d{6}$/.test(address.pincode.trim())) errs.pincode = 'Enter a valid 6-digit PIN code';
    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSchedule = () => {
    const errs = {};
    if (!schedule.date) errs.date = 'Date is required';
    if (!schedule.time) errs.time = 'Time is required';
    setScheduleErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!validateAddress()) return;
    }
    if (activeStep === 1) {
      if (!validateSchedule()) return;
    }
    setActiveStep(activeStep + 1);
  };

  // Payment countdown timer
  useEffect(() => {
    if (activeStep === 3 && paymentData && paymentTimer > 0) {
      timerRef.current = setInterval(() => {
        setPaymentTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [activeStep, paymentData]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (items.length === 0 && !orderPlaced && !orderId) {
      navigate('/cart');
    }
  }, [isAuthenticated, items.length, orderPlaced, orderId, navigate]);

  if (!isAuthenticated || (items.length === 0 && !orderPlaced && !orderId)) {
    return null;
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Coupon handlers
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const { data } = await api.post('/api/offers/apply', {
        code: couponCode.trim(),
        subtotal,
      });
      setCouponApplied({
        code: data.offer.code,
        discount_amount: data.discount_amount,
        offer: data.offer,
      });
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setCouponError('');
  };

  // Adjusted totals with coupon
  const discountAmount = couponApplied?.discount_amount || 0;
  const discountedSubtotal = subtotal - discountAmount;
  const adjustedPlatformFee = Math.round(discountedSubtotal * (platformFeeRate / 100) * 100) / 100;
  const adjustedExtraFee = extraFeeAmount || 0;
  const adjustedTotal = discountedSubtotal + adjustedPlatformFee + adjustedExtraFee;

  // Step 3: Place order + initiate payment
  const handleProceedToPayment = async () => {
    setPlacing(true);
    setError('');
    try {
      // 1. Create order
      const { data: orderData } = await api.post('/api/orders', {
        items: items.map((item) => ({
          serviceId: item.id,
          quantity: item.quantity,
        })),
        address,
        scheduled_date: schedule.date,
        scheduled_time: schedule.time,
        coupon_code: couponApplied?.code || undefined,
      });
      const newOrderId = orderData.order.id;
      setOrderId(newOrderId);

      // 2. Initiate payment
      setPaymentLoading(true);
      const { data: payData } = await api.post('/api/payments/initiate', {
        orderId: newOrderId,
      });
      setPaymentData(payData.payment);

      // 3. If Razorpay mode — open Razorpay checkout popup automatically
      if (payData.payment.method === 'razorpay' && payData.payment.razorpayOrderId) {
        setActiveStep(3);
        openRazorpayCheckout(payData.payment);
      } else {
        // UPI QR fallback
        setPaymentTimer(600);
        setActiveStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setPlacing(false);
      setPaymentLoading(false);
    }
  };

  // Open Razorpay Checkout popup (handles UPI QR, cards, net banking, wallets etc.)
  const openRazorpayCheckout = useCallback((payment) => {
    if (!window.Razorpay) {
      setError('Payment gateway is loading. Please try again.');
      return;
    }

    const razorpayPublicKey = import.meta.env.VITE_RAZORPAY_KEY_ID || payment.razorpayKeyId || '';
    if (!razorpayPublicKey) {
      setError('Razorpay key is not configured. Please contact support.');
      return;
    }

    setRazorpayProcessing(true);
    setError('');

    const options = {
      key: razorpayPublicKey,
      amount: Math.round(payment.amount * 100),
      currency: 'INR',
      name: 'GFuture',
      description: payment.breakdown?.items?.map(i => i.name).join(', ').substring(0, 250) || 'Order Payment',
      order_id: payment.razorpayOrderId,
      prefill: {
        name: payment.customerName || user?.name || '',
        email: payment.customerEmail || user?.email || '',
        contact: payment.customerPhone || user?.phone || '',
      },
      notes: {
        orderId: payment.orderId,
        subtotal: `₹${payment.breakdown?.subtotal?.toFixed(2) || '0'}`,
        platformFee: `₹${payment.breakdown?.platform_fee?.toFixed(2) || '0'}`,
        total: `₹${payment.amount?.toFixed(2) || '0'}`,
      },
      theme: {
        color: '#03288C',
        backdrop_color: 'rgba(0,0,0,0.6)',
      },
      modal: {
        ondismiss: () => {
          setRazorpayProcessing(false);
          startPaymentPolling(payment.id);
        },
        confirm_close: true,
      },
      handler: async (response) => {
        setPaymentVerifying(true);
        setRazorpayProcessing(false);
        try {
          const { data } = await api.post('/api/payments/verify', {
            paymentId: payment.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          clearCart();
          stopPolling();
          setVerifiedPayment(data.payment);
          setOrderPlaced(true);
          clearInterval(timerRef.current);
        } catch (err) {
          startPaymentPolling(payment.id);
          setError(
            err.response?.data?.message
            || 'Verification is pending. We will confirm automatically when webhook updates payment status.'
          );
        } finally {
          setPaymentVerifying(false);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      setRazorpayProcessing(false);
      startPaymentPolling(payment.id);
      setError(`Payment failed or pending: ${response.error.description || 'Tracking status via webhook...'}`);
    });
    rzp.open();
  }, [user, clearCart]);

  // Poll server for payment status (backs up webhook/callback)
  const startPaymentPolling = useCallback((paymentId) => {
    if (pollRef.current) return; // already polling
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/api/payments/status/${paymentId}`);
        if (data.payment.status === 'completed') {
          clearCart();
          setOrderPlaced(true);
          stopPolling();
          clearInterval(timerRef.current);
        } else if (data.payment.status === 'failed') {
          setError('Payment failed. Please try again.');
          stopPolling();
        }
      } catch {
        // ignore polling errors
      }
    }, 3000); // poll every 3 seconds
  }, [clearCart]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Clean up polling on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Verify payment — for UPI QR fallback mode
  const handleVerifyPayment = async () => {
    if (!paymentData) return;
    setPaymentVerifying(true);
    setError('');
    try {
      const { data } = await api.post('/api/payments/verify', {
        paymentId: paymentData.id,
        transactionRef: transactionRef || undefined,
      });
      clearCart();
      setVerifiedPayment(data.payment);
      setOrderPlaced(true);
      clearInterval(timerRef.current);
      stopPolling();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed');
    } finally {
      setPaymentVerifying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Success Screen
  if (orderPlaced) {
    const txnId = verifiedPayment?.transaction_ref || verifiedPayment?.razorpay_payment_id || '';
    const paidAt = verifiedPayment?.paid_at;
    const method = verifiedPayment?.method || paymentData?.method || '';
    const bd = paymentData?.breakdown;

    return (
      <Box sx={ { py: 6, minHeight: '60vh' } }>
        <Container maxWidth="sm">
          <motion.div initial={ { scale: 0 } } animate={ { scale: 1 } } transition={ { type: 'spring', stiffness: 200 } }>
            <Box sx={ { textAlign: 'center', mb: 3 } }>
              <CheckCircle sx={ { fontSize: 80, color: '#22c55e', mb: 2 } } />
              <Typography variant="h4" fontWeight={ 800 } sx={ { mb: 0.5 } }>Payment Confirmed!</Typography>
              <Typography variant="body2" color="text.secondary">
                Your service has been booked and payment is verified.
              </Typography>
            </Box>
          </motion.div>

          <motion.div initial={ { opacity: 0, y: 20 } } animate={ { opacity: 1, y: 0 } } transition={ { delay: 0.3 } }>
            {/* Transaction Card */ }
            <Card sx={ { borderRadius: 4, mb: 3, border: '2px solid #22c55e', overflow: 'visible' } }>
              <Box sx={ { bgcolor: '#22c55e', color: '#fff', py: 1.5, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
                <Typography variant="subtitle2" fontWeight={ 700 }>
                  <CheckCircle sx={ { fontSize: 16, verticalAlign: 'middle', mr: 0.5 } } /> Payment Successful
                </Typography>
                <Typography variant="subtitle2" fontWeight={ 800 }>₹{ (bd?.total || paymentData?.amount || 0).toFixed(2) }</Typography>
              </Box>
              <CardContent sx={ { p: 3 } }>
                {/* Order Items */ }
                { bd?.items && bd.items.length > 0 && (
                  <Box sx={ { mb: 2 } }>
                    { bd.items.map((item, idx) => (
                      <Box key={ idx } sx={ { display: 'flex', justifyContent: 'space-between', py: 0.5 } }>
                        <Typography variant="body2" color="text.secondary">{ item.name } × { item.qty }</Typography>
                        <Typography variant="body2" fontWeight={ 600 }>₹{ (item.price * item.qty).toFixed(2) }</Typography>
                      </Box>
                    )) }
                    <Divider sx={ { my: 1.5 } } />
                  </Box>
                ) }

                {/* Breakdown */ }
                { bd && (
                  <Box sx={ { mb: 2 } }>
                    <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 0.5 } }>
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Typography variant="body2">₹{ bd.subtotal?.toFixed(2) }</Typography>
                    </Box>
                    { bd.discount_amount > 0 && (
                      <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 0.5 } }>
                        <Typography variant="body2" color="#10b981">Discount { bd.coupon_code ? `(${bd.coupon_code})` : '' }</Typography>
                        <Typography variant="body2" color="#10b981" fontWeight={ 600 }>−₹{ bd.discount_amount.toFixed(2) }</Typography>
                      </Box>
                    ) }
                    <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 0.5 } }>
                      <Typography variant="body2" color="text.secondary">GST Charges</Typography>
                      <Typography variant="body2">₹{ bd.platform_fee?.toFixed(2) }</Typography>
                    </Box>
                    <Divider sx={ { my: 1 } } />
                    <Box sx={ { display: 'flex', justifyContent: 'space-between' } }>
                      <Typography variant="subtitle2" fontWeight={ 800 }>Total Paid</Typography>
                      <Typography variant="subtitle2" fontWeight={ 800 } color="#03288C">₹{ bd.total?.toFixed(2) }</Typography>
                    </Box>
                  </Box>
                ) }

                <Divider sx={ { my: 1.5 } } />

                {/* Transaction Details */ }
                <Box sx={ { bgcolor: '#f8fafc', borderRadius: 2, p: 2 } }>
                  { orderId && (
                    <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 0.8 } }>
                      <Typography variant="caption" color="text.secondary">Order ID</Typography>
                      <Typography variant="caption" fontWeight={ 700 } sx={ { fontFamily: 'monospace' } }>{ orderId.substring(0, 16) }...</Typography>
                    </Box>
                  ) }
                  { txnId && (
                    <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 0.8 } }>
                      <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
                      <Typography variant="caption" fontWeight={ 700 } sx={ { fontFamily: 'monospace' } }>{ txnId.substring(0, 20) }</Typography>
                    </Box>
                  ) }
                  { method && (
                    <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 0.8 } }>
                      <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                      <Chip label={ method.toUpperCase() } size="small" sx={ { fontSize: '0.65rem', height: 20, bgcolor: '#eaf1fb', color: '#03288C', fontWeight: 700 } } />
                    </Box>
                  ) }
                  { paidAt && (
                    <Box sx={ { display: 'flex', justifyContent: 'space-between' } }>
                      <Typography variant="caption" color="text.secondary">Paid At</Typography>
                      <Typography variant="caption" fontWeight={ 600 }>{ new Date(paidAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) }</Typography>
                    </Box>
                  ) }
                </Box>
              </CardContent>
            </Card>

            <Box sx={ { display: 'flex', gap: 2, justifyContent: 'center' } }>
              <Button variant="contained" onClick={ () => navigate('/orders') }
                startIcon={ <ShoppingBag /> }
                sx={ { bgcolor: '#03288C', borderRadius: '10px', px: 4, fontWeight: 700, '&:hover': { bgcolor: '#021A66' } } }>
                View Orders
              </Button>
              <Button variant="outlined" onClick={ () => navigate('/services') }
                sx={ { borderRadius: '10px', px: 4, fontWeight: 700, borderColor: '#03288C', color: '#03288C' } }>
                Continue Browsing
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={ { py: 4, minHeight: '80vh' } }>
      <Container maxWidth="md">
        <motion.div initial={ { opacity: 0, y: 20 } } animate={ { opacity: 1, y: 0 } }>
          <Button startIcon={ <ArrowBack /> } onClick={ () => navigate('/cart') } sx={ { mb: 2, color: '#5a6a80' } }>
            Back to Cart
          </Button>
          <Typography variant="h3" fontWeight={ 800 } sx={ { mb: 4, fontSize: { xs: '1.8rem', md: '2.4rem' } } }>
            Checkout
          </Typography>

          <Stepper activeStep={ activeStep } sx={ { mb: { xs: 2, md: 4 } } } alternativeLabel>
            { steps.map((label) => (
              <Step key={ label }>
                <StepLabel>{ label }</StepLabel>
              </Step>
            )) }
          </Stepper>

          {/* Steps 0-2: Address, Schedule, Summary */ }
          { activeStep < 3 && (
            <Card sx={ { borderRadius: 4, mb: 3 } }>
              <CardContent sx={ { p: { xs: 3, md: 4 } } }>
                { activeStep === 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={ 700 } sx={ { mb: 3 } }>Service Address <Typography component="span" variant="caption" color="error">*</Typography></Typography>
                    <Grid container spacing={ 2 }>
                      <Grid size={ { xs: 12 } }>
                        <TextField fullWidth label="Address Line 1" value={ address.line1 } required
                          error={ !!addressErrors.line1 } helperText={ addressErrors.line1 }
                          onChange={ (e) => { setAddress({ ...address, line1: e.target.value }); setAddressErrors({ ...addressErrors, line1: '' }); } } />
                      </Grid>
                      <Grid size={ { xs: 12 } }>
                        <TextField fullWidth label="Address Line 2 (Optional)" value={ address.line2 }
                          onChange={ (e) => setAddress({ ...address, line2: e.target.value }) } />
                      </Grid>
                      <Grid size={ { xs: 12, sm: 4 } }>
                        <TextField fullWidth label="City" value={ address.city } required
                          error={ !!addressErrors.city } helperText={ addressErrors.city }
                          onChange={ (e) => { setAddress({ ...address, city: e.target.value }); setAddressErrors({ ...addressErrors, city: '' }); } } />
                      </Grid>
                      <Grid size={ { xs: 12, sm: 4 } }>
                        <TextField fullWidth label="State" value={ address.state } required
                          error={ !!addressErrors.state } helperText={ addressErrors.state }
                          onChange={ (e) => { setAddress({ ...address, state: e.target.value }); setAddressErrors({ ...addressErrors, state: '' }); } } />
                      </Grid>
                      <Grid size={ { xs: 12, sm: 4 } }>
                        <TextField fullWidth label="PIN Code" value={ address.pincode } required
                          error={ !!addressErrors.pincode } helperText={ addressErrors.pincode }
                          onChange={ (e) => { setAddress({ ...address, pincode: e.target.value }); setAddressErrors({ ...addressErrors, pincode: '' }); } } />
                      </Grid>
                    </Grid>
                  </Box>
                ) }

                { activeStep === 1 && (
                  <Box>
                    <Typography variant="h6" fontWeight={ 700 } sx={ { mb: 3 } }>Schedule Service <Typography component="span" variant="caption" color="error">*</Typography></Typography>
                    <Grid container spacing={ 2 }>
                      <Grid size={ { xs: 12, sm: 6 } }>
                        <TextField fullWidth type="date" label="Preferred Date" value={ schedule.date } required
                          error={ !!scheduleErrors.date } helperText={ scheduleErrors.date }
                          onChange={ (e) => { setSchedule({ ...schedule, date: e.target.value }); setScheduleErrors({ ...scheduleErrors, date: '' }); } }
                          InputLabelProps={ { shrink: true } }
                          inputProps={ { min: new Date().toISOString().split('T')[0] } } />
                      </Grid>
                      <Grid size={ { xs: 12, sm: 6 } }>
                        <TextField fullWidth type="time" label="Preferred Time" value={ schedule.time } required
                          error={ !!scheduleErrors.time } helperText={ scheduleErrors.time }
                          onChange={ (e) => { setSchedule({ ...schedule, time: e.target.value }); setScheduleErrors({ ...scheduleErrors, time: '' }); } }
                          InputLabelProps={ { shrink: true } } />
                      </Grid>
                    </Grid>
                  </Box>
                ) }

                { activeStep === 2 && (
                  <Box>
                    <Typography variant="h6" fontWeight={ 700 } sx={ { mb: 3, display: 'flex', alignItems: 'center' } }>
                      <ReceiptLong sx={ { mr: 1, color: '#03288C' } } />
                      Order Summary
                    </Typography>

                    {/* Item list with clear details */ }
                    <Box sx={ { bgcolor: '#f8fafc', borderRadius: 2, p: 2, mb: 2 } }>
                      { items.map((item, idx) => (
                        <Box key={ item.id }>
                          <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5, py: 1 } }>
                            <Box sx={ { width: 44, height: 44, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0, bgcolor: '#eaf1fb' } }>
                              { item.image && <Box component="img" src={ item.image } alt={ item.name } sx={ { width: '100%', height: '100%', objectFit: 'cover' } } /> }
                            </Box>
                            <Box sx={ { flex: 1, minWidth: 0 } }>
                              <Typography variant="body2" fontWeight={ 600 } noWrap>{ item.name }</Typography>
                              <Typography variant="caption" color="text.secondary">Qty: { item.quantity } × ₹{ item.price.toLocaleString() }</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={ 700 } sx={ { color: '#03288C' } }>
                              ₹{ (item.price * item.quantity).toLocaleString() }
                            </Typography>
                          </Box>
                          { idx < items.length - 1 && <Divider sx={ { my: 0.5 } } /> }
                        </Box>
                      )) }
                    </Box>

                    {/* Coupon Code Input */ }
                    <Box sx={ { mb: 2 } }>
                      <Typography variant="subtitle2" fontWeight={ 700 } sx={ { mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 } }>
                        <LocalOffer sx={ { fontSize: 18, color: '#ec4899' } } />
                        Have a coupon code?
                      </Typography>
                      { couponApplied ? (
                        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#10b98110', borderRadius: 2, border: '1px solid #10b98130' } }>
                          <CheckCircle sx={ { color: '#10b981', fontSize: 20 } } />
                          <Box sx={ { flex: 1 } }>
                            <Typography variant="body2" fontWeight={ 700 } color="#059669">
                              { couponApplied.code } applied — You save ₹{ couponApplied.discount_amount.toFixed(2) }
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              { couponApplied.offer.title }
                            </Typography>
                          </Box>
                          <Button size="small" onClick={ handleRemoveCoupon } sx={ { color: '#ef4444', fontSize: '0.75rem' } }>
                            Remove
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={ { display: 'flex', gap: 1 } }>
                          <TextField
                            size="small"
                            placeholder="Enter coupon code"
                            value={ couponCode }
                            onChange={ (e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); } }
                            sx={ { flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                            error={ !!couponError }
                            helperText={ couponError }
                          />
                          <Button
                            variant="contained"
                            onClick={ handleApplyCoupon }
                            disabled={ couponLoading || !couponCode.trim() }
                            sx={ {
                              bgcolor: '#03288C',
                              color: '#ffffff',
                              borderRadius: 2,
                              px: 3,
                              minWidth: 80,
                              fontWeight: 700,
                              '&:hover': { bgcolor: '#021A66', color: '#ffffff' },
                              '&.Mui-disabled': { bgcolor: '#03288C80', color: '#ffffffcc' },
                            } }
                          >
                            { couponLoading ? <CircularProgress size={ 20 } sx={ { color: '#fff' } } /> : 'Apply' }
                          </Button>
                        </Box>
                      ) }
                    </Box>

                    <Divider sx={ { my: 2 } } />
                    <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 1 } }>
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Typography variant="body2" fontWeight={ 600 }>₹{ subtotal.toLocaleString() }</Typography>
                    </Box>
                    { discountAmount > 0 && (
                      <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 1 } }>
                        <Typography variant="body2" color="#10b981" fontWeight={ 600 }>Coupon Discount ({ couponApplied?.code })</Typography>
                        <Typography variant="body2" fontWeight={ 700 } color="#10b981">−₹{ discountAmount.toFixed(2) }</Typography>
                      </Box>
                    ) }
                    <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 1 } }>
                      <Typography variant="body2" color="text.secondary">GST Charges ({ platformFeeRate }%)</Typography>
                      <Typography variant="body2" fontWeight={ 600 }>₹{ adjustedPlatformFee.toFixed(2) }</Typography>
                    </Box>
                    { extraFeeLabel && adjustedExtraFee > 0 && (
                      <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 1 } }>
                        <Typography variant="body2" color="text.secondary">{ extraFeeLabel }</Typography>
                        <Typography variant="body2" fontWeight={ 600 }>₹{ adjustedExtraFee.toFixed(2) }</Typography>
                      </Box>
                    ) }
                    <Divider sx={ { my: 2 } } />
                    <Box sx={ { display: 'flex', justifyContent: 'space-between' } }>
                      <Typography variant="h6" fontWeight={ 800 }>Total</Typography>
                      <Typography variant="h6" fontWeight={ 800 } sx={ { color: '#03288C' } }>₹{ adjustedTotal.toFixed(2) }</Typography>
                    </Box>

                    <Alert severity="info" sx={ { mt: 3, borderRadius: 2 } } icon={ <Payment /> }>
                      Pay securely via Razorpay — UPI QR, Google Pay, PhonePe, Cards, Net Banking & more. Payment is verified automatically.
                    </Alert>

                    { error && (
                      <Alert severity="error" sx={ { mt: 2, borderRadius: 2 } }>{ error }</Alert>
                    ) }
                  </Box>
                ) }
              </CardContent>
            </Card>
          ) }

          {/* Step 3: Payment */ }
          <AnimatePresence>
            { activeStep === 3 && paymentData && (
              <motion.div
                initial={ { opacity: 0, y: 30 } }
                animate={ { opacity: 1, y: 0 } }
                transition={ { duration: 0.5 } }
              >
                <Card sx={ { borderRadius: 4, mb: 3, border: '2px solid #03288C' } }>
                  <CardContent sx={ { p: { xs: 3, md: 4 } } }>

                    {/* ── Razorpay Mode ── */ }
                    { paymentData.method === 'razorpay' ? (
                      <Box>
                        {/* Processing State */ }
                        { (razorpayProcessing || paymentVerifying) && (
                          <Box sx={ { textAlign: 'center', py: 4 } }>
                            <motion.div
                              animate={ { rotate: 360 } }
                              transition={ { duration: 2, repeat: Infinity, ease: 'linear' } }
                              style={ { display: 'inline-block', marginBottom: 24 } }
                            >
                              <Payment sx={ { fontSize: 60, color: '#03288C' } } />
                            </motion.div>
                            <Typography variant="h6" fontWeight={ 700 } sx={ { mb: 1 } }>
                              { paymentVerifying ? 'Verifying Payment...' : 'Processing Payment...' }
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>
                              { paymentVerifying
                                ? 'Confirming your payment with the bank. This takes a moment.'
                                : 'Complete the payment in the Razorpay window. Do not close this page.'
                              }
                            </Typography>
                            <LinearProgress sx={ { borderRadius: 2, height: 6, bgcolor: '#eaf1fb', '& .MuiLinearProgress-bar': { bgcolor: '#03288C' } } } />
                          </Box>
                        ) }

                        {/* Ready / Idle State */ }
                        { !razorpayProcessing && !paymentVerifying && (
                          <Box>
                            <Typography variant="h6" fontWeight={ 700 } sx={ { mb: 2, display: 'flex', alignItems: 'center' } }>
                              <ReceiptLong sx={ { mr: 1, color: '#03288C' } } />
                              Payment Summary
                            </Typography>

                            {/* Bill Breakdown */ }
                            { paymentData.breakdown && (
                              <Box sx={ { bgcolor: '#f8fafc', borderRadius: 3, p: 2.5, mb: 3, border: '1px solid #e2e8f0' } }>
                                { paymentData.breakdown.items?.map((item, idx) => (
                                  <Box key={ idx } sx={ { display: 'flex', justifyContent: 'space-between', py: 0.5 } }>
                                    <Typography variant="body2">{ item.name } × { item.qty }</Typography>
                                    <Typography variant="body2" fontWeight={ 600 }>₹{ (item.price * item.qty).toFixed(2) }</Typography>
                                  </Box>
                                )) }
                                <Divider sx={ { my: 1.5 } } />
                                <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 0.5 } }>
                                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                  <Typography variant="body2" fontWeight={ 600 }>₹{ paymentData.breakdown.subtotal?.toFixed(2) }</Typography>
                                </Box>
                                { paymentData.breakdown.discount_amount > 0 && (
                                  <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 0.5 } }>
                                    <Typography variant="body2" color="#10b981" fontWeight={ 600 }>
                                      Coupon Discount { paymentData.breakdown.coupon_code ? `(${paymentData.breakdown.coupon_code})` : '' }
                                    </Typography>
                                    <Typography variant="body2" fontWeight={ 700 } color="#10b981">−₹{ paymentData.breakdown.discount_amount.toFixed(2) }</Typography>
                                  </Box>
                                ) }
                                <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 0.5 } }>
                                  <Typography variant="body2" color="text.secondary">GST Charges</Typography>
                                  <Typography variant="body2" fontWeight={ 600 }>₹{ paymentData.breakdown.platform_fee?.toFixed(2) }</Typography>
                                </Box>
                                <Divider sx={ { my: 1.5 } } />
                                <Box sx={ { display: 'flex', justifyContent: 'space-between' } }>
                                  <Typography variant="subtitle1" fontWeight={ 800 }>Total Payable</Typography>
                                  <Typography variant="subtitle1" fontWeight={ 800 } sx={ { color: '#03288C' } }>₹{ paymentData.breakdown.total?.toFixed(2) }</Typography>
                                </Box>
                              </Box>
                            ) }

                            {/* Pay Button */ }
                            <Button
                              fullWidth
                              variant="contained"
                              size="large"
                              onClick={ () => openRazorpayCheckout(paymentData) }
                              startIcon={ <Payment /> }
                              sx={ {
                                bgcolor: '#03288C',
                                borderRadius: '12px',
                                py: 1.8,
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                mb: 2,
                                '&:hover': { bgcolor: '#021A66' },
                              } }
                            >
                              Pay ₹{ paymentData.amount?.toFixed(2) } Now
                            </Button>

                            <Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 } }>
                              <Security sx={ { fontSize: 16, color: '#22c55e' } } />
                              <Typography variant="caption" color="text.secondary">
                                Secured by Razorpay | 256-bit SSL Encryption
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={ { display: 'block', textAlign: 'center' } }>
                              UPI QR Code · Google Pay · PhonePe · Cards · Net Banking · Wallets
                            </Typography>

                            { error && (
                              <Alert severity="error" sx={ { mt: 2, borderRadius: 2 } }>{ error }</Alert>
                            ) }
                          </Box>
                        ) }
                      </Box>
                    ) : (

                      /* ── UPI QR Fallback Mode ── */
                      <Box>
                        {/* Timer Header */ }
                        <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 } }>
                          <Typography variant="h6" fontWeight={ 700 }>
                            <QrCode2 sx={ { mr: 1, verticalAlign: 'middle', color: '#03288C' } } />
                            Scan & Pay
                          </Typography>
                          <Chip
                            icon={ <Timer sx={ { fontSize: 16 } } /> }
                            label={ paymentTimer > 0 ? formatTime(paymentTimer) : 'Expired' }
                            size="small"
                            sx={ {
                              bgcolor: paymentTimer > 60 ? '#eaf1fb' : paymentTimer > 0 ? '#fef3c7' : '#fee2e2',
                              color: paymentTimer > 60 ? '#03288C' : paymentTimer > 0 ? '#d97706' : '#dc2626',
                              fontWeight: 700,
                              fontFamily: 'Poppins',
                            } }
                          />
                        </Box>

                        {/* QR Code */ }
                        <Box sx={ { textAlign: 'center', mb: 3 } }>
                          <Box
                            sx={ {
                              display: 'inline-block',
                              p: 3,
                              borderRadius: 4,
                              bgcolor: '#fff',
                              border: '2px solid #eaf1fb',
                              boxShadow: '0 4px 20px rgba(15,43,102,0.08)',
                            } }
                          >
                            { paymentData.qrCode ? (
                              <Box
                                component="img"
                                src={ paymentData.qrCode }
                                alt="UPI QR Code"
                                sx={ { width: 260, height: 260, display: 'block' } }
                              />
                            ) : (
                              <Box sx={ { width: 260, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
                                <CircularProgress />
                              </Box>
                            ) }
                          </Box>

                          <Typography variant="h5" fontWeight={ 800 } sx={ { mt: 2, color: '#03288C' } }>
                            ₹{ paymentData.amount?.toFixed(2) }
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Scan with Google Pay, PhonePe, Paytm, or any UPI app
                          </Typography>
                        </Box>

                        {/* UPI ID */ }
                        <Box
                          sx={ {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            mb: 3,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                          } }
                        >
                          <AccountBalance sx={ { color: '#5a6a80', fontSize: 20 } } />
                          <Typography variant="body2" fontWeight={ 600 } sx={ { fontFamily: 'Poppins' } }>
                            UPI: { paymentData.merchantUPI }
                          </Typography>
                          <Button
                            size="small"
                            startIcon={ <ContentCopy sx={ { fontSize: 14 } } /> }
                            onClick={ () => copyToClipboard(paymentData.merchantUPI) }
                            sx={ { fontSize: '0.7rem', color: '#03288C', minWidth: 'auto' } }
                          >
                            { copied ? 'Copied!' : 'Copy' }
                          </Button>
                        </Box>

                        <Divider sx={ { my: 2 } } />

                        {/* Transaction Reference */ }
                        <Typography variant="subtitle2" fontWeight={ 700 } sx={ { mb: 1 } }>
                          After paying, enter your UPI Transaction ID (optional)
                        </Typography>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="e.g. 123456789012 or UPI ref number"
                          value={ transactionRef }
                          onChange={ (e) => setTransactionRef(e.target.value) }
                          sx={ {
                            mb: 2,
                            '& .MuiOutlinedInput-root': { borderRadius: 2 },
                          } }
                        />

                        { error && (
                          <Alert severity="error" sx={ { mb: 2, borderRadius: 2 } }>{ error }</Alert>
                        ) }

                        {/* Confirm Payment Button */ }
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={ handleVerifyPayment }
                          disabled={ paymentVerifying || paymentTimer === 0 }
                          startIcon={ paymentVerifying ? <CircularProgress size={ 20 } color="inherit" /> : <CheckCircle /> }
                          sx={ {
                            bgcolor: '#22c55e',
                            borderRadius: '6px',
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 700,
                            '&:hover': { bgcolor: '#16a34a' },
                          } }
                        >
                          { paymentVerifying ? 'Verifying Payment...' : 'I Have Paid — Confirm' }
                        </Button>

                        { paymentTimer === 0 && (
                          <Alert severity="warning" sx={ { mt: 2, borderRadius: 2 } }>
                            QR code expired. Please go back and try again.
                          </Alert>
                        ) }

                        <Typography variant="caption" color="text.secondary" sx={ { display: 'block', textAlign: 'center', mt: 2 } }>
                          Your payment will be verified and order confirmed instantly
                        </Typography>
                      </Box>
                    ) }

                  </CardContent>
                </Card>
              </motion.div>
            ) }
          </AnimatePresence>

          {/* Navigation Buttons */ }
          { activeStep < 3 && (
            <Box sx={ { display: 'flex', justifyContent: 'space-between' } }>
              <Button
                disabled={ activeStep === 0 || placing }
                onClick={ () => setActiveStep(activeStep - 1) }
                sx={ { color: '#5a6a80' } }
              >
                Back
              </Button>
              { activeStep < 2 ? (
                <Button variant="contained" onClick={ handleNext }
                  sx={ { bgcolor: '#03288C', borderRadius: '6px', px: 4, '&:hover': { bgcolor: '#021A66' } } }>
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={ handleProceedToPayment }
                  disabled={ placing || paymentLoading }
                  startIcon={ (placing || paymentLoading) ? <CircularProgress size={ 20 } color="inherit" /> : <Payment /> }
                  sx={ { bgcolor: '#03288C', borderRadius: '6px', px: 4, '&:hover': { bgcolor: '#021A66' } } }
                >
                  { placing ? 'Creating Order...' : paymentLoading ? 'Preparing Payment...' : 'Proceed to Pay' }
                </Button>
              ) }
            </Box>
          ) }

          {/* Back button on QR step */ }
          { activeStep === 3 && (
            <Box sx={ { textAlign: 'center', mt: 2 } }>
              <Button
                size="small"
                onClick={ () => navigate('/orders') }
                sx={ { color: '#5a6a80' } }
              >
                Pay Later — Go to Orders
              </Button>
            </Box>
          ) }
        </motion.div>
      </Container>
    </Box>
  );
};

export default Checkout;
