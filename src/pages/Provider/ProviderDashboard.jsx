import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Tab,
  Tabs,
  Avatar,
  Button,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Assignment,
  TrendingUp,
  Star,
  CurrencyRupee,
  Add,
  Edit,
  Delete,
  Build,
  Close,
  AccessTime,
  Shield,
  Category,
  LocalOffer,
  ContentCopy,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const statusColors = {
  pending: '#f59e0b',
  'in-progress': '#3b82f6',
  completed: '#22c55e',
  cancelled: '#ef4444',
};

const emptyService = {
  name: '',
  category_id: '',
  price: '',
  description: '',
  duration: '',
  warranty: '',
  image: '',
  includes: [''],
};

const emptyOffer = {
  title: '',
  description: '',
  discount_percent: '',
  discount_flat: '',
  code: '',
  image: '',
  badge: '',
  valid_from: '',
  valid_until: '',
  sort_order: 0,
};

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState(0);

  // Orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Services
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [categories, setCategories] = useState([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState(emptyService);
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingService, setDeletingService] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Offers
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState(emptyOffer);
  const [savingOffer, setSavingOffer] = useState(false);
  const [deleteOfferDialog, setDeleteOfferDialog] = useState({ open: false, offer: null });
  const [copiedCode, setCopiedCode] = useState(null);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch orders
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider') return;
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/orders');
        const normalized = data.orders.map((o) => ({
          id: o.id?.substring(0, 8),
          fullId: o.id,
          customer: o.customer_id?.substring(0, 8) || 'Customer',
          service: o.items?.map((i) => i.service_name).join(', ') || 'Service',
          status: o.status,
          amount: o.subtotal,
          date: o.scheduled_date || o.created_at?.split('T')[0] || '',
        }));
        setOrders(normalized);
      } catch {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, user]);

  // Fetch provider's services
  const fetchServices = useCallback(async () => {
    if (!user?.id) return;
    setLoadingServices(true);
    try {
      const { data } = await api.get(`/api/services?provider_id=${user.id}&limit=100`);
      setServices(data.services || []);
    } catch {
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider') return;
    fetchServices();
  }, [isAuthenticated, user, fetchServices]);

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/api/categories');
        setCategories(data.categories || []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch provider's offers
  const fetchOffers = useCallback(async () => {
    if (!user?.id) return;
    setLoadingOffers(true);
    try {
      const { data } = await api.get('/api/offers/my');
      setOffers(data.offers || []);
    } catch {
      setOffers([]);
    } finally {
      setLoadingOffers(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider') return;
    fetchOffers();
  }, [isAuthenticated, user, fetchOffers]);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'provider') return null;

  // Stats calculations
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const revenue = orders.filter((o) => o.status === 'completed').reduce((acc, o) => acc + (o.amount || 0), 0);
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const stats = [
    { label: 'Total Orders', value: String(totalOrders), icon: <Assignment />, color: '#03288C' },
    { label: 'Revenue', value: `₹${revenue.toLocaleString()}`, icon: <CurrencyRupee />, color: '#22c55e' },
    { label: 'My Services', value: String(services.length), icon: <Build />, color: '#8b5cf6' },
    { label: 'Completion', value: `${completionRate}%`, icon: <TrendingUp />, color: '#f59e0b' },
  ];

  // --- Service form handlers ---
  const openAddDialog = () => {
    setEditingService(null);
    setFormData({ ...emptyService, includes: [''] });
    setDialogOpen(true);
  };

  const openEditDialog = (svc) => {
    setEditingService(svc);
    setFormData({
      name: svc.name || '',
      category_id: svc.category_id || '',
      price: svc.price || '',
      description: svc.description || '',
      duration: svc.duration || '',
      warranty: svc.warranty || '',
      image: svc.image || '',
      includes: Array.isArray(svc.includes) && svc.includes.length > 0 ? svc.includes : [''],
    });
    setDialogOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIncludesChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.includes];
      updated[index] = value;
      return { ...prev, includes: updated };
    });
  };

  const addIncludesItem = () => {
    setFormData((prev) => ({ ...prev, includes: [...prev.includes, ''] }));
  };

  const removeIncludesItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category_id || !formData.price) {
      showSnackbar('Please fill in name, category, and price', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        category_id: Number(formData.category_id),
        includes: formData.includes.filter((i) => i.trim() !== ''),
      };
      if (editingService) {
        await api.put(`/api/services/${editingService.id}`, payload);
        showSnackbar('Service updated successfully');
      } else {
        await api.post('/api/services', payload);
        showSnackbar('Service created successfully');
      }
      setDialogOpen(false);
      fetchServices();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to save service', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (svc) => {
    setDeletingService(svc);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingService) return;
    setDeleting(true);
    try {
      await api.delete(`/api/services/${deletingService.id}`);
      showSnackbar('Service deleted');
      setDeleteDialogOpen(false);
      setDeletingService(null);
      fetchServices();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to delete service', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // --- Offer form handlers ---
  const openAddOfferDialog = () => {
    setEditingOffer(null);
    setOfferForm(emptyOffer);
    setOfferDialogOpen(true);
  };

  const openEditOfferDialog = (offer) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title || '',
      description: offer.description || '',
      discount_percent: offer.discount_percent || '',
      discount_flat: offer.discount_flat || '',
      code: offer.code || '',
      image: offer.image || '',
      badge: offer.badge || '',
      valid_from: offer.valid_from ? offer.valid_from.slice(0, 10) : '',
      valid_until: offer.valid_until ? offer.valid_until.slice(0, 10) : '',
      sort_order: offer.sort_order || 0,
    });
    setOfferDialogOpen(true);
  };

  const handleSaveOffer = async () => {
    if (!offerForm.title || !offerForm.code) {
      showSnackbar('Title and coupon code are required', 'error');
      return;
    }
    setSavingOffer(true);
    try {
      const payload = {
        ...offerForm,
        discount_percent: Number(offerForm.discount_percent) || 0,
        discount_flat: Number(offerForm.discount_flat) || 0,
        sort_order: Number(offerForm.sort_order) || 0,
      };
      if (editingOffer) {
        await api.put(`/api/offers/provider/${editingOffer.id}`, payload);
        showSnackbar('Offer updated successfully');
      } else {
        await api.post('/api/offers/provider', payload);
        showSnackbar('Offer created successfully');
      }
      setOfferDialogOpen(false);
      fetchOffers();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to save offer', 'error');
    } finally {
      setSavingOffer(false);
    }
  };

  const handleDeleteOffer = async () => {
    if (!deleteOfferDialog.offer) return;
    try {
      await api.delete(`/api/offers/provider/${deleteOfferDialog.offer.id}`);
      showSnackbar('Offer deleted');
      setDeleteOfferDialog({ open: false, offer: null });
      fetchOffers();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to delete offer', 'error');
    }
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Box sx={ { py: 4, minHeight: '80vh' } }>
      <Container maxWidth="lg">
        <motion.div initial={ { opacity: 0, y: 20 } } animate={ { opacity: 1, y: 0 } }>
          <Typography variant="h3" fontWeight={ 800 } sx={ { mb: 1, fontSize: { xs: '1.8rem', md: '2.4rem' } } }>
            Provider Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
            Welcome back, { user?.name }! Here's your overview.
          </Typography>
        </motion.div>

        {/* Stats */ }
        <Grid container spacing={ 3 } sx={ { mb: 4 } }>
          { stats.map((stat, index) => (
            <Grid size={ { xs: 6, md: 3 } } key={ stat.label }>
              <motion.div initial={ { opacity: 0, y: 20 } } animate={ { opacity: 1, y: 0 } } transition={ { delay: index * 0.1 } }>
                <Card sx={ { borderRadius: 3, border: '1px solid rgba(15,43,102,0.06)' } }>
                  <CardContent sx={ { p: 2.5, textAlign: 'center' } }>
                    <Avatar sx={ { width: 48, height: 48, bgcolor: `${stat.color}15`, color: stat.color, mx: 'auto', mb: 1.5 } }>
                      { stat.icon }
                    </Avatar>
                    <Typography variant="h5" fontWeight={ 800 }>{ stat.value }</Typography>
                    <Typography variant="caption" color="text.secondary">{ stat.label }</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          )) }
        </Grid>

        {/* Tabs */ }
        <Card sx={ { borderRadius: 4 } }>
          <Tabs value={ tab } onChange={ (_, v) => setTab(v) } sx={ { px: 3, pt: 1 } }>
            <Tab label="Recent Orders" />
            <Tab label="My Services" />
            <Tab label="My Offers" />
          </Tabs>
          <Divider />
          <CardContent sx={ { p: 3 } }>
            {/* ======= TAB 0: Recent Orders ======= */ }
            { tab === 0 && (
              <Box>
                { loadingOrders ? (
                  <Box sx={ { textAlign: 'center', py: 4 } }>
                    <CircularProgress size={ 32 } sx={ { color: '#03288C' } } />
                  </Box>
                ) : orders.length === 0 ? (
                  <Box sx={ { textAlign: 'center', py: 4 } }>
                    <Typography variant="body1" color="text.secondary">
                      No orders yet. Once customers book your services, they'll appear here.
                    </Typography>
                  </Box>
                ) : (
                  orders.map((order, index) => (
                    <motion.div key={ order.id } initial={ { opacity: 0, x: -20 } } animate={ { opacity: 1, x: 0 } } transition={ { delay: index * 0.1 } }>
                      <Box
                        sx={ {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          borderRadius: 2,
                          mb: 1,
                          '&:hover': { bgcolor: '#f8fafc' },
                        } }
                      >
                        <Avatar sx={ { bgcolor: '#eaf1fb', color: '#03288C' } }>{ order.customer[0] }</Avatar>
                        <Box sx={ { flex: 1 } }>
                          <Typography variant="subtitle2" fontWeight={ 700 }>{ order.service }</Typography>
                          <Typography variant="caption" color="text.secondary">{ order.customer } · { order.date }</Typography>
                        </Box>
                        <Chip
                          label={ order.status }
                          size="small"
                          sx={ {
                            bgcolor: `${statusColors[order.status]}15`,
                            color: statusColors[order.status],
                            fontWeight: 700,
                            textTransform: 'capitalize',
                          } }
                        />
                        <Typography variant="subtitle2" fontWeight={ 700 }>₹{ order.amount }</Typography>
                      </Box>
                    </motion.div>
                  ))
                ) }
              </Box>
            ) }

            {/* ======= TAB 1: My Services ======= */ }
            { tab === 1 && (
              <Box>
                {/* Header with Add button */ }
                <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 } }>
                  <Typography variant="h6" fontWeight={ 700 }>
                    Your Services ({ services.length })
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={ <Add /> }
                    onClick={ openAddDialog }
                    sx={ {
                      background: 'linear-gradient(135deg, #03288C 0%, #1a56c4 100%)',
                      borderRadius: 2,
                      px: 3,
                    } }
                  >
                    Add New Service
                  </Button>
                </Box>

                { loadingServices ? (
                  <Box sx={ { textAlign: 'center', py: 4 } }>
                    <CircularProgress size={ 32 } sx={ { color: '#03288C' } } />
                  </Box>
                ) : services.length === 0 ? (
                  <Box sx={ { textAlign: 'center', py: 6 } }>
                    <Build sx={ { fontSize: 56, color: '#c4c4c4', mb: 2 } } />
                    <Typography variant="h6" color="text.secondary" sx={ { mb: 1 } }>
                      No services yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={ { mb: 3 } }>
                      Start by adding your first service so customers can find and book you.
                    </Typography>
                    <Button variant="contained" startIcon={ <Add /> } onClick={ openAddDialog }>
                      Add Your First Service
                    </Button>
                  </Box>
                ) : (
                  <AnimatePresence>
                    { services.map((svc, index) => (
                      <motion.div
                        key={ svc.id }
                        initial={ { opacity: 0, y: 10 } }
                        animate={ { opacity: 1, y: 0 } }
                        exit={ { opacity: 0, x: -50 } }
                        transition={ { delay: index * 0.05 } }
                      >
                        <Card
                          sx={ {
                            mb: 2,
                            borderRadius: 3,
                            border: '1px solid rgba(15,43,102,0.06)',
                            '&:hover': { boxShadow: '0 4px 20px rgba(15,43,102,0.1)', transform: 'none' },
                          } }
                        >
                          <CardContent sx={ { p: 2.5 } }>
                            <Box sx={ { display: 'flex', alignItems: 'flex-start', gap: 2 } }>
                              {/* Service image / icon */ }
                              <Avatar
                                src={ svc.image }
                                sx={ {
                                  width: 64,
                                  height: 64,
                                  borderRadius: 2,
                                  bgcolor: '#eaf1fb',
                                  color: '#03288C',
                                  fontSize: 28,
                                } }
                              >
                                <Build />
                              </Avatar>

                              {/* Service details */ }
                              <Box sx={ { flex: 1, minWidth: 0 } }>
                                <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 } }>
                                  <Typography variant="subtitle1" fontWeight={ 700 } noWrap>
                                    { svc.name }
                                  </Typography>
                                  <Chip
                                    label={ svc.active ? 'Active' : 'Inactive' }
                                    size="small"
                                    sx={ {
                                      bgcolor: svc.active ? '#22c55e15' : '#ef444415',
                                      color: svc.active ? '#22c55e' : '#ef4444',
                                      fontWeight: 700,
                                      fontSize: '0.7rem',
                                    } }
                                  />
                                </Box>

                                <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 2, mb: 0.5 } }>
                                  <Typography variant="body2" color="text.secondary" sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
                                    <Category sx={ { fontSize: 16 } } />
                                    { svc.category_name || `Category #${svc.category_id}` }
                                  </Typography>
                                  { svc.duration && (
                                    <Typography variant="body2" color="text.secondary" sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
                                      <AccessTime sx={ { fontSize: 16 } } />
                                      { svc.duration }
                                    </Typography>
                                  ) }
                                  { svc.warranty && (
                                    <Typography variant="body2" color="text.secondary" sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
                                      <Shield sx={ { fontSize: 16 } } />
                                      { svc.warranty }
                                    </Typography>
                                  ) }
                                  { svc.rating > 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
                                      <Star sx={ { fontSize: 16, color: '#f59e0b' } } />
                                      { svc.rating } ({ svc.reviews })
                                    </Typography>
                                  ) }
                                </Box>

                                { svc.description && (
                                  <Typography variant="caption" color="text.secondary" sx={ { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }>
                                    { svc.description }
                                  </Typography>
                                ) }
                              </Box>

                              {/* Price & actions */ }
                              <Box sx={ { textAlign: 'right', flexShrink: 0 } }>
                                <Typography variant="h6" fontWeight={ 800 } color="primary" sx={ { mb: 1 } }>
                                  ₹{ svc.price }
                                </Typography>
                                <Box sx={ { display: 'flex', gap: 0.5 } }>
                                  <Tooltip title="Edit">
                                    <IconButton size="small" onClick={ () => openEditDialog(svc) } sx={ { color: '#03288C' } }>
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton size="small" onClick={ () => openDeleteDialog(svc) } sx={ { color: '#ef4444' } }>
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )) }
                  </AnimatePresence>
                ) }
              </Box>
            ) }

            {/* ======= TAB 2: My Offers ======= */ }
            { tab === 2 && (
              <Box>
                <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 } }>
                  <Typography variant="h6" fontWeight={ 700 }>
                    Your Offers ({ offers.length })
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={ <Add /> }
                    onClick={ openAddOfferDialog }
                    sx={ { background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)', borderRadius: 2, px: 3 } }
                  >
                    Create Offer
                  </Button>
                </Box>

                { loadingOffers ? (
                  <Box sx={ { textAlign: 'center', py: 4 } }>
                    <CircularProgress size={ 32 } sx={ { color: '#ec4899' } } />
                  </Box>
                ) : offers.length === 0 ? (
                  <Box sx={ { textAlign: 'center', py: 6 } }>
                    <LocalOffer sx={ { fontSize: 56, color: '#c4c4c4', mb: 2 } } />
                    <Typography variant="h6" color="text.secondary" sx={ { mb: 1 } }>
                      No offers yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={ { mb: 3 } }>
                      Create coupon codes to attract more customers to your services.
                    </Typography>
                    <Button variant="contained" startIcon={ <Add /> } onClick={ openAddOfferDialog }
                      sx={ { background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)' } }
                    >
                      Create Your First Offer
                    </Button>
                  </Box>
                ) : (
                  <AnimatePresence>
                    { offers.map((offer, index) => (
                      <motion.div
                        key={ offer.id }
                        initial={ { opacity: 0, y: 10 } }
                        animate={ { opacity: 1, y: 0 } }
                        exit={ { opacity: 0, x: -50 } }
                        transition={ { delay: index * 0.05 } }
                      >
                        <Card sx={ { mb: 2, borderRadius: 3, border: '1px solid rgba(236,72,153,0.15)', '&:hover': { boxShadow: '0 4px 20px rgba(236,72,153,0.12)' } } }>
                          <CardContent sx={ { p: 2.5 } }>
                            <Box sx={ { display: 'flex', alignItems: 'center', gap: 2 } }>
                              <Avatar sx={ { width: 50, height: 50, bgcolor: '#ec489915', color: '#ec4899', borderRadius: 2 } }>
                                <LocalOffer />
                              </Avatar>
                              <Box sx={ { flex: 1, minWidth: 0 } }>
                                <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 } }>
                                  <Typography variant="subtitle1" fontWeight={ 700 } noWrap>{ offer.title }</Typography>
                                  <Chip
                                    label={ offer.active ? 'Active' : 'Inactive' }
                                    size="small"
                                    sx={ { bgcolor: offer.active ? '#22c55e15' : '#ef444415', color: offer.active ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: '0.7rem' } }
                                  />
                                  { offer.badge && (
                                    <Chip label={ offer.badge } size="small" sx={ { fontWeight: 700, fontSize: '0.65rem', bgcolor: '#ffd700', color: '#0E0E2E' } } />
                                  ) }
                                </Box>
                                <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' } }>
                                  { offer.discount_percent > 0 && (
                                    <Chip label={ `${offer.discount_percent}% OFF` } size="small" sx={ { fontWeight: 700, bgcolor: '#10b98115', color: '#059669' } } />
                                  ) }
                                  { offer.discount_flat > 0 && (
                                    <Chip label={ `₹${offer.discount_flat} OFF` } size="small" sx={ { fontWeight: 700, bgcolor: '#d9770615', color: '#d97706' } } />
                                  ) }
                                  { offer.code && (
                                    <Box
                                      onClick={ () => handleCopyCode(offer.code, offer.id) }
                                      sx={ { display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, bgcolor: '#f0f4ff', borderRadius: 1, border: '1px dashed #03288C50', cursor: 'pointer' } }
                                    >
                                      <Typography variant="caption" fontWeight={ 800 } sx={ { fontFamily: 'monospace', color: '#03288C' } }>{ offer.code }</Typography>
                                      { copiedCode === offer.id ? <CheckCircle sx={ { fontSize: 14, color: '#10b981' } } /> : <ContentCopy sx={ { fontSize: 12, color: '#03288C' } } /> }
                                    </Box>
                                  ) }
                                  { offer.valid_until && (
                                    <Typography variant="caption" color="text.secondary">
                                      Expires { new Date(offer.valid_until).toLocaleDateString() }
                                    </Typography>
                                  ) }
                                </Box>
                              </Box>
                              <Box sx={ { display: 'flex', gap: 0.5, flexShrink: 0 } }>
                                <Tooltip title="Edit">
                                  <IconButton size="small" onClick={ () => openEditOfferDialog(offer) } sx={ { color: '#03288C' } }>
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" onClick={ () => setDeleteOfferDialog({ open: true, offer }) } sx={ { color: '#ef4444' } }>
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )) }
                  </AnimatePresence>
                ) }
              </Box>
            ) }
          </CardContent>
        </Card>
      </Container>

      {/* ======= Add / Edit Service Dialog ======= */ }
      <Dialog open={ dialogOpen } onClose={ () => setDialogOpen(false) } maxWidth="sm" fullWidth PaperProps={ { sx: { borderRadius: 3 } } }>
        <DialogTitle sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 } }>
          { editingService ? 'Edit Service' : 'Add New Service' }
          <IconButton size="small" onClick={ () => setDialogOpen(false) }><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={ { pt: 2.5 } }>
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2.5 } }>
            <TextField
              label="Service Name"
              value={ formData.name }
              onChange={ (e) => handleFormChange('name', e.target.value) }
              fullWidth
              required
              placeholder="e.g. AC Repair & Service"
            />

            <TextField
              label="Category"
              value={ formData.category_id }
              onChange={ (e) => handleFormChange('category_id', e.target.value) }
              select
              fullWidth
              required
            >
              { categories.map((cat) => (
                <MenuItem key={ cat.id } value={ cat.id }>
                  { cat.name }
                </MenuItem>
              )) }
            </TextField>

            <Box sx={ { display: 'flex', gap: 2 } }>
              <TextField
                label="Price (₹)"
                value={ formData.price }
                onChange={ (e) => handleFormChange('price', e.target.value) }
                type="number"
                fullWidth
                required
                InputProps={ { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }
              />
              <TextField
                label="Duration"
                value={ formData.duration }
                onChange={ (e) => handleFormChange('duration', e.target.value) }
                fullWidth
                placeholder="e.g. 60 mins"
              />
            </Box>

            <TextField
              label="Description"
              value={ formData.description }
              onChange={ (e) => handleFormChange('description', e.target.value) }
              fullWidth
              multiline
              rows={ 3 }
              placeholder="Describe what this service includes..."
            />

            <TextField
              label="Warranty"
              value={ formData.warranty }
              onChange={ (e) => handleFormChange('warranty', e.target.value) }
              fullWidth
              placeholder="e.g. 30-day warranty"
            />

            <TextField
              label="Image URL"
              value={ formData.image }
              onChange={ (e) => handleFormChange('image', e.target.value) }
              fullWidth
              placeholder="https://example.com/image.jpg"
            />

            {/* Includes list */ }
            <Box>
              <Typography variant="subtitle2" fontWeight={ 600 } sx={ { mb: 1 } }>
                What's Included
              </Typography>
              { formData.includes.map((item, idx) => (
                <Box key={ idx } sx={ { display: 'flex', gap: 1, mb: 1 } }>
                  <TextField
                    value={ item }
                    onChange={ (e) => handleIncludesChange(idx, e.target.value) }
                    fullWidth
                    size="small"
                    placeholder={ `Item ${idx + 1}` }
                  />
                  { formData.includes.length > 1 && (
                    <IconButton size="small" onClick={ () => removeIncludesItem(idx) } sx={ { color: '#ef4444' } }>
                      <Close fontSize="small" />
                    </IconButton>
                  ) }
                </Box>
              )) }
              <Button size="small" startIcon={ <Add /> } onClick={ addIncludesItem } sx={ { mt: 0.5 } }>
                Add Item
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={ { p: 2.5 } }>
          <Button onClick={ () => setDialogOpen(false) } sx={ { color: '#5a6a80' } }>Cancel</Button>
          <Button
            variant="contained"
            onClick={ handleSave }
            disabled={ saving }
            sx={ { background: 'linear-gradient(135deg, #03288C 0%, #1a56c4 100%)', px: 4 } }
          >
            { saving ? <CircularProgress size={ 20 } sx={ { color: '#fff' } } /> : editingService ? 'Update Service' : 'Create Service' }
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======= Delete Confirmation Dialog ======= */ }
      <Dialog open={ deleteDialogOpen } onClose={ () => setDeleteDialogOpen(false) } maxWidth="xs" fullWidth PaperProps={ { sx: { borderRadius: 3 } } }>
        <DialogTitle sx={ { fontWeight: 700 } }>Delete Service?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{ deletingService?.name }</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={ { p: 2 } }>
          <Button onClick={ () => setDeleteDialogOpen(false) } sx={ { color: '#5a6a80' } }>Cancel</Button>
          <Button
            variant="contained"
            onClick={ handleDelete }
            disabled={ deleting }
            sx={ { bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } } }
          >
            { deleting ? <CircularProgress size={ 20 } sx={ { color: '#fff' } } /> : 'Delete' }
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======= Add / Edit Offer Dialog ======= */ }
      <Dialog open={ offerDialogOpen } onClose={ () => setOfferDialogOpen(false) } maxWidth="sm" fullWidth PaperProps={ { sx: { borderRadius: 3 } } }>
        <DialogTitle sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 } }>
          { editingOffer ? 'Edit Offer' : 'Create New Offer' }
          <IconButton size="small" onClick={ () => setOfferDialogOpen(false) }><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={ { pt: 2.5 } }>
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2.5 } }>
            <TextField
              label="Offer Title"
              value={ offerForm.title }
              onChange={ (e) => setOfferForm({ ...offerForm, title: e.target.value }) }
              fullWidth required
              placeholder="e.g. 15% Off Plumbing Services"
            />
            <TextField
              label="Description"
              value={ offerForm.description }
              onChange={ (e) => setOfferForm({ ...offerForm, description: e.target.value }) }
              fullWidth multiline rows={ 2 }
              placeholder="Describe the offer..."
            />
            <Box sx={ { display: 'flex', gap: 2 } }>
              <TextField
                label="Discount %"
                type="number"
                value={ offerForm.discount_percent }
                onChange={ (e) => setOfferForm({ ...offerForm, discount_percent: e.target.value }) }
                fullWidth
                placeholder="e.g. 15"
              />
              <TextField
                label="Flat Discount (₹)"
                type="number"
                value={ offerForm.discount_flat }
                onChange={ (e) => setOfferForm({ ...offerForm, discount_flat: e.target.value }) }
                fullWidth
                placeholder="e.g. 200"
              />
            </Box>
            <TextField
              label="Coupon Code"
              value={ offerForm.code }
              onChange={ (e) => setOfferForm({ ...offerForm, code: e.target.value.toUpperCase() }) }
              fullWidth required
              placeholder="e.g. PLUMB15"
              helperText="Customers will use this code at checkout"
            />
            <TextField
              label="Badge Text (optional)"
              value={ offerForm.badge }
              onChange={ (e) => setOfferForm({ ...offerForm, badge: e.target.value }) }
              fullWidth
              placeholder="e.g. NEW, LIMITED TIME"
            />
            <Box sx={ { display: 'flex', gap: 2 } }>
              <TextField
                label="Valid From"
                type="date"
                value={ offerForm.valid_from }
                onChange={ (e) => setOfferForm({ ...offerForm, valid_from: e.target.value }) }
                fullWidth
                slotProps={ { inputLabel: { shrink: true } } }
              />
              <TextField
                label="Valid Until"
                type="date"
                value={ offerForm.valid_until }
                onChange={ (e) => setOfferForm({ ...offerForm, valid_until: e.target.value }) }
                fullWidth
                slotProps={ { inputLabel: { shrink: true } } }
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={ { p: 2.5 } }>
          <Button onClick={ () => setOfferDialogOpen(false) } sx={ { color: '#5a6a80' } }>Cancel</Button>
          <Button
            variant="contained"
            onClick={ handleSaveOffer }
            disabled={ savingOffer }
            sx={ { background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)', px: 4 } }
          >
            { savingOffer ? <CircularProgress size={ 20 } sx={ { color: '#fff' } } /> : editingOffer ? 'Update Offer' : 'Create Offer' }
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======= Delete Offer Confirmation ======= */ }
      <Dialog open={ deleteOfferDialog.open } onClose={ () => setDeleteOfferDialog({ open: false, offer: null }) } maxWidth="xs" fullWidth PaperProps={ { sx: { borderRadius: 3 } } }>
        <DialogTitle sx={ { fontWeight: 700 } }>Delete Offer?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{ deleteOfferDialog.offer?.title }</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={ { p: 2 } }>
          <Button onClick={ () => setDeleteOfferDialog({ open: false, offer: null }) } sx={ { color: '#5a6a80' } }>Cancel</Button>
          <Button variant="contained" onClick={ handleDeleteOffer } sx={ { bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } } }>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======= Snackbar ======= */ }
      <Snackbar
        open={ snackbar.open }
        autoHideDuration={ 4000 }
        onClose={ () => setSnackbar((p) => ({ ...p, open: false })) }
        anchorOrigin={ { vertical: 'bottom', horizontal: 'center' } }
      >
        <Alert
          severity={ snackbar.severity }
          onClose={ () => setSnackbar((p) => ({ ...p, open: false })) }
          sx={ { borderRadius: 2 } }
        >
          { snackbar.message }
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProviderDashboard;
