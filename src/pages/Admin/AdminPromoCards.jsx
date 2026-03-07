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
    Alert,
    Snackbar,
    Switch,
    FormControlLabel,
    Avatar,
} from '@mui/material';
import { Edit, Delete, Add, ViewCarousel } from '@mui/icons-material';
import api from '../../utils/api';

const defaultBgs = [
    'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
    'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
    'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
];

const emptyForm = {
    title: '',
    subtitle: '',
    description: '',
    cta: 'Book now',
    bg: defaultBgs[0],
    image: '',
    link: '/services',
    sort_order: 0,
    active: true,
};

const AdminPromoCards = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, card: null });

    const fetchCards = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/admin/promo-cards');
            setCards(data.promoCards || []);
        } catch (err) {
            console.error('Failed to fetch promo cards:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    const handleOpenDialog = (card = null) => {
        if (card) {
            setEditingCard(card);
            setFormData({
                title: card.title || '',
                subtitle: card.subtitle || '',
                description: card.description || '',
                cta: card.cta || 'Book now',
                bg: card.bg || defaultBgs[0],
                image: card.image || '',
                link: card.link || '/services',
                sort_order: card.sort_order || 0,
                active: !!card.active,
            });
        } else {
            setEditingCard(null);
            setFormData(emptyForm);
        }
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...formData,
                sort_order: Number(formData.sort_order) || 0,
            };
            if (editingCard) {
                await api.put(`/api/admin/promo-cards/${editingCard.id}`, payload);
                setSnackbar({ open: true, message: 'Promo card updated', severity: 'success' });
            } else {
                await api.post('/api/admin/promo-cards', payload);
                setSnackbar({ open: true, message: 'Promo card created', severity: 'success' });
            }
            setDialogOpen(false);
            fetchCards();
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Operation failed', severity: 'error' });
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/api/admin/promo-cards/${deleteDialog.card.id}`);
            setSnackbar({ open: true, message: 'Promo card deleted', severity: 'success' });
            setDeleteDialog({ open: false, card: null });
            fetchCards();
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
        }
    };

    return (
        <Box>
            <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 } }>
                <Box>
                    <Typography variant="h5" fontWeight={ 800 } color="#0E0E2E" sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                        <ViewCarousel /> Home Page Promo Cards
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Edit the promotional cards shown on the home page (deep clean, festival season, sale live, etc.)
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={ <Add /> }
                    onClick={ () => handleOpenDialog() }
                    sx={ { bgcolor: '#03288C', borderRadius: 2, '&:hover': { bgcolor: '#021A66' } } }
                >
                    Add Promo Card
                </Button>
            </Box>

            <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' } }>
                <CardContent sx={ { p: 0 } }>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={ { bgcolor: 'rgba(0,0,0,0.02)' } }>
                                    <TableCell sx={ { fontWeight: 700 } }>Preview</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Title</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Subtitle</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>CTA</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Order</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } }>Status</TableCell>
                                    <TableCell sx={ { fontWeight: 700 } } align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                { cards.map((card) => (
                                    <TableRow key={ card.id } hover>
                                        <TableCell>
                                            <Box
                                                sx={ {
                                                    width: 80,
                                                    height: 50,
                                                    borderRadius: 1.5,
                                                    background: card.bg,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden',
                                                } }
                                            >
                                                { card.image && (
                                                    <Box component="img" src={ card.image } alt="" sx={ { width: '100%', height: '100%', objectFit: 'cover' } } />
                                                ) }
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={ 600 }>{ card.title }</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">{ card.subtitle }</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={ card.cta } size="small" variant="outlined" sx={ { fontSize: 11 } } />
                                        </TableCell>
                                        <TableCell>{ card.sort_order }</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={ card.active ? 'Active' : 'Inactive' }
                                                size="small"
                                                sx={ {
                                                    fontWeight: 600, fontSize: 11,
                                                    bgcolor: card.active ? '#10b981' : '#ef4444', color: '#fff',
                                                } }
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={ () => handleOpenDialog(card) } sx={ { color: '#1a56c4' } }>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={ () => setDeleteDialog({ open: true, card }) } sx={ { color: '#d32f2f' } }>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                )) }
                                { cards.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={ 7 } align="center" sx={ { py: 6 } }>
                                            <Typography color="text.secondary">No promo cards yet. Add your first one!</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */ }
            <Dialog open={ dialogOpen } onClose={ () => setDialogOpen(false) } maxWidth="sm" fullWidth PaperProps={ { sx: { borderRadius: 3 } } }>
                <DialogTitle sx={ { fontWeight: 700 } }>
                    { editingCard ? 'Edit Promo Card' : 'Create New Promo Card' }
                </DialogTitle>
                <DialogContent>
                    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2, mt: 1 } }>
                        <TextField label="Title" fullWidth value={ formData.title }
                            placeholder="e.g. 2X Cooling, RO Water Purifiers"
                            onChange={ (e) => setFormData({ ...formData, title: e.target.value }) } />
                        <TextField label="Subtitle" fullWidth value={ formData.subtitle }
                            placeholder="e.g. Deep clean, zero hassle"
                            onChange={ (e) => setFormData({ ...formData, subtitle: e.target.value }) } />
                        <TextField label="Description" fullWidth value={ formData.description }
                            placeholder="e.g. From ₹AC service"
                            onChange={ (e) => setFormData({ ...formData, description: e.target.value }) } />
                        <TextField label="CTA Button Text" fullWidth value={ formData.cta }
                            placeholder="e.g. Book now, Buy now, Shop now"
                            onChange={ (e) => setFormData({ ...formData, cta: e.target.value }) } />
                        <TextField label="Link / URL" fullWidth value={ formData.link }
                            placeholder="e.g. /services, /services?category=1"
                            onChange={ (e) => setFormData({ ...formData, link: e.target.value }) } />
                        <TextField label="Image URL" fullWidth value={ formData.image }
                            placeholder="https://images.unsplash.com/..."
                            onChange={ (e) => setFormData({ ...formData, image: e.target.value }) } />
                        <TextField label="Background CSS" fullWidth value={ formData.bg }
                            placeholder="linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                            onChange={ (e) => setFormData({ ...formData, bg: e.target.value }) } />
                        <Box sx={ { display: 'flex', gap: 1, flexWrap: 'wrap' } }>
                            { defaultBgs.map((bg, i) => (
                                <Box
                                    key={ i }
                                    onClick={ () => setFormData({ ...formData, bg }) }
                                    sx={ {
                                        width: 36, height: 36, borderRadius: 1.5, background: bg, cursor: 'pointer',
                                        border: formData.bg === bg ? '3px solid #03288C' : '2px solid transparent',
                                        '&:hover': { transform: 'scale(1.1)' },
                                        transition: 'all 0.2s',
                                    } }
                                />
                            )) }
                        </Box>
                        <TextField label="Sort Order" type="number" fullWidth value={ formData.sort_order }
                            onChange={ (e) => setFormData({ ...formData, sort_order: e.target.value }) } />
                        { editingCard && (
                            <FormControlLabel
                                control={ <Switch checked={ !!formData.active } onChange={ (e) => setFormData({ ...formData, active: e.target.checked }) } /> }
                                label="Active"
                            />
                        ) }

                        {/* Preview */ }
                        <Box sx={ { mt: 1 } }>
                            <Typography variant="caption" fontWeight={ 600 } color="text.secondary" sx={ { mb: 1, display: 'block' } }>
                                PREVIEW
                            </Typography>
                            <Box
                                sx={ {
                                    background: formData.bg,
                                    borderRadius: 3,
                                    p: 2.5,
                                    display: 'flex',
                                    minHeight: 120,
                                    overflow: 'hidden',
                                } }
                            >
                                <Box sx={ { flex: 1 } }>
                                    <Typography variant="overline" sx={ { fontWeight: 700, letterSpacing: '0.1em', color: '#03288C' } }>
                                        { formData.title || 'Title' }
                                    </Typography>
                                    <Typography variant="h6" sx={ { fontWeight: 700, mb: 0.5 } }>
                                        { formData.subtitle || 'Subtitle' }
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        { formData.description || 'Description' }
                                    </Typography>
                                    <Chip
                                        label={ formData.cta || 'CTA' }
                                        size="small"
                                        sx={ { mt: 1.5, bgcolor: '#03288C', color: '#fff', fontWeight: 600 } }
                                    />
                                </Box>
                                { formData.image && (
                                    <Box sx={ { width: 100, overflow: 'hidden', borderRadius: 2 } }>
                                        <Box component="img" src={ formData.image } alt="" sx={ { width: '100%', height: '100%', objectFit: 'cover' } } />
                                    </Box>
                                ) }
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={ { p: 2.5 } }>
                    <Button onClick={ () => setDialogOpen(false) }>Cancel</Button>
                    <Button variant="contained" onClick={ handleSubmit } sx={ { bgcolor: '#03288C', '&:hover': { bgcolor: '#021A66' } } }>
                        { editingCard ? 'Update' : 'Create' }
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */ }
            <Dialog open={ deleteDialog.open } onClose={ () => setDeleteDialog({ open: false, card: null }) } PaperProps={ { sx: { borderRadius: 3 } } }>
                <DialogTitle sx={ { fontWeight: 700 } }>Delete Promo Card</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete &quot;<strong>{ deleteDialog.card?.title } — { deleteDialog.card?.subtitle }</strong>&quot;?
                    </Typography>
                </DialogContent>
                <DialogActions sx={ { p: 2.5 } }>
                    <Button onClick={ () => setDeleteDialog({ open: false, card: null }) }>Cancel</Button>
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

export default AdminPromoCards;
