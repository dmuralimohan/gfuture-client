import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Alert,
    InputAdornment,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Lock,
    DeleteForever,
    WarningAmber,
    FiberManualRecord,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const DeleteAccount = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Redirect if not logged in
    if (!isAuthenticated) {
        return (
            <Box
                sx={ {
                    minHeight: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    py: 6,
                    background: 'linear-gradient(135deg, #eaf1fb 0%, #f0f5ff 100%)',
                } }
            >
                <Container maxWidth="sm">
                    <Card sx={ { borderRadius: 4, boxShadow: '0 8px 40px rgba(15,43,102,0.08)' } }>
                        <CardContent sx={ { p: { xs: 3, md: 5 }, textAlign: 'center' } }>
                            <Typography variant="h6" fontWeight={ 700 } mb={ 2 }>
                                You must be logged in to delete your account.
                            </Typography>
                            <Button
                                component={ Link }
                                to="/login"
                                variant="contained"
                                sx={ { bgcolor: '#03288C', borderRadius: '6px', '&:hover': { bgcolor: '#021A66' } } }
                            >
                                Sign In
                            </Button>
                        </CardContent>
                    </Card>
                </Container>
            </Box>
        );
    }

    const handleRequestDelete = (e) => {
        e.preventDefault();
        if (!password) {
            setError('Please enter your password to continue.');
            return;
        }
        setError('');
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        setConfirmOpen(false);
        setLoading(true);
        try {
            await api.delete('/api/auth/account', { data: { password } });
            await logout();
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const consequences = [
        'Your profile and personal information will be permanently removed.',
        'All your orders and order history will be deleted.',
        'Your wallet balance and credit points will be forfeited.',
        'Any active plan subscriptions will be cancelled.',
        'This action cannot be undone.',
    ];

    return (
        <Box
            sx={ {
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                py: 6,
                background: 'linear-gradient(135deg, #eaf1fb 0%, #f0f5ff 100%)',
            } }
        >
            <Container maxWidth="sm">
                <motion.div
                    initial={ { opacity: 0, y: 40 } }
                    animate={ { opacity: 1, y: 0 } }
                    transition={ { duration: 0.6 } }
                >
                    <Card sx={ { borderRadius: 4, boxShadow: '0 8px 40px rgba(15,43,102,0.08)' } }>
                        <CardContent sx={ { p: { xs: 3, md: 5 } } }>
                            {/* Header */ }
                            <Box sx={ { textAlign: 'center', mb: 3 } }>
                                <Box
                                    component="img"
                                    src="/logo-header.png"
                                    alt="G-Future"
                                    sx={ { height: 44, width: 'auto', mx: 'auto', mb: 2, display: 'block' } }
                                />
                                <Box
                                    sx={ {
                                        width: 56,
                                        height: 56,
                                        borderRadius: '50%',
                                        bgcolor: '#fff3f3',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 2,
                                    } }
                                >
                                    <DeleteForever sx={ { fontSize: 30, color: '#d32f2f' } } />
                                </Box>
                                <Typography variant="h5" fontWeight={ 800 } color="#0E0E2E">
                                    Delete Account
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={ { mt: 1 } }>
                                    Signed in as <strong>{ user?.email }</strong>
                                </Typography>
                            </Box>

                            {/* Warning box */ }
                            <Box
                                sx={ {
                                    bgcolor: '#fff8e1',
                                    border: '1px solid #ffe082',
                                    borderRadius: 2,
                                    p: 2,
                                    mb: 3,
                                    display: 'flex',
                                    gap: 1.5,
                                    alignItems: 'flex-start',
                                } }
                            >
                                <WarningAmber sx={ { color: '#f57c00', mt: 0.2, flexShrink: 0 } } />
                                <Box>
                                    <Typography variant="body2" fontWeight={ 700 } color="#7c4f00" mb={ 0.5 }>
                                        This action is permanent and irreversible.
                                    </Typography>
                                    <List dense disablePadding>
                                        { consequences.map((item, i) => (
                                            <ListItem key={ i } disableGutters sx={ { py: 0.2 } }>
                                                <ListItemIcon sx={ { minWidth: 20 } }>
                                                    <FiberManualRecord sx={ { fontSize: 7, color: '#7c4f00' } } />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={ item }
                                                    primaryTypographyProps={ { variant: 'caption', color: '#7c4f00' } }
                                                />
                                            </ListItem>
                                        )) }
                                    </List>
                                </Box>
                            </Box>

                            { error && (
                                <Alert severity="error" sx={ { mb: 3, borderRadius: 2 } }>
                                    { error }
                                </Alert>
                            ) }

                            <form onSubmit={ handleRequestDelete }>
                                <Typography variant="body2" color="text.secondary" mb={ 1 }>
                                    Enter your password to confirm:
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type={ showPassword ? 'text' : 'password' }
                                    value={ password }
                                    onChange={ (e) => { setPassword(e.target.value); setError(''); } }
                                    sx={ { mb: 3 } }
                                    InputProps={ {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock sx={ { color: '#5a6a80' } } />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={ () => setShowPassword(!showPassword) } edge="end">
                                                    { showPassword ? <VisibilityOff /> : <Visibility /> }
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    } }
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={ loading }
                                    fullWidth
                                    sx={ {
                                        bgcolor: '#d32f2f',
                                        borderRadius: '6px',
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        '&:hover': { bgcolor: '#b71c1c' },
                                    } }
                                    startIcon={ <DeleteForever /> }
                                >
                                    { loading ? 'Deleting account…' : 'Delete My Account' }
                                </Button>
                            </form>

                            <Divider sx={ { my: 3 } } />

                            <Typography variant="body2" sx={ { textAlign: 'center', color: '#5a6a80' } }>
                                Changed your mind?{ ' ' }
                                <Box
                                    component={ Link }
                                    to="/profile"
                                    sx={ { color: '#03288C', fontWeight: 600, textDecoration: 'none' } }
                                >
                                    Go back to Profile
                                </Box>
                            </Typography>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>

            {/* Final confirmation dialog */ }
            <Dialog
                open={ confirmOpen }
                onClose={ () => setConfirmOpen(false) }
                PaperProps={ { sx: { borderRadius: 3, p: 1 } } }
            >
                <DialogTitle sx={ { fontWeight: 800, color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 1 } }>
                    <WarningAmber /> Confirm Account Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you absolutely sure you want to delete your account? All your data will be
                        permanently erased and <strong>cannot be recovered</strong>.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={ { px: 3, pb: 2, gap: 1 } }>
                    <Button
                        onClick={ () => setConfirmOpen(false) }
                        variant="outlined"
                        sx={ { borderRadius: '6px', color: '#03288C', borderColor: '#03288C' } }
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={ handleConfirmDelete }
                        variant="contained"
                        sx={ { bgcolor: '#d32f2f', borderRadius: '6px', '&:hover': { bgcolor: '#b71c1c' } } }
                        startIcon={ <DeleteForever /> }
                    >
                        Yes, Delete Account
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DeleteAccount;
