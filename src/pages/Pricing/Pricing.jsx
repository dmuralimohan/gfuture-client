import { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Chip, Divider, CircularProgress, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle, Star, SwapHoriz } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const ensureRazorpayLoaded = async () => {
  if (window.Razorpay) return true;

  const scriptExists = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
  if (scriptExists) {
    await new Promise((resolve) => {
      scriptExists.addEventListener('load', resolve, { once: true });
      scriptExists.addEventListener('error', resolve, { once: true });
    });
    return Boolean(window.Razorpay);
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;

  const loaded = await new Promise((resolve) => {
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return loaded && Boolean(window.Razorpay);
};

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [recommended, setRecommended] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, plan: null });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.cachedGet('/api/plans');
        setPlans(data.plans || []);

        if (isAuthenticated) {
          const [myPlanRes, recRes] = await Promise.allSettled([
            api.get('/api/plans/my'),
            api.get('/api/plans/recommend'),
          ]);
          if (myPlanRes.status === 'fulfilled') setCurrentPlan(myPlanRes.value.data.plan);
          if (recRes.status === 'fulfilled') setRecommended(recRes.value.data.plan);
        }
      } catch (err) {
        console.error('Failed to fetch plans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || loading) return;

    const selectedPlanId = Number(searchParams.get('plan'));
    if (!selectedPlanId || !plans.length) return;

    const selectedPlan = plans.find((p) => Number(p.id) === selectedPlanId);
    if (!selectedPlan || currentPlan?.id === selectedPlan.id) {
      searchParams.delete('plan');
      setSearchParams(searchParams, { replace: true });
      return;
    }

    setConfirmDialog({ open: true, plan: selectedPlan });
    searchParams.delete('plan');
    setSearchParams(searchParams, { replace: true });
  }, [isAuthenticated, loading, plans, currentPlan, searchParams, setSearchParams]);

  const handleSelect = (plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (currentPlan?.id === plan.id) return;
    setConfirmDialog({ open: true, plan });
  };

  const handleSubscribe = async () => {
    const plan = confirmDialog.plan;
    setConfirmDialog({ open: false, plan: null });
    setSubscribing(true);

    try {
      const price = Number(plan?.price || 0);
      if (price <= 0) {
        await api.post('/api/plans/subscribe', { plan_id: plan.id });
        setCurrentPlan(plan);
        setSnackbar({ open: true, message: `Successfully subscribed to ${plan.name}!`, severity: 'success' });
        return;
      }

      const { data: initData } = await api.post('/api/plans/subscribe/initiate', { plan_id: plan.id });
      if (!initData?.requiresPayment || !initData?.payment?.id || !initData?.payment?.razorpayOrderId) {
        throw new Error('Failed to initialize payment');
      }

      if (!initData?.payment?.razorpayKeyId) {
        throw new Error('Razorpay key is not configured on server. Please contact support.');
      }

      const isLoaded = await ensureRazorpayLoaded();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      const paymentResponse = await new Promise((resolve, reject) => {
        const rz = new window.Razorpay({
          key: initData.payment.razorpayKeyId,
          amount: Math.round(Number(initData.payment.amount || 0) * 100),
          currency: 'INR',
          name: 'GFuture',
          description: `${plan.name} Membership`,
          order_id: initData.payment.razorpayOrderId,
          prefill: {
            name: initData.payment.customerName || user?.name || '',
            email: initData.payment.customerEmail || user?.email || '',
            contact: initData.payment.customerPhone || user?.phone || '',
          },
          notes: {
            membership_plan_id: String(plan.id),
          },
          theme: {
            color: '#03288C',
          },
          handler: resolve,
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled by user')),
          },
        });

        rz.on('payment.failed', (resp) => {
          reject(new Error(resp?.error?.description || 'Payment failed'));
        });

        rz.open();
      });

      const { data: verifyData } = await api.post('/api/plans/subscribe/verify', {
        paymentId: initData.payment.id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      setCurrentPlan(verifyData?.subscription || plan);
      setSnackbar({ open: true, message: `Successfully subscribed to ${plan.name}!`, severity: 'success' });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || err?.message || 'Subscription failed',
        severity: 'error',
      });
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={ { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' } }>
        <CircularProgress sx={ { color: '#03288C' } } />
      </Box>
    );
  }

  return (
    <Box sx={ { py: 8, minHeight: '80vh' } }>
      <Container maxWidth="lg">
        <motion.div
          initial={ { opacity: 0, y: 20 } }
          whileInView={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5 } }
          viewport={ { once: true } }
        >
          <Typography variant="h2" sx={ { textAlign: 'center', fontWeight: 800, mb: 1.5, fontSize: { xs: '2rem', md: '3rem' } } }>
            MEMBERSHIP TIERS
          </Typography>
          <Typography variant="body1" sx={ { textAlign: 'center', fontStyle: 'italic', color: '#5a6a80', mb: 2, maxWidth: 600, mx: 'auto' } }>
            Choose your activation level and participate in shared community prosperity.
          </Typography>

          { currentPlan && (
            <Box sx={ { textAlign: 'center', mb: 4 } }>
              <Chip
                icon={ <Star sx={ { color: '#fff !important' } } /> }
                label={ `Current Plan: ${currentPlan.name}` }
                sx={ { bgcolor: '#03288C', color: '#fff', fontWeight: 700, fontSize: '0.85rem', py: 2.5, px: 1 } }
              />
            </Box>
          ) }

          { !currentPlan && recommended && isAuthenticated && (
            <Box sx={ { textAlign: 'center', mb: 4 } }>
              <Alert
                icon={ <Star /> }
                severity="info"
                sx={ { display: 'inline-flex', borderRadius: 2, fontWeight: 600 } }
              >
                We recommend the <strong style={ { margin: '0 4px' } }>{ recommended.name }</strong> plan for you!
              </Alert>
            </Box>
          ) }
        </motion.div>

        <Box sx={ { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: `repeat(${Math.min(plans.length, 4)}, 1fr)` }, gap: 3, mb: 8, alignItems: 'stretch' } }>
          { plans.map((plan, index) => {
            const isCurrent = currentPlan?.id === plan.id;
            const isRecommended = plan.recommended;
            const features = Array.isArray(plan.features) ? plan.features : [];

            return (
              <motion.div
                key={ plan.id }
                initial={ { opacity: 0, y: 40 } }
                whileInView={ { opacity: 1, y: 0 } }
                transition={ { duration: 0.5, delay: index * 0.1 } }
                viewport={ { once: true } }
                style={ { height: '100%' } }
              >
                <Card
                  sx={ {
                    borderRadius: 2,
                    position: 'relative',
                    border: isCurrent
                      ? '2px solid #10b981'
                      : isRecommended
                        ? '2px solid #03288C'
                        : '1px solid rgba(15,43,102,0.1)',
                    overflow: 'visible',
                    height: '100%',
                    minHeight: 500,
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: isRecommended ? 2 : 1,
                    boxShadow: isCurrent
                      ? '0 12px 40px rgba(16,185,129,0.18)'
                      : isRecommended
                        ? '0 12px 40px rgba(15,43,102,0.18)'
                        : '0 4px 20px rgba(15,43,102,0.08)',
                    '&:hover': {
                      boxShadow: isRecommended
                        ? '0 20px 60px rgba(15,43,102,0.28)'
                        : '0 12px 40px rgba(15,43,102,0.14)',
                      transform: 'translateY(-6px)',
                    },
                    transition: 'all 0.3s ease',
                  } }
                >
                  { isCurrent && (
                    <Chip
                      label="YOUR CURRENT PLAN"
                      size="small"
                      sx={ {
                        position: 'absolute',
                        top: -14,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: '#10b981',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.6rem',
                        letterSpacing: '0.08em',
                      } }
                    />
                  ) }
                  { !isCurrent && Boolean(isRecommended) && (
                    <Chip
                      label="HIGHLY RECOMMENDED"
                      size="small"
                      sx={ {
                        position: 'absolute',
                        top: -14,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: '#03288C',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.6rem',
                        letterSpacing: '0.08em',
                      } }
                    />
                  ) }
                  <CardContent sx={ { p: 4, display: 'flex', flexDirection: 'column', height: '100%', flex: 1 } }>
                    <Typography variant="overline" sx={ { fontWeight: 700, letterSpacing: '0.12em', color: '#5a6a80', mb: 2 } }>
                      { plan.name }
                    </Typography>
                    <Typography variant="h3" sx={ { fontWeight: 800, mb: 0.5, fontSize: { xs: '2.2rem', md: '2.8rem' } } }>
                      ₹{ Number(plan.price).toLocaleString() }
                    </Typography>
                    { plan.description && (
                      <Typography variant="caption" color="text.secondary" sx={ { mb: 3, display: 'block' } }>
                        { plan.description }
                      </Typography>
                    ) }

                    <Chip
                      label={ plan.target === 'both' ? 'Customer & Provider' : plan.target }
                      size="small"
                      variant="outlined"
                      sx={ { alignSelf: 'flex-start', mb: 2, fontSize: 11, textTransform: 'capitalize' } }
                    />

                    <Box sx={ { flex: 1, my: 2 } }>
                      { features.map((feature) => (
                        <Box key={ feature } sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 } }>
                          <CheckCircle sx={ { fontSize: 18, color: '#03288C' } } />
                          <Typography variant="body2">{ feature }</Typography>
                        </Box>
                      )) }
                    </Box>

                    <Button
                      fullWidth
                      variant={ isCurrent ? 'outlined' : isRecommended ? 'contained' : 'outlined' }
                      disabled={ isCurrent || subscribing }
                      onClick={ () => handleSelect(plan) }
                      startIcon={ currentPlan && !isCurrent ? <SwapHoriz /> : null }
                      sx={ {
                        mt: 'auto',
                        borderRadius: '6px',
                        py: 1.2,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        ...(isCurrent
                          ? { borderColor: '#10b981', color: '#10b981' }
                          : isRecommended
                            ? { bgcolor: '#03288C', '&:hover': { bgcolor: '#021A66' } }
                            : { borderColor: '#03288C', color: '#03288C', '&:hover': { borderColor: '#03288C', color: '#03288C' } }),
                      } }
                    >
                      { isCurrent ? 'Current Plan' : currentPlan ? 'Switch Plan' : (plan.cta || 'Choose Plan') }
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          }) }
        </Box>
      </Container>

      {/* Confirmation Dialog */ }
      <Dialog
        open={ confirmDialog.open }
        onClose={ () => setConfirmDialog({ open: false, plan: null }) }
        PaperProps={ { sx: { borderRadius: 3 } } }
      >
        <DialogTitle sx={ { fontWeight: 700 } }>
          { currentPlan ? 'Switch Plan' : 'Subscribe to Plan' }
        </DialogTitle>
        <DialogContent>
          <Typography>
            { currentPlan
              ? <>You are switching from <strong>{ currentPlan.name }</strong> to <strong>{ confirmDialog.plan?.name }</strong> (₹{ Number(confirmDialog.plan?.price || 0).toLocaleString() }).</>
              : <>Subscribe to <strong>{ confirmDialog.plan?.name }</strong> for ₹{ Number(confirmDialog.plan?.price || 0).toLocaleString() }?</> }
          </Typography>
        </DialogContent>
        <DialogActions sx={ { p: 2.5 } }>
          <Button onClick={ () => setConfirmDialog({ open: false, plan: null }) }>Cancel</Button>
          <Button variant="contained" onClick={ handleSubscribe } sx={ { bgcolor: '#03288C', '&:hover': { bgcolor: '#021A66' } } }>
            { Number(confirmDialog.plan?.price || 0) > 0 ? 'Pay & Subscribe' : (currentPlan ? 'Switch' : 'Subscribe') }
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={ snackbar.open }
        autoHideDuration={ 4000 }
        onClose={ () => setSnackbar({ ...snackbar, open: false }) }
        anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
      >
        <Alert severity={ snackbar.severity } onClose={ () => setSnackbar({ ...snackbar, open: false }) } sx={ { borderRadius: 2 } }>
          { snackbar.message }
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Pricing;
