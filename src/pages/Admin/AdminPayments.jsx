import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import api from '../../utils/api';

const statusColors = {
  pending: 'warning',
  completed: 'success',
  failed: 'error',
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [audit, setAudit] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, limit: rowsPerPage };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/api/admin/payments', { params });
      setPayments(data.payments);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  const fetchAudit = useCallback(async () => {
    setAuditLoading(true);
    try {
      const { data } = await api.get('/api/admin/payments/audit', {
        params: { days: 30, limit: 25 },
      });
      setAudit(data);
    } catch (err) {
      console.error('Failed to fetch payment audit:', err);
      setAudit(null);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { fetchAudit(); }, [fetchAudit]);

  return (
    <Box>
      <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 } }>
        <Typography variant="h5" fontWeight={ 800 } color="#0E0E2E">
          Payments
        </Typography>
        <FormControl size="small" sx={ { minWidth: 140 } }>
          <InputLabel>Status</InputLabel>
          <Select value={ statusFilter } label="Status" onChange={ (e) => { setStatusFilter(e.target.value); setPage(0); } } sx={ { borderRadius: 2 } }>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={ 2 } sx={ { mb: 3 } }>
        <Grid item xs={ 12 } sm={ 6 } md={ 3 }>
          <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Completed Amount</Typography>
              <Typography variant="h6" fontWeight={ 800 } color="#1b5e20">
                ₹{ (audit?.summary?.completed_amount || 0).toLocaleString('en-IN') }
              </Typography>
              <Typography variant="caption" color="text.secondary">
                { audit?.summary?.completed_count || 0 } completed payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={ 12 } sm={ 6 } md={ 3 }>
          <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Pending Amount</Typography>
              <Typography variant="h6" fontWeight={ 800 } color="#e65100">
                ₹{ (audit?.summary?.pending_amount || 0).toLocaleString('en-IN') }
              </Typography>
              <Typography variant="caption" color="text.secondary">
                { audit?.summary?.pending_count || 0 } pending payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={ 12 } sm={ 6 } md={ 3 }>
          <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Failed Amount</Typography>
              <Typography variant="h6" fontWeight={ 800 } color="#b71c1c">
                ₹{ (audit?.summary?.failed_amount || 0).toLocaleString('en-IN') }
              </Typography>
              <Typography variant="caption" color="text.secondary">
                { audit?.summary?.failed_count || 0 } failed payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={ 12 } sm={ 6 } md={ 3 }>
          <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Audit Issues</Typography>
              <Typography variant="h6" fontWeight={ 800 } color="#6a1b9a">
                { (audit?.anomalies || []).length }
              </Typography>
              <Typography variant="caption" color="text.secondary">
                in last { audit?.filters?.days || 30 } days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      { audit && !auditLoading && (audit.anomalies || []).length > 0 && (
        <Alert severity="warning" sx={ { mb: 2, borderRadius: 2 } }>
          Found { (audit.anomalies || []).length } payment anomalies. Review the audit table below.
        </Alert>
      ) }

      <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none', mb: 3 } }>
        <CardContent sx={ { p: 0 } }>
          <Box sx={ { px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' } }>
            <Typography variant="subtitle1" fontWeight={ 700 }>Payment Audit</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={ { bgcolor: 'rgba(0,0,0,0.02)' } }>
                  <TableCell sx={ { fontWeight: 700 } }>Issue</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Severity</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Payment ID</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Order ID</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Method</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Status</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Amount</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { (audit?.anomalies || []).map((a) => (
                  <TableRow key={ `${a.issue}-${a.id}` } hover>
                    <TableCell><Typography variant="body2" fontWeight={ 600 }>{ a.issue }</Typography></TableCell>
                    <TableCell>
                      <Chip
                        label={ a.severity }
                        size="small"
                        color={ a.severity === 'high' ? 'error' : 'warning' }
                        sx={ { fontWeight: 600, fontSize: 11 } }
                      />
                    </TableCell>
                    <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ a.id?.substring(0, 8) }...</TableCell>
                    <TableCell sx={ { fontFamily: 'monospace', fontSize: 12 } }>{ a.order_id?.substring(0, 8) }...</TableCell>
                    <TableCell>{ a.method || 'N/A' }</TableCell>
                    <TableCell>{ a.status || 'N/A' }</TableCell>
                    <TableCell>₹{ Number(a.amount || 0).toLocaleString('en-IN') }</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{ a.reason }</Typography>
                    </TableCell>
                  </TableRow>
                )) }
                { !auditLoading && (audit?.anomalies || []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={ 8 } align="center" sx={ { py: 4 } }>
                      <Typography color="text.secondary">No audit anomalies found</Typography>
                    </TableCell>
                  </TableRow>
                ) }
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
        <CardContent sx={ { p: 0 } }>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={ { bgcolor: 'rgba(0,0,0,0.02)' } }>
                  <TableCell sx={ { fontWeight: 700 } }>Payment ID</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Order ID</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Customer</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Amount</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Method</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Status</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Paid At</TableCell>
                  <TableCell sx={ { fontWeight: 700 } }>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { payments.map((p) => (
                  <TableRow key={ p.id } hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={ 600 } sx={ { fontFamily: 'monospace' } }>
                        { p.id?.substring(0, 8) }...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={ { fontFamily: 'monospace' } }>
                        { p.order_id?.substring(0, 8) }...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{ p.customer_name || 'N/A' }</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={ 700 }>₹{ p.amount?.toLocaleString('en-IN') }</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ p.method || 'upi' }
                        size="small"
                        variant="outlined"
                        sx={ { fontSize: 11, fontWeight: 600 } }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ p.status }
                        size="small"
                        color={ statusColors[p.status] || 'default' }
                        sx={ { fontWeight: 600, fontSize: 11 } }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        { p.paid_at ? new Date(p.paid_at).toLocaleString() : '-' }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        { p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A' }
                      </Typography>
                    </TableCell>
                  </TableRow>
                )) }
                { payments.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={ 8 } align="center" sx={ { py: 6 } }>
                      <Typography color="text.secondary">No payments found</Typography>
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
    </Box>
  );
};

export default AdminPayments;
