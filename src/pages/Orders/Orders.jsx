import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  ShoppingBag,
  AccessTime,
  CheckCircle,
  Payment,
  Print,
  Close,
  Receipt,
  LocalOffer,
  CreditCard,
  Cancel,
  HourglassTop,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import OffersSection from '../Home/OffersSection';

const statusColors = {
  pending: { bg: '#fef3c7', text: '#d97706', icon: <HourglassTop sx={ { fontSize: 15 } } /> },
  confirmed: { bg: '#e0f2fe', text: '#0284c7', icon: <CheckCircle sx={ { fontSize: 15 } } /> },
  'in-progress': { bg: '#dbeafe', text: '#2563eb', icon: <HourglassTop sx={ { fontSize: 15 } } /> },
  completed: { bg: '#dcfce7', text: '#16a34a', icon: <CheckCircle sx={ { fontSize: 15 } } /> },
  cancelled: { bg: '#fee2e2', text: '#dc2626', icon: <Cancel sx={ { fontSize: 15 } } /> },
};

const paymentStatusColors = {
  pending: { bg: '#fef3c7', text: '#d97706' },
  completed: { bg: '#dcfce7', text: '#16a34a' },
  failed: { bg: '#fee2e2', text: '#dc2626' },
};

const defaultStatusColor = { bg: '#f3f4f6', text: '#6b7280' };

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const receiptRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/orders');
        const normalized = data.orders.map((o) => ({
          id: o.id?.substring(0, 16) || o.id,
          fullId: o.id,
          service: o.items?.map((i) => i.service_name).join(', ') || 'Service',
          items: o.items || [],
          provider: 'Assigned Provider',
          status: o.status,
          subtotal: o.subtotal,
          discount_amount: o.discount_amount || 0,
          coupon_code: o.coupon_code || null,
          platformFee: o.platform_fee,
          total: o.total,
          date: o.scheduled_date || o.created_at?.split('T')[0] || '',
          time: o.scheduled_time || '',
          created_at: o.created_at,
          address: o.address || {},
        }));
        setOrders(normalized);

        // Fetch payment info for each order
        const paymentPromises = normalized.map(async (o) => {
          try {
            const { data: pData } = await api.get(`/api/payments/${o.fullId}`);
            return { orderId: o.fullId, payment: pData.payment };
          } catch {
            return { orderId: o.fullId, payment: null };
          }
        });
        const payments = await Promise.all(paymentPromises);
        const paymentMap = {};
        for (const p of payments) {
          paymentMap[p.orderId] = p.payment;
        }
        setOrders((prev) => prev.map((o) => ({ ...o, payment: paymentMap[o.fullId] || null })));
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handlePrintReceipt = useCallback(async (orderId) => {
    setReceiptLoading(true);
    try {
      const { data } = await api.get(`/api/payments/receipt/${orderId}`);
      setReceiptData(data.receipt);
      setReceiptOpen(true);
    } catch {
      // Could not load receipt
    } finally {
      setReceiptLoading(false);
    }
  }, []);

  const printReceipt = useCallback(() => {
    if (!receiptRef.current) return;
    const printWindow = window.open('', '_blank', 'width=420,height=700');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - GFuture</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Poppins', sans-serif; background: #fff; color: #1a1a2e; padding: 0; }
          .receipt { width: 380px; margin: 0 auto; padding: 24px 20px; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>${receiptRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    } catch { return dateStr; }
  };

  return (
    <Box sx={ { py: 4, minHeight: '80vh' } }>
      <Container maxWidth="md">
        <motion.div initial={ { opacity: 0, y: 20 } } animate={ { opacity: 1, y: 0 } }>
          <Typography
            variant="h3"
            fontWeight={ 800 }
            sx={ { mb: 1, fontSize: { xs: '1.8rem', md: '2.4rem' } } }
          >
            My Orders
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
            Track and manage your service bookings
          </Typography>
        </motion.div>

        { loading ? (
          <Box sx={ { textAlign: 'center', py: 10 } }>
            <CircularProgress sx={ { color: '#03288C' } } />
            <Typography variant="body1" color="text.secondary" sx={ { mt: 2 } }>
              Loading orders...
            </Typography>
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={ { textAlign: 'center', py: 10 } }>
            <ShoppingBag sx={ { fontSize: 80, color: '#d0d5dd', mb: 2 } } />
            <Typography variant="h5" fontWeight={ 700 } sx={ { mb: 1 } }>
              No orders yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={ { mb: 2 } }>
              Explore our services and book your first one!
            </Typography>
            <Button variant="contained" onClick={ () => navigate('/services') }
              sx={ { bgcolor: '#03288C', borderRadius: '6px', mt: 2 } }>
              Browse Services
            </Button>
          </Box>
        ) : (
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2.5 } }>
            { orders.map((order, index) => {
              const sc = statusColors[order.status] || defaultStatusColor;
              const pc = order.payment ? (paymentStatusColors[order.payment.status] || defaultStatusColor) : null;
              return (
                <motion.div
                  key={ order.fullId }
                  initial={ { opacity: 0, y: 20 } }
                  animate={ { opacity: 1, y: 0 } }
                  transition={ { delay: index * 0.08 } }
                >
                  <Card
                    sx={ {
                      borderRadius: 4,
                      border: '1px solid rgba(15,43,102,0.06)',
                      '&:hover': { boxShadow: '0 8px 30px rgba(15,43,102,0.1)', transform: 'translateY(-1px)' },
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                    } }
                  >
                    {/* Color bar */ }
                    <Box sx={ { height: 4, bgcolor: sc.text } } />

                    <CardContent sx={ { p: { xs: 2.5, md: 3 } } }>
                      {/* Top row: Service name + chips */ }
                      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 } }>
                        <Box sx={ { flex: 1, minWidth: 0 } }>
                          <Typography variant="subtitle1" fontWeight={ 700 } noWrap>{ order.service }</Typography>
                          <Typography variant="caption" color="text.secondary" sx={ { fontFamily: 'monospace' } }>
                            #{ order.id }
                          </Typography>
                        </Box>
                        <Box sx={ { display: 'flex', gap: 1, flexWrap: 'wrap' } }>
                          <Chip
                            icon={ sc.icon }
                            label={ order.status.replace('-', ' ') }
                            size="small"
                            sx={ { bgcolor: sc.bg, color: sc.text, fontWeight: 700, textTransform: 'capitalize', '& .MuiChip-icon': { color: sc.text } } }
                          />
                          { pc && (
                            <Chip
                              icon={ <Payment sx={ { fontSize: 14 } } /> }
                              label={ order.payment.status === 'completed' ? 'Paid' : order.payment.status }
                              size="small"
                              sx={ { bgcolor: pc.bg, color: pc.text, fontWeight: 700, textTransform: 'capitalize', '& .MuiChip-icon': { color: pc.text } } }
                            />
                          ) }
                        </Box>
                      </Box>

                      {/* Schedule + Payment info */ }
                      <Box sx={ { display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 1.5 } }>
                        <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
                          <AccessTime sx={ { fontSize: 15, color: '#5a6a80' } } />
                          <Typography variant="caption" color="text.secondary">
                            { order.date }{ order.time ? ` at ${order.time}` : '' }
                          </Typography>
                        </Box>
                        { order.payment?.method && (
                          <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
                            <CreditCard sx={ { fontSize: 15, color: '#5a6a80' } } />
                            <Typography variant="caption" color="text.secondary">{ order.payment.method.toUpperCase() }</Typography>
                          </Box>
                        ) }
                        { order.payment?.paid_at && (
                          <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
                            <CheckCircle sx={ { fontSize: 14, color: '#16a34a' } } />
                            <Typography variant="caption" color="#16a34a" fontWeight={ 600 }>
                              Paid { formatDateTime(order.payment.paid_at) }
                            </Typography>
                          </Box>
                        ) }
                      </Box>

                      <Divider sx={ { my: 1.5 } } />

                      {/* Price breakdown row */ }
                      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 } }>
                        <Box sx={ { display: 'flex', gap: 2, flexWrap: 'wrap' } }>
                          <Typography variant="caption" color="text.secondary">
                            Subtotal: <b>₹{ order.subtotal?.toLocaleString() || '0' }</b>
                          </Typography>
                          { order.discount_amount > 0 && (
                            <Typography variant="caption" color="#10b981" fontWeight={ 600 }>
                              <LocalOffer sx={ { fontSize: 12, verticalAlign: 'middle', mr: 0.3 } } />
                              −₹{ order.discount_amount.toFixed(2) }
                            </Typography>
                          ) }
                          <Typography variant="caption" color="text.secondary">
                            Fee: <b>₹{ order.platformFee?.toFixed(2) || '0' }</b>
                          </Typography>
                        </Box>
                        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
                          <Typography variant="subtitle1" fontWeight={ 800 } sx={ { color: '#03288C' } }>
                            ₹{ order.total?.toFixed(2) || '0' }
                          </Typography>
                          { order.payment?.status === 'completed' && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={ receiptLoading ? <CircularProgress size={ 14 } /> : <Print sx={ { fontSize: 16 } } /> }
                              onClick={ () => handlePrintReceipt(order.fullId) }
                              disabled={ receiptLoading }
                              sx={ {
                                fontSize: '0.7rem',
                                borderColor: '#03288C',
                                color: '#03288C',
                                borderRadius: 2,
                                py: 0.3,
                                px: 1.5,
                                minWidth: 'auto',
                                '&:hover': { bgcolor: '#eaf1fb' },
                              } }
                            >
                              Receipt
                            </Button>
                          ) }
                        </Box>
                      </Box>

                      {/* Ordered at timestamp */ }
                      { order.created_at && (
                        <Typography variant="caption" color="text.disabled" sx={ { display: 'block', mt: 1 } }>
                          Ordered: { formatDateTime(order.created_at) }
                        </Typography>
                      ) }
                    </CardContent>
                  </Card>
                </motion.div>
              );
            }) }
          </Box>
        ) }

        {/* ── Receipt Dialog ── */ }
        <Dialog
          open={ receiptOpen }
          onClose={ () => setReceiptOpen(false) }
          maxWidth="xs"
          fullWidth
          PaperProps={ { sx: { borderRadius: 4, overflow: 'hidden' } } }
        >
          <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2 } }>
            <Typography variant="h6" fontWeight={ 700 } sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
              <Receipt sx={ { color: '#03288C' } } /> Receipt
            </Typography>
            <Box sx={ { display: 'flex', gap: 1 } }>
              <Button size="small" startIcon={ <Print /> } onClick={ printReceipt } sx={ { color: '#03288C', fontWeight: 700 } }>Print</Button>
              <IconButton size="small" onClick={ () => setReceiptOpen(false) }><Close /></IconButton>
            </Box>
          </Box>
          <DialogContent sx={ { p: 0 } }>
            { receiptData && (
              <Box ref={ receiptRef }>
                <div className="receipt" style={ { width: 380, margin: '0 auto', padding: '24px 20px', fontFamily: "'Poppins', sans-serif" } }>
                  {/* Header */ }
                  <div style={ { textAlign: 'center', paddingBottom: 16, borderBottom: '3px solid #03288C', marginBottom: 16 } }>
                    <h1 style={ { fontSize: 28, fontWeight: 800, color: '#03288C', letterSpacing: -0.5, margin: 0 } }>GFuture</h1>
                    <p style={ { fontSize: 11, color: '#666', marginTop: 4 } }>Service Booking Receipt</p>
                    <span style={ {
                      display: 'inline-block', padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, margin: '8px 0',
                      background: receiptData.payment?.status === 'completed' ? '#dcfce7' : '#fef3c7',
                      color: receiptData.payment?.status === 'completed' ? '#16a34a' : '#d97706',
                    } }>
                      { receiptData.payment?.status === 'completed' ? '✓ PAID' : '⏳ PENDING' }
                    </span>
                  </div>

                  {/* Customer Details */ }
                  <div style={ { marginBottom: 14 } }>
                    <div style={ { fontSize: 10, fontWeight: 700, color: '#03288C', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, paddingBottom: 4, borderBottom: '1px dashed #e2e8f0' } }>Customer Details</div>
                    <div style={ { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 } }><span style={ { color: '#666' } }>Name</span><span style={ { fontWeight: 600 } }>{ receiptData.customer?.name || '-' }</span></div>
                    <div style={ { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 } }><span style={ { color: '#666' } }>Phone</span><span style={ { fontWeight: 600 } }>{ receiptData.customer?.phone || '-' }</span></div>
                    { receiptData.customer?.email && (
                      <div style={ { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 } }><span style={ { color: '#666' } }>Email</span><span style={ { fontWeight: 600 } }>{ receiptData.customer.email }</span></div>
                    ) }
                  </div>

                  {/* Order Details */ }
                  <div style={ { marginBottom: 14 } }>
                    <div style={ { fontSize: 10, fontWeight: 700, color: '#03288C', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, paddingBottom: 4, borderBottom: '1px dashed #e2e8f0' } }>Order Details</div>
                    <div style={ { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 } }><span style={ { color: '#666' } }>Order ID</span><span style={ { fontWeight: 600, fontFamily: 'monospace', fontSize: 10 } }>{ receiptData.order?.id?.substring(0, 18) }</span></div>
                    <div style={ { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 } }><span style={ { color: '#666' } }>Date</span><span style={ { fontWeight: 600 } }>{ formatDateTime(receiptData.order?.created_at) }</span></div>
                    { receiptData.order?.scheduled_date && (
                      <div style={ { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 } }><span style={ { color: '#666' } }>Scheduled</span><span style={ { fontWeight: 600 } }>{ receiptData.order.scheduled_date }{ receiptData.order.scheduled_time ? ` at ${receiptData.order.scheduled_time}` : '' }</span></div>
                    ) }
                  </div>

                  {/* Items */ }
                  <div style={ { marginBottom: 14 } }>
                    <div style={ { fontSize: 10, fontWeight: 700, color: '#03288C', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, paddingBottom: 4, borderBottom: '1px dashed #e2e8f0' } }>Services</div>
                    { receiptData.items?.map((item, idx) => (
                      <div key={ idx } style={ { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, borderBottom: '1px dotted #f1f5f9' } }>
                        <span style={ { flex: 1 } }>{ item.service_name }</span>
                        <span style={ { width: 50, textAlign: 'center', color: '#888' } }>×{ item.quantity }</span>
                        <span style={ { width: 80, textAlign: 'right', fontWeight: 600 } }>₹{ (item.price * item.quantity).toFixed(2) }</span>
                      </div>
                    )) }
                  </div>

                  {/* Bill */ }
                  <hr style={ { border: 'none', borderTop: '1px dashed #d0d5dd', margin: '12px 0' } } />
                  <div style={ { marginBottom: 14 } }>
                    <div style={ { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 } }><span style={ { color: '#666' } }>Subtotal</span><span style={ { fontWeight: 600 } }>₹{ receiptData.order?.subtotal?.toFixed(2) }</span></div>
                    { receiptData.order?.discount_amount > 0 && (
                      <div style={ { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 } }><span style={ { color: '#10b981' } }>Discount{ receiptData.order.coupon_code ? ` (${receiptData.order.coupon_code})` : '' }</span><span style={ { fontWeight: 700, color: '#10b981' } }>−₹{ receiptData.order.discount_amount.toFixed(2) }</span></div>
                    ) }
                    <div style={ { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 } }><span style={ { color: '#666' } }>GST Charges</span><span style={ { fontWeight: 600 } }>₹{ receiptData.order?.platform_fee?.toFixed(2) }</span></div>
                    <hr style={ { border: 'none', borderTop: '1px dashed #d0d5dd', margin: '12px 0' } } />
                    <div style={ { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 16, fontWeight: 800 } }><span>Total</span><span style={ { color: '#03288C' } }>₹{ receiptData.order?.total?.toFixed(2) }</span></div>
                  </div>

                  {/* Payment Details */ }
                  { receiptData.payment && (
                    <div style={ { marginBottom: 14 } }>
                      <div style={ { fontSize: 10, fontWeight: 700, color: '#03288C', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, paddingBottom: 4, borderBottom: '1px dashed #e2e8f0' } }>Payment Details</div>
                      <div style={ { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 } }><span style={ { color: '#666' } }>Method</span><span style={ { fontWeight: 600 } }>{ receiptData.payment.method?.toUpperCase() }</span></div>
                      { receiptData.payment.transaction_ref && (
                        <div style={ { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 } }><span style={ { color: '#666' } }>Txn Ref</span><span style={ { fontWeight: 600, fontFamily: 'monospace', fontSize: 10 } }>{ receiptData.payment.transaction_ref.substring(0, 22) }</span></div>
                      ) }
                      { receiptData.payment.paid_at && (
                        <div style={ { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 } }><span style={ { color: '#666' } }>Paid At</span><span style={ { fontWeight: 600 } }>{ formatDateTime(receiptData.payment.paid_at) }</span></div>
                      ) }
                    </div>
                  ) }

                  {/* Footer */ }
                  <div style={ { textAlign: 'center', marginTop: 20, paddingTop: 14, borderTop: '2px solid #03288C' } }>
                    <p style={ { fontSize: 14, fontWeight: 700, color: '#03288C', marginBottom: 6 } }>Thank you for choosing GFuture!</p>
                    <p style={ { fontSize: 10, color: '#888', lineHeight: 1.6 } }>
                      This is a computer-generated receipt.<br />
                      For support, contact us at support@gfuture.in
                    </p>
                  </div>
                </div>
              </Box>
            ) }
          </DialogContent>
        </Dialog>
      </Container>

      {/* Exclusive offers for signed-in users */ }
      <OffersSection />
    </Box>
  );
};

export default Orders;