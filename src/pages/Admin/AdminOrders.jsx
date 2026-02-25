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
  TableSortLabel,
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
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Search, Delete, Edit } from '@mui/icons-material';
import api from '../../utils/api';

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  'in-progress': 'primary',
  completed: 'success',
  cancelled: 'error',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, order: null });
  const [statusDialog, setStatusDialog] = useState({ open: false, order: null, newStatus: '' });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/api/admin/orders', { params });
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(0);
  };

  const handleUpdateStatus = async () => {
    try {
      await api.patch(`/api/admin/orders/${statusDialog.order.id}/status`, { status: statusDialog.newStatus });
      setSnackbar({ open: true, message: 'Order status updated', severity: 'success' });
      setStatusDialog({ open: false, order: null, newStatus: '' });
      fetchOrders();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Update failed', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/admin/orders/${deleteDialog.order.id}`);
      setSnackbar({ open: true, message: 'Order deleted successfully', severity: 'success' });
      setDeleteDialog({ open: false, order: null });
      fetchOrders();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={800} color="#0E0E2E">
          Orders Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search orders..."
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} sx={{ borderRadius: 2 }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === 'id'}
                      direction={sortBy === 'id' ? sortOrder : 'asc'}
                      onClick={() => handleSort('id')}
                    >
                      Order ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === 'customer_name'}
                      direction={sortBy === 'customer_name' ? sortOrder : 'asc'}
                      onClick={() => handleSort('customer_name')}
                    >
                      Customer
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === 'item_count'}
                      direction={sortBy === 'item_count' ? sortOrder : 'asc'}
                      onClick={() => handleSort('item_count')}
                    >
                      Items
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === 'subtotal'}
                      direction={sortBy === 'subtotal' ? sortOrder : 'asc'}
                      onClick={() => handleSort('subtotal')}
                    >
                      Subtotal
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === 'platform_fee'}
                      direction={sortBy === 'platform_fee' ? sortOrder : 'asc'}
                      onClick={() => handleSort('platform_fee')}
                    >
                      Fee
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === 'total'}
                      direction={sortBy === 'total' ? sortOrder : 'asc'}
                      onClick={() => handleSort('total')}
                    >
                      Total
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === 'status'}
                      direction={sortBy === 'status' ? sortOrder : 'asc'}
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === 'created_at'}
                      direction={sortBy === 'created_at' ? sortOrder : 'asc'}
                      onClick={() => handleSort('created_at')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                        {order.id?.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{order.customer_name || 'N/A'}</Typography>
                      <Typography variant="caption" color="text.secondary">{order.customer_email}</Typography>
                    </TableCell>
                    <TableCell>
                      {order.items?.map((item) => (
                        <Typography key={item.id} variant="caption" display="block">
                          {item.service_name} x{item.quantity}
                        </Typography>
                      ))}
                    </TableCell>
                    <TableCell>₹{order.subtotal?.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{order.platform_fee?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>₹{order.total?.toLocaleString('en-IN')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        size="small"
                        color={statusColors[order.status] || 'default'}
                        sx={{ fontWeight: 600, fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => setStatusDialog({ open: true, order, newStatus: order.status })}
                        sx={{ color: '#1a56c4' }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog({ open: true, order })}
                        sx={{ color: '#d32f2f' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No orders found</Typography>
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

      {/* Update Status Dialog */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, order: null, newStatus: '' })} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Order Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Order: {statusDialog.order?.id?.substring(0, 8)}...
          </Typography>
          <TextField
            select
            fullWidth
            label="New Status"
            value={statusDialog.newStatus}
            onChange={(e) => setStatusDialog({ ...statusDialog, newStatus: e.target.value })}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setStatusDialog({ open: false, order: null, newStatus: '' })}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateStatus} sx={{ bgcolor: '#03288C', '&:hover': { bgcolor: '#021A66' } }}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, order: null })} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Order</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete order <strong>{deleteDialog.order?.id?.substring(0, 8)}...</strong>? This will also remove associated items and payments.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteDialog({ open: false, order: null })}>Cancel</Button>
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

export default AdminOrders;
