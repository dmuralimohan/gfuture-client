import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import { Edit, Delete, Add, Category as CategoryIcon } from '@mui/icons-material';
import api from '../../utils/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '', image: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/categories');
      setCategories(data.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, icon: category.icon || '', image: category.image || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', icon: '', image: '' });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await api.put(`/api/admin/categories/${editingCategory.id}`, formData);
        setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
      } else {
        await api.post('/api/admin/categories', formData);
        setSnackbar({ open: true, message: 'Category created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Operation failed', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/admin/categories/${deleteDialog.category.id}`);
      setSnackbar({ open: true, message: 'Category deleted successfully', severity: 'success' });
      setDeleteDialog({ open: false, category: null });
      fetchCategories();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={800} color="#0E0E2E">
          Categories Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#03288C', borderRadius: 2, '&:hover': { bgcolor: '#021A66' } }}
        >
          Add Category
        </Button>
      </Box>

      <Grid container spacing={2}>
        {categories.map((cat) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cat.id}>
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: 'none',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(3, 40, 140, 0.1)', color: '#03288C', width: 48, height: 48 }}>
                    <CategoryIcon />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>
                      {cat.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {cat.id}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={`${cat.service_count || 0} services`}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#03288C', color: '#fff' }}
                  />
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(cat)} sx={{ color: '#1a56c4' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteDialog({ open: true, category: cat })} sx={{ color: '#d32f2f' }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                {cat.icon && (
                  <Typography variant="caption" color="text.secondary" mt={1} display="block">
                    Icon: {cat.icon}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
        {categories.length === 0 && !loading && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary">No categories found</Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingCategory ? 'Edit Category' : 'Create New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Category Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <TextField label="Icon (MUI Icon name)" fullWidth value={formData.icon} placeholder="e.g. BuildCircle" onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
            <TextField label="Image URL" fullWidth value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: '#03288C', '&:hover': { bgcolor: '#021A66' } }}>
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, category: null })} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteDialog.category?.name}</strong>? Categories with services cannot be deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteDialog({ open: false, category: null })}>Cancel</Button>
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

export default AdminCategories;
