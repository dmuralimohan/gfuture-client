import { useState, useEffect, useRef } from 'react';
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
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const steps = ['Address', 'Schedule', 'Payment', 'Pay via UPI'];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, platformFee, total, clearCart } = useCart();
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
  const timerRef = useRef(null);

  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [schedule, setSchedule] = useState({ date: '', time: '' });

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
  const adjustedPlatformFee = Math.round(discountedSubtotal * 0.0102 * 100) / 100;
  const adjustedTotal = discountedSubtotal + adjustedPlatformFee;

  // Step 3: Place order + generate QR
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

      // 2. Initiate payment & get QR
      setPaymentLoading(true);
      const { data: payData } = await api.post('/api/payments/initiate', {
        orderId: newOrderId,
      });
      setPaymentData(payData.payment);
      setPaymentTimer(600);
      setActiveStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setPlacing(false);
      setPaymentLoading(false);
    }
  };

  // Verify payment
  const handleVerifyPayment = async () => {
    if (!paymentData) return;
    setPaymentVerifying(true);
    setError('');
    try {
      await api.post('/api/payments/verify', {
        paymentId: paymentData.id,
        transactionRef: transactionRef || undefined,
      });
      clearCart();
      setOrderPlaced(true);
      clearInterval(timerRef.current);
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
    return (
      <Box sx={ { py: 10, textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
        <Container maxWidth="sm">
          <motion.div initial={ { scale: 0 } } animate={ { scale: 1 } } transition={ { type: 'spring', stiffness: 200 } }>
            <CheckCircle sx={ { fontSize: 100, color: '#22c55e', mb: 3 } } />
          </motion.div>
          <motion.div initial={ { opacity: 0, y: 20 } } animate={ { opacity: 1, y: 0 } } transition={ { delay: 0.3 } }>
            <Typography variant="h3" fontWeight={ 800 } sx={ { mb: 1 } }>Payment Confirmed!</Typography>
            <Typography variant="body1" color="text.secondary" sx={ { mb: 1 } }>
              Your service has been booked and payment is verified.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={ { mb: 4 } }>
              Our provider will contact you at your scheduled time.
            </Typography>
            <Box sx={ { display: 'flex', gap: 2, justifyContent: 'center' } }>
              <Button variant="contained" onClick={ () => navigate('/orders') }
                sx={ { bgcolor: '#03288C', borderRadius: '6px', px: 4, '&:hover': { bgcolor: '#021A66' } } }>
                View Orders
              </Button>
              <Button variant="outlined" onClick={ () => navigate('/services') }
                sx={ { borderRadius: '6px', px: 4, borderColor: '#03288C', color: '#03288C' } }>
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

          <Stepper activeStep={ activeStep } sx={ { mb: 4 } } alternativeLabel>
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
                    <Typography variant="h6" fontWeight={ 700 } sx={ { mb: 3 } }>Service Address</Typography>
                    <Grid container spacing={ 2 }>
                      <Grid size={ { xs: 12 } }>
                        <TextField fullWidth label="Address Line 1" value={ address.line1 }
                          onChange={ (e) => setAddress({ ...address, line1: e.target.value }) } />
                      </Grid>
                      <Grid size={ { xs: 12 } }>
                        <TextField fullWidth label="Address Line 2 (Optional)" value={ address.line2 }
                          onChange={ (e) => setAddress({ ...address, line2: e.target.value }) } />
                      </Grid>
                      <Grid size={ { xs: 12, sm: 4 } }>
                        <TextField fullWidth label="City" value={ address.city }
                          onChange={ (e) => setAddress({ ...address, city: e.target.value }) } />
                      </Grid>
                      <Grid size={ { xs: 12, sm: 4 } }>
                        <TextField fullWidth label="State" value={ address.state }
                          onChange={ (e) => setAddress({ ...address, state: e.target.value }) } />
                      </Grid>
                      <Grid size={ { xs: 12, sm: 4 } }>
                        <TextField fullWidth label="PIN Code" value={ address.pincode }
                          onChange={ (e) => setAddress({ ...address, pincode: e.target.value }) } />
                      </Grid>
                    </Grid>
                  </Box>
                ) }

                { activeStep === 1 && (
                  <Box>
                    <Typography variant="h6" fontWeight={ 700 } sx={ { mb: 3 } }>Schedule Service</Typography>
                    <Grid container spacing={ 2 }>
                      <Grid size={ { xs: 12, sm: 6 } }>
                        <TextField fullWidth type="date" label="Preferred Date" value={ schedule.date }
                          onChange={ (e) => setSchedule({ ...schedule, date: e.target.value }) }
                          InputLabelProps={ { shrink: true } } />
                      </Grid>
                      <Grid size={ { xs: 12, sm: 6 } }>
                        <TextField fullWidth type="time" label="Preferred Time" value={ schedule.time }
                          onChange={ (e) => setSchedule({ ...schedule, time: e.target.value }) }
                          InputLabelProps={ { shrink: true } } />
                      </Grid>
                    </Grid>
                  </Box>
                ) }

                { activeStep === 2 && (
                  <Box>
                    <Typography variant="h6" fontWeight={ 700 } sx={ { mb: 3 } }>
                      <Payment sx={ { mr: 1, verticalAlign: 'middle' } } />
                      Order Summary
                    </Typography>
                    { items.map((item) => (
                      <Box key={ item.id } sx={ { display: 'flex', justifyContent: 'space-between', mb: 1 } }>
                        <Typography variant="body2">{ item.name } × { item.quantity }</Typography>
                        <Typography variant="body2" fontWeight={ 600 }>₹{ (item.price * item.quantity).toLocaleString() }</Typography>
                      </Box>
                    )) }
                    <Divider sx={ { my: 2 } } />

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
                            sx={ { bgcolor: '#03288C', borderRadius: 2, px: 3, minWidth: 80, '&:hover': { bgcolor: '#021A66' } } }
                          >
                            { couponLoading ? <CircularProgress size={ 20 } color="inherit" /> : 'Apply' }
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
                      <Typography variant="body2" color="text.secondary">Platform Fee (1.02%)</Typography>
                      <Typography variant="body2" fontWeight={ 600 }>₹{ adjustedPlatformFee.toFixed(2) }</Typography>
                    </Box>
                    <Divider sx={ { my: 2 } } />
                    <Box sx={ { display: 'flex', justifyContent: 'space-between' } }>
                      <Typography variant="h6" fontWeight={ 800 }>Total</Typography>
                      <Typography variant="h6" fontWeight={ 800 } sx={ { color: '#03288C' } }>₹{ adjustedTotal.toFixed(2) }</Typography>
                    </Box>

                    <Alert severity="info" sx={ { mt: 3, borderRadius: 2 } } icon={ <QrCode2 /> }>
                      You'll pay via UPI QR code in the next step. Scan with any UPI app (Google Pay, PhonePe, Paytm, etc.)
                    </Alert>

                    { error && (
                      <Alert severity="error" sx={ { mt: 2, borderRadius: 2 } }>{ error }</Alert>
                    ) }
                  </Box>
                ) }
              </CardContent>
            </Card>
          ) }

          {/* Step 3: UPI QR Payment */ }
          <AnimatePresence>
            { activeStep === 3 && paymentData && (
              <motion.div
                initial={ { opacity: 0, y: 30 } }
                animate={ { opacity: 1, y: 0 } }
                transition={ { duration: 0.5 } }
              >
                <Card sx={ { borderRadius: 4, mb: 3, border: '2px solid #03288C' } }>
                  <CardContent sx={ { p: { xs: 3, md: 4 } } }>
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
                <Button variant="contained" onClick={ () => setActiveStep(activeStep + 1) }
                  sx={ { bgcolor: '#03288C', borderRadius: '6px', px: 4, '&:hover': { bgcolor: '#021A66' } } }>
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={ handleProceedToPayment }
                  disabled={ placing || paymentLoading }
                  startIcon={ (placing || paymentLoading) ? <CircularProgress size={ 20 } color="inherit" /> : <QrCode2 /> }
                  sx={ { bgcolor: '#03288C', borderRadius: '6px', px: 4, '&:hover': { bgcolor: '#03288C' } } }
                >
                  { placing ? 'Creating Order...' : paymentLoading ? 'Generating QR...' : 'Proceed to Pay' }
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
