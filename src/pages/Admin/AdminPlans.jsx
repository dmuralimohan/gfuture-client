import { useState, useEffect, useCallback, Fragment } from 'react';
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
    TextField,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Alert,
    Snackbar,
    Switch,
    FormControlLabel,
    Collapse,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
} from '@mui/material';
import { Edit, Delete, Add, ExpandMore, ExpandLess, People } from '@mui/icons-material';
import api from '../../utils/api';

const emptyForm = {
    name: '',
    price: '',
    description: '',
    target: 'both',
    features: '',
    recommended: false,
    cta: 'Choose Plan',
    sort_order: 0,
    active: true,
};

const AdminPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, plan: null });
    const [expandedPlan, setExpandedPlan] = useState(null);
    const [subscribers, setSubscribers] = useState([]);

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/admin/plans');
            setPlans(data.plans);
        } catch (err) {
            console.error('Failed to fetch plans:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleOpenDialog = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                name: plan.name,
                price: plan.price,
                description: plan.description || '',
                target: plan.target || 'both',
                features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
                recommended: !!plan.recommended,
                cta: plan.cta || 'Choose Plan',
                sort_order: plan.sort_order || 0,
                active: !!plan.active,
            });
        } else {
            setEditingPlan(null);
            setFormData(emptyForm);
        }
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                sort_order: Number(formData.sort_order),
                features: formData.features
                    ? formData.features.split('\n').map((s) => s.trim()).filter(Boolean)
                    : [],
            };
            if (editingPlan) {
                await api.put(`/api/admin/plans/${editingPlan.id}`, payload);
                setSnackbar({ open: true, message: 'Plan updated successfully', severity: 'success' });
            } else {
                await api.post('/api/admin/plans', payload);
                setSnackbar({ open: true, message: 'Plan created successfully', severity: 'success' });
            }
            setDialogOpen(false);
            fetchPlans();
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Operation failed', severity: 'error' });
        }
    };

    const handleDelete = async () => {
        try {
            const { data } = await api.delete(`/api/admin/plans/${deleteDialog.plan.id}`);
            setSnackbar({ open: true, message: data.message, severity: 'success' });
            setDeleteDialog({ open: false, plan: null });
            fetchPlans();
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
        }
    };

    const handleToggleSubscribers = async (planId) => {
        if (expandedPlan === planId) {
            setExpandedPlan(null);
            setSubscribers([]);
            return;
        }
        try {
            const { data } = await api.get(`/api/admin/plans/${planId}/subscribers`);
            setSubscribers(data.subscribers);
            setExpandedPlan(planId);
        } catch (err) {
            console.error('Failed to fetch subscribers:', err);
        }
    };

    return (
        <Box>
            <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 } }>
                <Typography variant="h5" fontWeight={ 800 } color="#0E0E2E">
                    Plans Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={ <Add /> }
                    onClick={ () => handleOpenDialog() }
                    sx={ { bgcolor: '#03288C', borderRadius: 2, '&:hover': { bgcolor: '#021A66' } } }
                >
                    Add Plan
                </Button>
            </Box>

            <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
                <CardContent sx={ { p: 0 } }>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={ { bgcolor: 'rgba(0,0,0,0.02)' } }>
                                    <TableCell sx={ { fontWeight: 700 } }>S.No</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Name</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Price</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Target</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Subscribers</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Recommended</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Status</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Order</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } } align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                { plans.map((plan, index) => (
                                    <Fragment key={ plan.id }>
                                        <TableRow hover>
                                            <TableCell>{ index + 1 }</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={ 600 }>{ plan.name }</Typography>
                                                { plan.description && (
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        { plan.description }
                                                    </Typography>
                                                ) }
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={ 600 }>₹{ Number(plan.price).toLocaleString() }</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={ plan.target }
                                                    size="small"
                                                    variant="outlined"
                                                    sx={ { fontSize: 11, textTransform: 'capitalize' } }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    startIcon={ expandedPlan === plan.id ? <ExpandLess /> : <ExpandMore /> }
                                                    endIcon={ <People fontSize="small" /> }
                                                    onClick={ () => handleToggleSubscribers(plan.id) }
                                                    sx={ { color: '#03288C', fontSize: 12 } }
                                                >
                                                    { plan.subscriber_count || 0 }
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                { plan.recommended ? (
                                                    <Chip label="Yes" size="small" sx={ { fontWeight: 600, fontSize: 11, bgcolor: '#03288C', color: '#fff' } } />
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">No</Typography>
                                                ) }
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={ plan.active ? 'Active' : 'Inactive' }
                                                    size="small"
                                                    sx={ {
                                                        fontWeight: 600,
                                                        fontSize: 11,
                                                        bgcolor: plan.active ? '#10b981' : '#ef4444',
                                                        color: '#fff',
                                                    } }
                                                />
                                            </TableCell>
                                            <TableCell>{ plan.sort_order }</TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={ () => handleOpenDialog(plan) } sx={ { color: '#1a56c4' } }>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={ () => setDeleteDialog({ open: true, plan }) } sx={ { color: '#d32f2f' } }>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={ 9 } sx={ { p: 0, borderBottom: expandedPlan === plan.id ? undefined : 'none' } }>
                                                <Collapse in={ expandedPlan === plan.id }>
                                                    <Box sx={ { p: 2, bgcolor: 'rgba(3,40,140,0.02)' } }>
                                                        <Typography variant="subtitle2" fontWeight={ 700 } sx={ { mb: 1 } }>
                                                            Active Subscribers
                                                        </Typography>
                                                        { subscribers.length === 0 ? (
                                                            <Typography variant="body2" color="text.secondary">No active subscribers for this plan</Typography>
                                                        ) : (
                                                            <List dense>
                                                                { subscribers.map((sub) => (
                                                                    <ListItem key={ sub.id }>
                                                                        <ListItemAvatar>
                                                                            <Avatar sx={ { bgcolor: '#03288C', width: 32, height: 32, fontSize: 14 } }>
                                                                                { sub.name?.[0]?.toUpperCase() }
                                                                            </Avatar>
                                                                        </ListItemAvatar>
                                                                        <ListItemText
                                                                            primary={ sub.name }
                                                                            secondary={ `${sub.email} · ${sub.role} · Subscribed: ${new Date(sub.subscribed_at).toLocaleDateString()}` }
                                                                        />
                                                                    </ListItem>
                                                                )) }
                                                            </List>
                                                        ) }
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </Fragment>
                                )) }
                                { plans.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={ 9 } align="center" sx={ { py: 6 } }>
                                            <Typography color="text.secondary">No plans found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Create/Edit Plan Dialog */ }
            <Dialog open={ dialogOpen } onClose={ () => setDialogOpen(false) } maxWidth="sm" fullWidth PaperProps={ { sx: { borderRadius: 3 } } }>
                <DialogTitle sx={ { fontWeight: 700 } }>
                    { editingPlan ? 'Edit Plan' : 'Create New Plan' }
                </DialogTitle>
                <DialogContent>
                    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2, mt: 1 } }>
                        <TextField
                            label="Plan Name"
                            fullWidth
                            value={ formData.name }
                            onChange={ (e) => setFormData({ ...formData, name: e.target.value }) }
                        />
                        <TextField
                            label="Price (₹)"
                            type="number"
                            fullWidth
                            value={ formData.price }
                            onChange={ (e) => setFormData({ ...formData, price: e.target.value }) }
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            value={ formData.description }
                            onChange={ (e) => setFormData({ ...formData, description: e.target.value }) }
                        />
                        <TextField
                            label="Target Audience"
                            select
                            fullWidth
                            value={ formData.target }
                            onChange={ (e) => setFormData({ ...formData, target: e.target.value }) }
                        >
                            <MenuItem value="both">Both (Customer & Provider)</MenuItem>
                            <MenuItem value="customer">Customer Only</MenuItem>
                            <MenuItem value="provider">Provider Only</MenuItem>
                        </TextField>
                        <TextField
                            label="Features (one per line)"
                            fullWidth
                            multiline
                            rows={ 5 }
                            value={ formData.features }
                            onChange={ (e) => setFormData({ ...formData, features: e.target.value }) }
                            placeholder="Marketplace access&#10;Monthly analytics&#10;Priority support"
                        />
                        <TextField
                            label="CTA Button Text"
                            fullWidth
                            value={ formData.cta }
                            onChange={ (e) => setFormData({ ...formData, cta: e.target.value }) }
                        />
                        <TextField
                            label="Sort Order"
                            type="number"
                            fullWidth
                            value={ formData.sort_order }
                            onChange={ (e) => setFormData({ ...formData, sort_order: e.target.value }) }
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={ formData.recommended }
                                    onChange={ (e) => setFormData({ ...formData, recommended: e.target.checked }) }
                                />
                            }
                            label="Recommended Plan"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={ formData.active }
                                    onChange={ (e) => setFormData({ ...formData, active: e.target.checked }) }
                                />
                            }
                            label="Active"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={ { p: 2.5 } }>
                    <Button onClick={ () => setDialogOpen(false) }>Cancel</Button>
                    <Button variant="contained" onClick={ handleSubmit } sx={ { bgcolor: '#03288C', '&:hover': { bgcolor: '#021A66' } } }>
                        { editingPlan ? 'Update' : 'Create' }
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */ }
            <Dialog open={ deleteDialog.open } onClose={ () => setDeleteDialog({ open: false, plan: null }) } PaperProps={ { sx: { borderRadius: 3 } } }>
                <DialogTitle sx={ { fontWeight: 700 } }>Delete Plan</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{ deleteDialog.plan?.name }</strong>?
                        Plans with active subscribers will be deactivated instead of deleted.
                    </Typography>
                </DialogContent>
                <DialogActions sx={ { p: 2.5 } }>
                    <Button onClick={ () => setDeleteDialog({ open: false, plan: null }) }>Cancel</Button>
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

export default AdminPlans;
