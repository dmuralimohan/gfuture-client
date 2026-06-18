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
  Avatar,
  InputAdornment,
  Alert,
  Snackbar,
} from '@mui/material';
import { Search, Edit, Delete, Add, Visibility } from '@mui/icons-material';
import api from '../../utils/api';

const AdminUsers = ({ roleFilter }) => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: roleFilter || 'customer' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });

  const title = roleFilter === 'provider' ? 'Service Providers' : roleFilter === 'customer' ? 'Customers' : 'All Users';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, limit: rowsPerPage };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const { data } = await api.get('/api/admin/users', { params });
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, phone: user.phone, password: '', role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', phone: '', password: '', role: roleFilter || 'customer' });
    }
    setDialogOpen(true);
  };

  const handleViewUser = async (userId) => {
    try {
      const { data } = await api.get(`/api/admin/users/${userId}`);
      setViewUser(data);
      setViewDialogOpen(true);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to load user details', severity: 'error' });
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        const payload = { name: formData.name, email: formData.email, phone: formData.phone, role: formData.role };
        if (formData.password) payload.password = formData.password;
        await api.put(`/api/admin/users/${editingUser.id}`, payload);
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
      } else {
        await api.post('/api/admin/users', formData);
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Operation failed', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/admin/users/${deleteDialog.user.id}`);
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
      setDeleteDialog({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
    }
  };

  const roleColors = {
    customer: '#03288C',
    provider: '#059669',
    admin: '#7c3aed',
  };

  return (
    <Box>
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 } }>
        <Typography variant="h5" fontWeight={ 800 } color="#0E0E2E">
          { title }
        </Typography>
        <Box sx={ { display: 'flex', gap: 2, alignItems: 'center' } }>
          <TextField
            placeholder="Search users..."
            size="small"
            value={ search }
            onChange={ (e) => { setSearch(e.target.value); setPage(0); } }
            InputProps={ {
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            } }
            sx={ { minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
          />
          <Button
            variant="contained"
            startIcon={ <Add /> }
            onClick={ () => handleOpenDialog() }
            sx={ { bgcolor: '#03288C', borderRadius: 2, '&:hover': { bgcolor: '#021A66' } } }
          >
            Add User
          </Button>
        </Box>
      </Box>

      <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
        <CardContent sx={ { p: 0 } }>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={ { bgcolor: 'rgba(0,0,0,0.02)' } }>
                  <TableCell sx={ { fontWeight: 700 } }>User</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Email</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Phone</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Role</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Referral Code</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Joined Via Ref</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Orders</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Spent</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Joined</TableCell>
                  <TableCell sx={ { fontWeight: 700 } } align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { users.map((user) => (
                  <TableRow key={ user.id } hover>
                    <TableCell>
                      <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
                        <Avatar sx={ { bgcolor: roleColors[user.role] || '#03288C', width: 36, height: 36, fontSize: 14 } }>
                          { user.name?.[0]?.toUpperCase() }
                        </Avatar>
                        <Typography variant="body2" fontWeight={ 600 }>{ user.name }</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{ user.email }</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{ user.phone }</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ user.role }
                        size="small"
                        sx={ { fontWeight: 600, fontSize: 11, bgcolor: roleColors[user.role], color: '#fff' } }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={ { fontFamily: 'monospace', fontWeight: 700 } }>
                        { user.referral_code || 'N/A' }
                      </Typography>
                    </TableCell>
                    <TableCell>{ user.referred_users_count || 0 }</TableCell>
                    <TableCell>{ user.order_count }</TableCell>
                    <TableCell>₹{ user.total_spent?.toLocaleString('en-IN') || 0 }</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        { user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A' }
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={ () => handleViewUser(user.id) } sx={ { color: '#03288C' } }>
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={ () => handleOpenDialog(user) } sx={ { color: '#1a56c4' } }>
                        <Edit fontSize="small" />
                      </IconButton>
                      { user.role !== 'admin' && (
                        <IconButton size="small" onClick={ () => setDeleteDialog({ open: true, user }) } sx={ { color: '#d32f2f' } }>
                          <Delete fontSize="small" />
                        </IconButton>
                      ) }
                    </TableCell>
                  </TableRow>
                )) }
                { users.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={ 10 } align="center" sx={ { py: 6 } }>
                      <Typography color="text.secondary">No users found</Typography>
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

      {/* Create/Edit Dialog */ }
      <Dialog open={ dialogOpen } onClose={ () => setDialogOpen(false) } maxWidth="sm" fullWidth PaperProps={ { sx: { borderRadius: 3 } } }>
        <DialogTitle sx={ { fontWeight: 700 } }>
          { editingUser ? 'Edit User' : 'Create New User' }
        </DialogTitle>
        <DialogContent>
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2, mt: 1 } }>
            <TextField
              label="Full Name"
              fullWidth
              value={ formData.name }
              onChange={ (e) => setFormData({ ...formData, name: e.target.value }) }
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={ formData.email }
              onChange={ (e) => setFormData({ ...formData, email: e.target.value }) }
            />
            <TextField
              label="Phone"
              fullWidth
              value={ formData.phone }
              onChange={ (e) => setFormData({ ...formData, phone: e.target.value }) }
            />
            <TextField
              label={ editingUser ? 'New Password (leave blank to keep)' : 'Password' }
              type="password"
              fullWidth
              value={ formData.password }
              onChange={ (e) => setFormData({ ...formData, password: e.target.value }) }
            />
            <TextField
              label="Role"
              select
              fullWidth
              value={ formData.role }
              onChange={ (e) => setFormData({ ...formData, role: e.target.value }) }
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="provider">Provider</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={ { p: 2.5 } }>
          <Button onClick={ () => setDialogOpen(false) }>Cancel</Button>
          <Button variant="contained" onClick={ handleSubmit } sx={ { bgcolor: '#03288C', '&:hover': { bgcolor: '#021A66' } } }>
            { editingUser ? 'Update' : 'Create' }
          </Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */ }
      <Dialog open={ viewDialogOpen } onClose={ () => setViewDialogOpen(false) } maxWidth="sm" fullWidth PaperProps={ { sx: { borderRadius: 3 } } }>
        <DialogTitle sx={ { fontWeight: 700 } }>User Details</DialogTitle>
        <DialogContent>
          { viewUser && (
            <Box>
              <Box sx={ { display: 'flex', alignItems: 'center', gap: 2, mb: 3 } }>
                <Avatar sx={ { bgcolor: '#03288C', width: 56, height: 56, fontSize: 22 } }>
                  { viewUser.user?.name?.[0]?.toUpperCase() }
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={ 700 }>{ viewUser.user?.name }</Typography>
                  <Typography color="text.secondary">{ viewUser.user?.email }</Typography>
                  <Chip label={ viewUser.user?.role } size="small" sx={ { mt: 0.5, fontWeight: 600, bgcolor: roleColors[viewUser.user?.role], color: '#fff' } } />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={ 0.5 }>Phone: { viewUser.user?.phone }</Typography>
              <Typography variant="body2" color="text.secondary" mb={ 0.5 }>Referral Code: { viewUser.user?.referral_code || 'N/A' }</Typography>
              <Typography variant="body2" color="text.secondary" mb={ 0.5 }>Joined users via referral: { viewUser.referralSummary?.referred_users_count || 0 }</Typography>
              <Typography variant="body2" color="text.secondary" mb={ 2 }>Referral earned: ₹{ Number(viewUser.referralSummary?.referral_earned || 0).toLocaleString('en-IN') }</Typography>
              <Typography variant="body2" color="text.secondary" mb={ 2 }>Joined: { viewUser.user?.created_at ? new Date(viewUser.user.created_at).toLocaleDateString() : 'N/A' }</Typography>

              { viewUser.orders?.length > 0 && (
                <>
                  <Typography variant="subtitle2" fontWeight={ 700 } mb={ 1 }>Recent Orders ({ viewUser.orders.length })</Typography>
                  { viewUser.orders.slice(0, 5).map((order) => (
                    <Box key={ order.id } sx={ { p: 1.5, mb: 1, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 } }>
                      <Box sx={ { display: 'flex', justifyContent: 'space-between' } }>
                        <Typography variant="body2" fontWeight={ 600 } sx={ { fontFamily: 'monospace' } }>{ order.id?.substring(0, 8) }...</Typography>
                        <Chip label={ order.status } size="small" color={ order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'default' } sx={ { fontSize: 10 } } />
                      </Box>
                      <Typography variant="caption" color="text.secondary">₹{ order.total } · { new Date(order.created_at).toLocaleDateString() }</Typography>
                    </Box>
                  )) }
                </>
              ) }

              { viewUser.services?.length > 0 && (
                <>
                  <Typography variant="subtitle2" fontWeight={ 700 } mb={ 1 } mt={ 2 }>Services ({ viewUser.services.length })</Typography>
                  { viewUser.services.map((svc) => (
                    <Box key={ svc.id } sx={ { p: 1.5, mb: 1, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 } }>
                      <Typography variant="body2" fontWeight={ 600 }>{ svc.name }</Typography>
                      <Typography variant="caption" color="text.secondary">₹{ svc.price } · { svc.active ? 'Active' : 'Inactive' }</Typography>
                    </Box>
                  )) }
                </>
              ) }
            </Box>
          ) }
        </DialogContent>
        <DialogActions sx={ { p: 2.5 } }>
          <Button onClick={ () => setViewDialogOpen(false) }>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */ }
      <Dialog open={ deleteDialog.open } onClose={ () => setDeleteDialog({ open: false, user: null }) } PaperProps={ { sx: { borderRadius: 3 } } }>
        <DialogTitle sx={ { fontWeight: 700 } }>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{ deleteDialog.user?.name }</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={ { p: 2.5 } }>
          <Button onClick={ () => setDeleteDialog({ open: false, user: null }) }>Cancel</Button>
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

export default AdminUsers;
