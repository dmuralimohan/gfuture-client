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
    Avatar,
} from '@mui/material';
import { Edit, Delete, Add, LocalOffer } from '@mui/icons-material';
import api from '../../utils/api';

const emptyForm = {
    title: '',
    description: '',
    discount_percent: '',
    discount_flat: '',
    code: '',
    target: 'both',
    image: '',
    badge: '',
    valid_from: '',
    valid_until: '',
    sort_order: 0,
    active: true,
};

const AdminOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, offer: null });

    const fetchOffers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/admin/offers');
            setOffers(data.offers || []);
        } catch (err) {
            console.error('Failed to fetch offers:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    const handleOpenDialog = (offer = null) => {
        if (offer) {
            setEditingOffer(offer);
            setFormData({
                title: offer.title || '',
                description: offer.description || '',
                discount_percent: offer.discount_percent || '',
                discount_flat: offer.discount_flat || '',
                code: offer.code || '',
                target: offer.target || 'both',
                image: offer.image || '',
                badge: offer.badge || '',
                valid_from: offer.valid_from ? offer.valid_from.slice(0, 10) : '',
                valid_until: offer.valid_until ? offer.valid_until.slice(0, 10) : '',
                sort_order: offer.sort_order || 0,
                active: !!offer.active,
            });
        } else {
            setEditingOffer(null);
            setFormData(emptyForm);
        }
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...formData,
                discount_percent: Number(formData.discount_percent) || 0,
                discount_flat: Number(formData.discount_flat) || 0,
                sort_order: Number(formData.sort_order) || 0,
            };
            if (editingOffer) {
                await api.put(`/api/admin/offers/${editingOffer.id}`, payload);
                setSnackbar({ open: true, message: 'Offer updated successfully', severity: 'success' });
            } else {
                await api.post('/api/admin/offers', payload);
                setSnackbar({ open: true, message: 'Offer created successfully', severity: 'success' });
            }
            setDialogOpen(false);
            fetchOffers();
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Operation failed', severity: 'error' });
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/api/admin/offers/${deleteDialog.offer.id}`);
            setSnackbar({ open: true, message: 'Offer deleted successfully', severity: 'success' });
            setDeleteDialog({ open: false, offer: null });
            fetchOffers();
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
        }
    };

    return (
        <Box>
            <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 } }>
                <Typography variant="h5" fontWeight={ 800 } color="#0E0E2E">
                    Offers Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={ <Add /> }
                    onClick={ () => handleOpenDialog() }
                    sx={ { bgcolor: '#03288C', borderRadius: 2, '&:hover': { bgcolor: '#021A66' } } }
                >
                    Add Offer
                </Button>
            </Box>

            <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
                <CardContent sx={ { p: 0 } }>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={ { bgcolor: 'rgba(0,0,0,0.02)' } }>
                                    <TableCell sx={ { fontWeight: 700 } }>ID</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Offer</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Discount</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Code</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Target</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Badge</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Status</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } } align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                { offers.map((offer) => (
                                    <TableRow key={ offer.id } hover>
                                        <TableCell>{ offer.id }</TableCell>
                                        <TableCell>
                                            <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
                                                { offer.image ? (
                                                    <Avatar
                                                        src={ offer.image }
                                                        variant="rounded"
                                                        sx={ { width: 40, height: 40 } }
                                                    />
                                                ) : (
                                                    <Avatar variant="rounded" sx={ { width: 40, height: 40, bgcolor: '#ec489915', color: '#ec4899' } }>
                                                        <LocalOffer fontSize="small" />
                                                    </Avatar>
                                                ) }
                                                <Box>
                                                    <Typography variant="body2" fontWeight={ 600 }>{ offer.title }</Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={ { display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }>
                                                        { offer.description }
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            { offer.discount_percent > 0 && (
                                                <Chip label={ `${offer.discount_percent}%` } size="small" sx={ { fontWeight: 700, bgcolor: '#10b98115', color: '#059669', mr: 0.5 } } />
                                            ) }
                                            { offer.discount_flat > 0 && (
                                                <Chip label={ `₹${offer.discount_flat}` } size="small" sx={ { fontWeight: 700, bgcolor: '#d9770615', color: '#d97706' } } />
                                            ) }
                                        </TableCell>
                                        <TableCell>
                                            { offer.code ? (
                                                <Typography variant="body2" fontWeight={ 700 } sx={ { fontFamily: 'monospace', color: '#03288C' } }>
                                                    { offer.code }
                                                </Typography>
                                            ) : '—' }
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={ offer.target } size="small" variant="outlined" sx={ { fontSize: 11, textTransform: 'capitalize' } } />
                                        </TableCell>
                                        <TableCell>
                                            { offer.badge ? (
                                                <Chip label={ offer.badge } size="small" sx={ { fontWeight: 700, fontSize: 10, bgcolor: '#ffd700', color: '#0E0E2E' } } />
                                            ) : '—' }
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={ offer.active ? 'Active' : 'Inactive' }
                                                size="small"
                                                sx={ { fontWeight: 600, fontSize: 11, bgcolor: offer.active ? '#10b981' : '#ef4444', color: '#fff' } }
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={ () => handleOpenDialog(offer) } sx={ { color: '#1a56c4' } }>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={ () => setDeleteDialog({ open: true, offer }) } sx={ { color: '#d32f2f' } }>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                )) }
                                { offers.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={ 8 } align="center" sx={ { py: 6 } }>
                                            <Typography color="text.secondary">No offers found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Create/Edit Offer Dialog */ }
            <Dialog open={ dialogOpen } onClose={ () => setDialogOpen(false) } maxWidth="sm" fullWidth PaperProps={ { sx: { borderRadius: 3 } } }>
                <DialogTitle sx={ { fontWeight: 700 } }>
                    { editingOffer ? 'Edit Offer' : 'Create New Offer' }
                </DialogTitle>
                <DialogContent>
                    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2, mt: 1 } }>
                        <TextField label="Title" fullWidth value={ formData.title } onChange={ (e) => setFormData({ ...formData, title: e.target.value }) } />
                        <TextField label="Description" fullWidth multiline rows={ 2 } value={ formData.description } onChange={ (e) => setFormData({ ...formData, description: e.target.value }) } />
                        <Box sx={ { display: 'flex', gap: 2 } }>
                            <TextField label="Discount %" type="number" fullWidth value={ formData.discount_percent } onChange={ (e) => setFormData({ ...formData, discount_percent: e.target.value }) } />
                            <TextField label="Flat Discount (₹)" type="number" fullWidth value={ formData.discount_flat } onChange={ (e) => setFormData({ ...formData, discount_flat: e.target.value }) } />
                        </Box>
                        <TextField label="Promo Code" fullWidth value={ formData.code } placeholder="e.g. WELCOME20" onChange={ (e) => setFormData({ ...formData, code: e.target.value.toUpperCase() }) } />
                        <TextField label="Target Audience" select fullWidth value={ formData.target } onChange={ (e) => setFormData({ ...formData, target: e.target.value }) }>
                            <MenuItem value="both">Both (Customer & Provider)</MenuItem>
                            <MenuItem value="customer">Customer Only</MenuItem>
                            <MenuItem value="provider">Provider Only</MenuItem>
                        </TextField>
                        <TextField label="Badge Text" fullWidth value={ formData.badge } placeholder="e.g. NEW USER, LIMITED TIME" onChange={ (e) => setFormData({ ...formData, badge: e.target.value }) } />
                        <TextField label="Image URL" fullWidth value={ formData.image } onChange={ (e) => setFormData({ ...formData, image: e.target.value }) } />
                        <Box sx={ { display: 'flex', gap: 2 } }>
                            <TextField label="Valid From" type="date" fullWidth value={ formData.valid_from } onChange={ (e) => setFormData({ ...formData, valid_from: e.target.value }) } slotProps={ { inputLabel: { shrink: true } } } />
                            <TextField label="Valid Until" type="date" fullWidth value={ formData.valid_until } onChange={ (e) => setFormData({ ...formData, valid_until: e.target.value }) } slotProps={ { inputLabel: { shrink: true } } } />
                        </Box>
                        <TextField label="Sort Order" type="number" fullWidth value={ formData.sort_order } onChange={ (e) => setFormData({ ...formData, sort_order: e.target.value }) } />
                        <FormControlLabel
                            control={ <Switch checked={ formData.active } onChange={ (e) => setFormData({ ...formData, active: e.target.checked }) } /> }
                            label="Active"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={ { p: 2.5 } }>
                    <Button onClick={ () => setDialogOpen(false) }>Cancel</Button>
                    <Button variant="contained" onClick={ handleSubmit } sx={ { bgcolor: '#03288C', '&:hover': { bgcolor: '#021A66' } } }>
                        { editingOffer ? 'Update' : 'Create' }
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */ }
            <Dialog open={ deleteDialog.open } onClose={ () => setDeleteDialog({ open: false, offer: null }) } PaperProps={ { sx: { borderRadius: 3 } } }>
                <DialogTitle sx={ { fontWeight: 700 } }>Delete Offer</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{ deleteDialog.offer?.title }</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={ { p: 2.5 } }>
                    <Button onClick={ () => setDeleteDialog({ open: false, offer: null }) }>Cancel</Button>
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

export default AdminOffers;
