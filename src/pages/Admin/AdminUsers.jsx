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
      console.error('Failed to load user details', err);
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
    <Box sx={ { minWidth: 0 } }>
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 } }>
        <Typography variant="h5" fontWeight={ 800 } color="#0E0E2E" sx={ { whiteSpace: 'nowrap' } }>
          { title }
        </Typography>
        <Box sx={ { display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' } }>
          <TextField
            placeholder="Search users..."
            size="small"
            value={ search }
            onChange={ (e) => { setSearch(e.target.value); setPage(0); } }
            InputProps={ {
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            } }
            sx={ { width: { xs: '100%', sm: 240 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
          />
          <Button
            variant="contained"
            startIcon={ <Add /> }
            onClick={ () => handleOpenDialog() }
            sx={ { bgcolor: '#03288C', borderRadius: 2, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#021A66' } } }
          >
            Add User
          </Button>
        </Box>
      </Box>

      <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
        <CardContent sx={ { p: 0 } }>
          <TableContainer sx={ { overflowX: 'auto' } }>
            <Table sx={ { minWidth: 900, tableLayout: 'fixed' } } size="small">
              <colgroup>
                <col style={ { width: '160px' } } />
                <col style={ { width: '200px' } } />
                <col style={ { width: '120px' } } />
                <col style={ { width: '90px' } } />
                <col style={ { width: '120px' } } />
                <col style={ { width: '50px' } } />
                <col style={ { width: '60px' } } />
                <col style={ { width: '70px' } } />
                <col style={ { width: '110px' } } />
                <col style={ { width: '96px' } } />
              </colgroup>
              <TableHead>
                <TableRow sx={ { bgcolor: 'rgba(3,40,140,0.04)' } }>
                  <TableCell sx={ { fontWeight: 700, whiteSpace: 'nowrap', py: 1.5 } }>User</TableCell>
                  <TableCell sx={ { fontWeight: 700, whiteSpace: 'nowrap', py: 1.5 } }>Email</TableCell>
                  <TableCell sx={ { fontWeight: 700, whiteSpace: 'nowrap', py: 1.5 } }>Phone</TableCell>
                  <TableCell sx={ { fontWeight: 700, whiteSpace: 'nowrap', py: 1.5 } }>Role</TableCell>
                  <TableCell sx={ { fontWeight: 700, whiteSpace: 'nowrap', py: 1.5 } }>Ref Code</TableCell>
                  <TableCell sx={ { fontWeight: 700, whiteSpace: 'nowrap', py: 1.5 } } align="center">Refs</TableCell>
                  <TableCell sx={ { fontWeight: 700, whiteSpace: 'nowrap', py: 1.5 } } align="center">Orders</TableCell>
                  <TableCell sx={ { fontWeight: 700, whiteSpace: 'nowrap', py: 1.5 } }>Spent</TableCell>
                  <TableCell sx={ { fontWeight: 700, whiteSpace: 'nowrap', py: 1.5 } }>Joined</TableCell>
                  <TableCell sx={ { fontWeight: 700, whiteSpace: 'nowrap', py: 1.5, position: 'sticky', right: 0, bgcolor: 'rgba(240,244,255,1)', zIndex: 2, boxShadow: '-2px 0 6px rgba(0,0,0,0.06)' } } align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { users.map((user) => (
                  <TableRow key={ user.id } hover sx={ { '&:last-child td': { border: 0 } } }>
                    <TableCell sx={ { py: 1.2, overflow: 'hidden' } }>
                      <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                        <Avatar sx={ { bgcolor: roleColors[user.role] || '#03288C', width: 30, height: 30, fontSize: 12, flexShrink: 0 } }>
                          { user.name?.[0]?.toUpperCase() }
                        </Avatar>
                        <Typography variant="body2" fontWeight={ 600 } noWrap>{ user.name }</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={ { py: 1.2, overflow: 'hidden' } }>
                      <Typography variant="body2" color="text.secondary" noWrap>{ user.email }</Typography>
                    </TableCell>
                    <TableCell sx={ { py: 1.2 } }>
                      <Typography variant="body2" color="text.secondary" sx={ { whiteSpace: 'nowrap' } }>{ user.phone }</Typography>
                    </TableCell>
                    <TableCell sx={ { py: 1.2 } }>
                      <Chip
                        label={ user.role }
                        size="small"
                        sx={ { fontWeight: 600, fontSize: 11, bgcolor: roleColors[user.role], color: '#fff', height: 22 } }
                      />
                    </TableCell>
                    <TableCell sx={ { py: 1.2 } }>
                      <Typography variant="body2" sx={ { fontFamily: 'monospace', fontWeight: 700, fontSize: 11 } }>
                        { user.referral_code || '—' }
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={ { py: 1.2 } }>
                      <Typography variant="body2">{ user.referred_users_count || 0 }</Typography>
                    </TableCell>
                    <TableCell align="center" sx={ { py: 1.2 } }>
                      <Typography variant="body2">{ user.order_count }</Typography>
                    </TableCell>
                    <TableCell sx={ { py: 1.2 } }>
                      <Typography variant="body2" fontWeight={ 600 } color="#03288C">
                        ₹{ user.total_spent?.toLocaleString('en-IN') || 0 }
                      </Typography>
                    </TableCell>
                    <TableCell sx={ { py: 1.2 } }>
                      <Typography variant="caption" color="text.secondary" sx={ { whiteSpace: 'nowrap' } }>
                        { user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' }
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={ { py: 1.2, whiteSpace: 'nowrap', position: 'sticky', right: 0, bgcolor: 'background.paper', zIndex: 1, boxShadow: '-2px 0 6px rgba(0,0,0,0.06)' } }>
                      <IconButton size="small" onClick={ () => handleViewUser(user.id) } sx={ { color: '#03288C', p: 0.5 } }>
                        <Visibility sx={ { fontSize: 16 } } />
                      </IconButton>
                      <IconButton size="small" onClick={ () => handleOpenDialog(user) } sx={ { color: '#1a56c4', p: 0.5 } }>
                        <Edit sx={ { fontSize: 16 } } />
                      </IconButton>
                      { roleFilter === 'customer' && user.role === 'customer' && (
                        <IconButton size="small" onClick={ () => setDeleteDialog({ open: true, user }) } sx={ { color: '#d32f2f', p: 0.5 } }>
                          <Delete sx={ { fontSize: 16 } } />
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

              { viewUser.user?.role === 'customer' && (
                <>
                  <Typography variant="body2" color="text.secondary" mb={ 0.5 }>
                    Current Plan: { viewUser.currentPlan?.name ? `${viewUser.currentPlan.name} (${viewUser.currentPlan.currency || '₹'}${Number(viewUser.currentPlan.price || 0).toLocaleString('en-IN')})` : 'No active plan' }
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={ 0.5 }>
                    Plan Subscribed: { viewUser.currentPlan?.subscribed_at ? new Date(viewUser.currentPlan.subscribed_at).toLocaleDateString() : 'N/A' }
                  </Typography>

                  <Typography variant="subtitle2" fontWeight={ 700 } mb={ 1 } mt={ 1 }>Address</Typography>
                  <Typography variant="body2" color="text.secondary" mb={ 0.5 }>Street: { viewUser.address?.street || viewUser.user?.address_street || 'N/A' }</Typography>
                  <Typography variant="body2" color="text.secondary" mb={ 0.5 }>Landmark: { viewUser.address?.landmark || viewUser.user?.address_landmark || 'N/A' }</Typography>
                  <Typography variant="body2" color="text.secondary" mb={ 0.5 }>State: { viewUser.address?.state || viewUser.user?.address_state || 'N/A' }</Typography>
                  <Typography variant="body2" color="text.secondary" mb={ 2 }>Pincode: { viewUser.address?.pincode || viewUser.user?.address_pincode || 'N/A' }</Typography>
                </>
              ) }

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
