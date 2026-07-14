import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Alert,
    Snackbar,
    Divider,
    InputAdornment,
    Grid,
    IconButton,
    Chip,
} from '@mui/material';
import { Save, Delete, Add, Settings } from '@mui/icons-material';
import api from '../../utils/api';

const AdminSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // New custom fee state
    const [newFeeLabel, setNewFeeLabel] = useState('');
    const [newFeeAmount, setNewFeeAmount] = useState('');

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/admin/settings');
            setSettings(data.settings || []);
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const getVal = (key) => settings.find((s) => s.key === key)?.value || '';

    const setVal = (key, value) => {
        setSettings((prev) =>
            prev.map((s) => (s.key === key ? { ...s, value } : s))
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/api/admin/settings', { settings });
            setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Save failed', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleAddCustomFee = async () => {
        if (!newFeeLabel.trim()) return;
        try {
            const key = `custom_fee_${Date.now()}`;
            await api.post('/api/admin/settings/fee', {
                key,
                label: newFeeLabel.trim(),
                value: Number(newFeeAmount) || 0,
            });
            setNewFeeLabel('');
            setNewFeeAmount('');
            setSnackbar({ open: true, message: 'Custom fee added', severity: 'success' });
            fetchSettings();
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to add fee', severity: 'error' });
        }
    };

    const handleDeleteFee = async (key) => {
        try {
            await api.delete(`/api/admin/settings/${key}`);
            setSnackbar({ open: true, message: 'Fee removed', severity: 'success' });
            fetchSettings();
        } catch (err) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
        }
    };

    const customFees = settings.filter((s) => s.key.startsWith('custom_fee_'));

    return (
        <Box>
            <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 } }>
                <Box>
                    <Typography variant="h5" fontWeight={ 800 } color="#0E0E2E" sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                        <Settings /> Platform Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage platform fees, extra charges, and other configurations
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={ <Save /> }
                    onClick={ handleSave }
                    disabled={ saving || loading }
                    sx={ { color: '#ffffff', bgcolor: '#03288C', borderRadius: 2, '&:hover': { bgcolor: '#021A66' } } }
                >
                    { saving ? 'Saving...' : 'Save Changes' }
                </Button>
            </Box>

            {/* Platform Fee */ }
            <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none', mb: 3 } }>
                <CardContent sx={ { p: 3 } }>
                    <Typography variant="h6" fontWeight={ 700 } sx={ { mb: 2 } }>
                        Platform Fee
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={ { mb: 3 } }>
                        This percentage is charged on every order. It is applied to the subtotal after any coupon discounts.
                    </Typography>
                    <TextField
                        label="GST Charges Rate"
                        type="number"
                        value={ getVal('platform_fee_rate') }
                        onChange={ (e) => setVal('platform_fee_rate', e.target.value) }
                        InputProps={ {
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        } }
                        inputProps={ { step: '0.01', min: '0', max: '100' } }
                        sx={ { maxWidth: 300, '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                    />
                </CardContent>
            </Card>

            {/* Extra Fee */ }
            <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none', mb: 3 } }>
                <CardContent sx={ { p: 3 } }>
                    <Typography variant="h6" fontWeight={ 700 } sx={ { mb: 2 } }>
                        Extra Fee
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={ { mb: 3 } }>
                        A fixed additional fee charged on every order (e.g., convenience fee, service tax, etc.). Leave empty to disable.
                    </Typography>
                    <Grid container spacing={ 2 }>
                        <Grid item xs={ 12 } sm={ 6 }>
                            <TextField
                                fullWidth
                                label="Fee Label"
                                placeholder="e.g. Convenience Fee, Service Tax"
                                value={ getVal('extra_fee_label') }
                                onChange={ (e) => setVal('extra_fee_label', e.target.value) }
                                sx={ { '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                            />
                        </Grid>
                        <Grid item xs={ 12 } sm={ 6 }>
                            <TextField
                                fullWidth
                                label="Fee Amount"
                                type="number"
                                value={ getVal('extra_fee_amount') }
                                onChange={ (e) => setVal('extra_fee_amount', e.target.value) }
                                InputProps={ {
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                } }
                                inputProps={ { step: '0.01', min: '0' } }
                                sx={ { '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Custom Additional Fees */ }
            <Card sx={ { borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none', mb: 3 } }>
                <CardContent sx={ { p: 3 } }>
                    <Typography variant="h6" fontWeight={ 700 } sx={ { mb: 2 } }>
                        Custom Additional Fees
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={ { mb: 3 } }>
                        Add any additional custom fees that should appear on orders.
                    </Typography>

                    { customFees.length > 0 && (
                        <Box sx={ { mb: 3 } }>
                            { customFees.map((fee) => (
                                <Box
                                    key={ fee.key }
                                    sx={ {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 1.5,
                                        mb: 1,
                                        borderRadius: 2,
                                        bgcolor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                    } }
                                >
                                    <Box sx={ { flex: 1 } }>
                                        <Typography variant="body2" fontWeight={ 600 }>{ fee.label }</Typography>
                                    </Box>
                                    <Chip label={ `₹${fee.value}` } size="small" sx={ { fontWeight: 700, bgcolor: '#eaf1fb', color: '#03288C' } } />
                                    <IconButton size="small" onClick={ () => handleDeleteFee(fee.key) } sx={ { color: '#d32f2f' } }>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Box>
                            )) }
                        </Box>
                    ) }

                    <Divider sx={ { my: 2 } } />
                    <Typography variant="subtitle2" fontWeight={ 600 } sx={ { mb: 1.5 } }>
                        Add New Custom Fee
                    </Typography>
                    <Box sx={ { display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' } }>
                        <TextField
                            size="small"
                            label="Fee Name"
                            placeholder="e.g. GST, Service Charge"
                            value={ newFeeLabel }
                            onChange={ (e) => setNewFeeLabel(e.target.value) }
                            sx={ { flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                        />
                        <TextField
                            size="small"
                            label="Amount"
                            type="number"
                            value={ newFeeAmount }
                            onChange={ (e) => setNewFeeAmount(e.target.value) }
                            InputProps={ { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }
                            inputProps={ { step: '0.01', min: '0' } }
                            sx={ { width: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } } }
                        />
                        <Button
                            variant="contained"
                            startIcon={ <Add /> }
                            onClick={ handleAddCustomFee }
                            disabled={ !newFeeLabel.trim() }
                            sx={ { color: '#ffffff !important', bgcolor: '#03288C', borderRadius: 2, '&:hover': { bgcolor: '#021A66' } } }
                        >
                            Add Fee
                        </Button>
                    </Box>
                </CardContent>
            </Card>

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

export default AdminSettings;
