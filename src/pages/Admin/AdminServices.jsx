import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  InputAdornment,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Search, Edit, Delete, Add } from '@mui/icons-material';
import api from '../../utils/api';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category_id: '', provider_id: '', price: '', description: '', duration: '', warranty: '', image: '', includes: '', active: 1,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, service: null });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, limit: rowsPerPage };
      if (search) params.search = search;
      const { data } = await api.get('/api/admin/services', { params });
      setServices(data.services);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  const fetchMeta = useCallback(async () => {
    try {
      const [catRes, provRes] = await Promise.all([
        api.get('/api/admin/categories'),
        api.get('/api/admin/users', { params: { role: 'provider', limit: 100 } }),
      ]);
      setCategories(catRes.data.categories);
      setProviders(provRes.data.users);
    } catch (err) {
      console.error('Failed to fetch metadata:', err);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);
  useEffect(() => { fetchMeta(); }, [fetchMeta]);

  const handleOpenDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        category_id: service.category_id,
        provider_id: service.provider_id || '',
        price: service.price,
        description: service.description || '',
        duration: service.duration || '',
        warranty: service.warranty || '',
        image: service.image || '',
        includes: Array.isArray(service.includes) ? service.includes.join(', ') : service.includes || '',
        active: service.active,
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', category_id: '', provider_id: '', price: '', description: '', duration: '', warranty: '', image: '', includes: '', active: 1 });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        includes: formData.includes ? formData.includes.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      if (editingService) {
        await api.put(`/api/admin/services/${editingService.id}`, payload);
        setSnackbar({ open: true, message: 'Service updated successfully', severity: 'success' });
      } else {
        await api.post('/api/admin/services', payload);
        setSnackbar({ open: true, message: 'Service created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      fetchServices();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Operation failed', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/admin/services/${deleteDialog.service.id}`);
      setSnackbar({ open: true, message: 'Service deleted/deactivated successfully', severity: 'success' });
      setDeleteDialog({ open: false, service: null });
      fetchServices();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={800} color="#0E0E2E">
          Services Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search services..."
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: '#03288C', borderRadius: 2, '&:hover': { bgcolor: '#021A66' } }}
          >
            Add Service
          </Button>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Provider</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((svc) => (
                  <TableRow key={svc.id} hover>
                    <TableCell>{svc.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{svc.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={svc.category_name || 'N/A'} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{svc.provider_name || 'Unassigned'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>₹{svc.price}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{svc.rating} ⭐ ({svc.reviews})</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={svc.active ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: 11,
                          bgcolor: svc.active ? '#10b981' : '#ef4444',
                          color: '#fff',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(svc)} sx={{ color: '#1a56c4' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteDialog({ open: true, service: svc })} sx={{ color: '#d32f2f' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {services.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No services found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Service Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingService ? 'Edit Service' : 'Create New Service'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Service Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <TextField label="Category" select fullWidth value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </TextField>
            <TextField label="Provider" select fullWidth value={formData.provider_id} onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}>
              <MenuItem value="">Unassigned</MenuItem>
              {providers.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name} ({p.email})</MenuItem>
              ))}
            </TextField>
            <TextField label="Price (₹)" type="number" fullWidth value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            <TextField label="Description" fullWidth multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <TextField label="Duration" fullWidth value={formData.duration} placeholder="e.g. 45-60 mins" onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
            <TextField label="Warranty" fullWidth value={formData.warranty} placeholder="e.g. 30 days" onChange={(e) => setFormData({ ...formData, warranty: e.target.value })} />
            <TextField label="Image URL" fullWidth value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
            <TextField label="Includes (comma separated)" fullWidth value={formData.includes} placeholder="e.g. Diagnosis, Repair, Testing" onChange={(e) => setFormData({ ...formData, includes: e.target.value })} />
            {editingService && (
              <FormControlLabel
                control={<Switch checked={!!formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked ? 1 : 0 })} />}
                label="Active"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#03288C', '&:hover': { bgcolor: '#021A66' } }}>
            {editingService ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, service: null })} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Service</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteDialog.service?.name}</strong>? Services with existing orders will be deactivated instead.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteDialog({ open: false, service: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminServices;
