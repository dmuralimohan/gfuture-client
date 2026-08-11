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
  Avatar,
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
    name: '', category_id: '', provider_id: '', price: '', description: '', duration: '', warranty: '', image: '', image_links: '', includes: '', location: '', active: 1, type: 'service', size_value: '', size_unit: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
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
      setImageFile(null);
      setImagePreview(service.image || '');
      setFormData({
        name: service.name,
        category_id: service.category_id,
        provider_id: service.provider_id || '',
        price: service.price,
        description: service.description || '',
        duration: service.duration || '',
        warranty: service.warranty || '',
        image: service.image || '',
        image_links: Array.isArray(service.image_links) ? service.image_links.join(', ') : service.image_links || '',
        includes: Array.isArray(service.includes) ? service.includes.join(', ') : service.includes || '',
        location: service.location || '',
        active: service.active,
        type: service.type || 'service',
        size_value: service.size_value || '',
        size_unit: service.size_unit || '',
      });
    } else {
      setEditingService(null);
      setImageFile(null);
      setImagePreview('');
      setFormData({ name: '', category_id: '', provider_id: '', price: '', description: '', duration: '', warranty: '', image: '', image_links: '', includes: '', location: '', active: 1, type: 'service', size_value: '', size_unit: '' });
    }
    setDialogOpen(true);
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(formData.image || '');
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        location: formData.location?.trim() || null,
        image_links: formData.image_links ? formData.image_links.split(',').map((s) => s.trim()).filter(Boolean) : [],
        includes: formData.includes ? formData.includes.split(',').map((s) => s.trim()).filter(Boolean) : [],
        size_value: formData.type === 'product' ? formData.size_value || null : null,
        size_unit: formData.type === 'product' ? formData.size_unit || null : null,
      };

      const formPayload = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          formPayload.append(key, '');
          return;
        }

        if (Array.isArray(value)) {
          formPayload.append(key, JSON.stringify(value));
          return;
        }

        formPayload.append(key, String(value));
      });

      if (imageFile) {
        formPayload.append('image_file', imageFile);
      }

      if (editingService) {
        await api.put(`/api/admin/services/${editingService.id}`, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSnackbar({ open: true, message: 'Service updated successfully', severity: 'success' });
      } else {
        await api.post('/api/admin/services', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
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
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 } }>
        <Typography variant="h5" fontWeight={ 800 } color="#0E0E2E">
          Services Management
        </Typography>
        <Box sx={ { display: 'flex', gap: 2, alignItems: 'center' } }>
          <TextField
            placeholder="Search services..."
            size="small"
            value={ search }
            onChange={ (e) => { setSearch(e.target.value); setPage(0); } }
            InputProps={ { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }
            sx={ { minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
          />
          <Button
            variant="contained"
            startIcon={ <Add /> }
            onClick={ () => handleOpenDialog() }
            sx={ { bgcolor: '#03288C', borderRadius: 2, '&:hover': { bgcolor: '#021A66' } } }
          >
            Add Service
          </Button>
        </Box>
      </Box>

      <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
        <CardContent sx={ { p: 0 } }>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={ { bgcolor: 'rgba(0,0,0,0.02)' } }>
                  <TableCell sx={ { fontWeight: 700 } }>ID</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Name</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Category</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Type</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Location</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Provider</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Price</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Rating</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Status</TableCell>
                  <TableCell sx={ { fontWeight: 700 } } align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { services.map((svc) => (
                  <TableRow key={ svc.id } hover>
                    <TableCell>{ svc.id }</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={ 600 }>{ svc.name }</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={ svc.category_name || 'N/A' } size="small" variant="outlined" sx={ { fontSize: 11 } } />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ svc.type === 'product' ? 'Product' : 'Service' }
                        size="small"
                        sx={ {
                          fontWeight: 600,
                          fontSize: 11,
                          bgcolor: svc.type === 'product' ? '#dbeafe' : '#f0fdf4',
                          color: svc.type === 'product' ? '#1d4ed8' : '#15803d',
                        } }
                      />
                      { svc.type === 'product' && svc.size_value && (
                        <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mt: 0.5 } }>
                          { svc.size_value } { svc.size_unit }
                        </Typography>
                      ) }
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{ svc.location || '—' }</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{ svc.provider_name || 'Unassigned' }</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={ 600 }>₹{ svc.price }</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{ svc.rating } ⭐ ({ svc.reviews })</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ svc.active ? 'Active' : 'Inactive' }
                        size="small"
                        sx={ {
                          fontWeight: 600,
                          fontSize: 11,
                          bgcolor: svc.active ? '#10b981' : '#ef4444',
                          color: '#fff',
                        } }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={ () => handleOpenDialog(svc) } sx={ { color: '#1a56c4' } }>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={ () => setDeleteDialog({ open: true, service: svc }) } sx={ { color: '#d32f2f' } }>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )) }
                { services.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={ 10 } align="center" sx={ { py: 6 } }>
                      <Typography color="text.secondary">No services found</Typography>
                    </TableCell>
                  </TableRow>
                ) }
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={ total }
            page={ page }
            onPageChange={ (_, p) => setPage(p) }
            rowsPerPage={ rowsPerPage }
            onRowsPerPageChange={ (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); } }
          />
        </CardContent>
      </Card>

      {/* Create/Edit Service Dialog */ }
      <Dialog open={ dialogOpen } onClose={ () => setDialogOpen(false) } maxWidth="sm" fullWidth PaperProps={ { sx: { borderRadius: 3 } } }>
        <DialogTitle sx={ { fontWeight: 700 } }>
          { editingService ? 'Edit Service' : 'Create New Service' }
        </DialogTitle>
        <DialogContent>
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2, mt: 1 } }>
            <TextField label="Service Name" fullWidth value={ formData.name } onChange={ (e) => setFormData({ ...formData, name: e.target.value }) } />
            <TextField label="Type" select fullWidth value={ formData.type } onChange={ (e) => setFormData({ ...formData, type: e.target.value, size_value: '', size_unit: '' }) }>
              <MenuItem value="service">Service</MenuItem>
              <MenuItem value="product">Product</MenuItem>
            </TextField>
            { formData.type === 'product' && (
              <Box sx={ { display: 'flex', gap: 2 } }>
                <TextField label="Size / Quantity" fullWidth value={ formData.size_value } placeholder="e.g. 500, 1, 250" onChange={ (e) => setFormData({ ...formData, size_value: e.target.value }) } />
                <TextField label="Unit" select fullWidth value={ formData.size_unit } onChange={ (e) => setFormData({ ...formData, size_unit: e.target.value }) }>
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="g">g</MenuItem>
                  <MenuItem value="ml">ml</MenuItem>
                  <MenuItem value="L">L</MenuItem>
                  <MenuItem value="size">Size (S/M/L/XL)</MenuItem>
                  <MenuItem value="pcs">Pieces</MenuItem>
                  <MenuItem value="pack">Pack</MenuItem>
                </TextField>
              </Box>
            ) }
            <TextField label="Category" select fullWidth value={ formData.category_id } onChange={ (e) => setFormData({ ...formData, category_id: e.target.value }) }>
              { categories.map((cat) => (
                <MenuItem key={ cat.id } value={ cat.id }>{ cat.name }</MenuItem>
              )) }
            </TextField>
            <TextField label="Provider" select fullWidth value={ formData.provider_id } onChange={ (e) => setFormData({ ...formData, provider_id: e.target.value }) }>
              <MenuItem value="">Unassigned</MenuItem>
              { providers.map((p) => (
                <MenuItem key={ p.id } value={ p.id }>{ p.name } ({ p.email })</MenuItem>
              )) }
            </TextField>
            <TextField label="Price (₹)" type="number" fullWidth value={ formData.price } onChange={ (e) => setFormData({ ...formData, price: e.target.value }) } />
            <TextField
              label="Location"
              fullWidth
              required={ formData.type === 'product' }
              helperText={ formData.type === 'product' ? 'Required for products. Existing products default to Kadalur.' : 'Optional for services' }
              value={ formData.location }
              onChange={ (e) => setFormData({ ...formData, location: e.target.value }) }
            />
            <TextField label="Description" fullWidth multiline rows={ 3 } value={ formData.description } onChange={ (e) => setFormData({ ...formData, description: e.target.value }) } />
            <TextField label="Duration" fullWidth value={ formData.duration } placeholder="e.g. 45-60 mins" onChange={ (e) => setFormData({ ...formData, duration: e.target.value }) } />
            <TextField label="Warranty" fullWidth value={ formData.warranty } placeholder="e.g. 30 days" onChange={ (e) => setFormData({ ...formData, warranty: e.target.value }) } />
            <TextField
              label="Image URL"
              fullWidth
              value={ formData.image }
              onChange={ (e) => {
                const nextUrl = e.target.value;
                setFormData({ ...formData, image: nextUrl });
                if (!imageFile) setImagePreview(nextUrl);
              } }
            />
            <Button variant="outlined" component="label" sx={ { borderRadius: 2 } }>
              { imageFile ? 'Change Image File' : 'Upload Image File' }
              <input type="file" hidden accept="image/*" onChange={ handleImageFileChange } />
            </Button>
            { imagePreview && (
              <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
                <Avatar
                  variant="rounded"
                  src={ imagePreview }
                  alt="Service preview"
                  sx={ { width: 64, height: 64, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.04)' } }
                />
                <Typography variant="caption" color="text.secondary">
                  { imageFile ? `Selected file: ${imageFile.name}` : 'Using image URL preview' }
                </Typography>
              </Box>
            ) }
            <TextField
              label="Additional Image Links (comma separated URLs)"
              fullWidth
              value={ formData.image_links }
              placeholder="https://..., https://..."
              onChange={ (e) => setFormData({ ...formData, image_links: e.target.value }) }
            />
            <TextField label="Includes (comma separated)" fullWidth value={ formData.includes } placeholder="e.g. Diagnosis, Repair, Testing" onChange={ (e) => setFormData({ ...formData, includes: e.target.value }) } />
            { editingService && (
              <FormControlLabel
                control={ <Switch checked={ !!formData.active } onChange={ (e) => setFormData({ ...formData, active: e.target.checked ? 1 : 0 }) } /> }
                label="Active"
              />
            ) }
          </Box>
        </DialogContent>
        <DialogActions sx={ { p: 2.5 } }>
          <Button onClick={ () => setDialogOpen(false) }>Cancel</Button>
          <Button variant="contained" onClick={ handleSubmit } sx={ { bgcolor: '#03288C', '&:hover': { bgcolor: '#021A66' } } }>
            { editingService ? 'Update' : 'Create' }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */ }
      <Dialog open={ deleteDialog.open } onClose={ () => setDeleteDialog({ open: false, service: null }) } PaperProps={ { sx: { borderRadius: 3 } } }>
        <DialogTitle sx={ { fontWeight: 700 } }>Delete Service</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{ deleteDialog.service?.name }</strong>? Services with existing orders will be deactivated instead.
          </Typography>
        </DialogContent>
        <DialogActions sx={ { p: 2.5 } }>
          <Button onClick={ () => setDeleteDialog({ open: false, service: null }) }>Cancel</Button>
          <Button variant="contained" color="error" onClick={ handleDelete }>Delete</Button>
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

export default AdminServices;
