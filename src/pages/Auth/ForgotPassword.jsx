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
} from '@mui/material';
import {
    Phone,
    Sms,
    Lock,
    Visibility,
    VisibilityOff,
    CheckCircle,
} from '@mui/icons-material';
import api from '../../utils/api';

const STEP = {
    PHONE: 0,
    OTP: 1,
    RESET: 2,
    DONE: 3,
};

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(STEP.PHONE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [form, setForm] = useState({
        phone: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSendCode = async () => {
        const cleanPhone = form.phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.post('/api/auth/forgot-password', { phone: cleanPhone });
            setSuccess('Verification code sent to your phone');
            setStep(STEP.OTP);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtpStep = () => {
        const cleanOtp = form.otp.replace(/\D/g, '');
        if (cleanOtp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }
        setForm((prev) => ({ ...prev, otp: cleanOtp }));
        setStep(STEP.RESET);
        setError('');
        setSuccess('OTP accepted. Set your new password.');
    };

    const handleResetPassword = async () => {
        const cleanPhone = form.phone.replace(/\D/g, '');
        const cleanOtp = form.otp.replace(/\D/g, '');

        if (cleanOtp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            setStep(STEP.OTP);
            return;
        }
        if (form.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.post('/api/auth/reset-password', {
                phone: cleanPhone,
                otp: cleanOtp,
                newPassword: form.newPassword,
            });
            setStep(STEP.DONE);
            setSuccess('Password reset successful. You can sign in now.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

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
                            <Box sx={ { textAlign: 'center', mb: 4 } }>
                                <Box
                                    component="img"
                                    src="/logo-header.png"
                                    alt="G-Future"
                                    sx={ { height: 44, width: 'auto', mx: 'auto', mb: 2, display: 'block' } }
                                />
                                <Typography variant="h4" fontWeight={ 800 }>
                                    Forgot Password
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={ { mt: 1 } }>
                                    { step === STEP.PHONE && 'Enter your phone number to receive an OTP' }
                                    { step === STEP.OTP && 'Enter the 6-digit OTP sent to your phone' }
                                    { step === STEP.RESET && 'Create your new password' }
                                    { step === STEP.DONE && 'Your password has been reset successfully' }
                                </Typography>
                            </Box>

                            { error && (
                                <Alert severity="error" sx={ { mb: 3, borderRadius: 2 } }>
                                    { error }
                                </Alert>
                            ) }

                            { success && (
                                <Alert severity="success" sx={ { mb: 3, borderRadius: 2 } }>
                                    { success }
                                </Alert>
                            ) }

                            { step === STEP.PHONE && (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        name="phone"
                                        value={ form.phone }
                                        onChange={ handleChange }
                                        placeholder="0123456789"
                                        sx={ { mb: 3 } }
                                        InputProps={ {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Phone sx={ { color: '#5a6a80' } } />
                                                </InputAdornment>
                                            ),
                                        } }
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={ handleSendCode }
                                        disabled={ loading }
                                        sx={ {
                                            bgcolor: '#03288C',
                                            borderRadius: '6px',
                                            py: 1.5,
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            '&:hover': { bgcolor: '#021A66' },
                                        } }
                                    >
                                        { loading ? 'Sending...' : 'Send OTP' }
                                    </Button>
                                </>
                            ) }

                            { step === STEP.OTP && (
                                <>
                                    <TextField
                                        fullWidth
                                        label="OTP"
                                        name="otp"
                                        value={ form.otp }
                                        onChange={ (e) => {
                                            const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setForm({ ...form, otp: clean });
                                            setError('');
                                        } }
                                        placeholder="Enter 6-digit OTP"
                                        sx={ { mb: 2 } }
                                        InputProps={ {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Sms sx={ { color: '#5a6a80' } } />
                                                </InputAdornment>
                                            ),
                                        } }
                                    />
                                    <Box sx={ { display: 'flex', gap: 1.5 } }>
                                        <Button
                                            variant="outlined"
                                            onClick={ handleSendCode }
                                            disabled={ loading }
                                            sx={ { borderRadius: '6px', fontWeight: 700 } }
                                        >
                                            Resend OTP
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={ handleVerifyOtpStep }
                                            sx={ {
                                                bgcolor: '#22c55e',
                                                borderRadius: '6px',
                                                fontWeight: 700,
                                                '&:hover': { bgcolor: '#16a34a' },
                                            } }
                                        >
                                            Verify OTP
                                        </Button>
                                    </Box>
                                </>
                            ) }

                            { step === STEP.RESET && (
                                <>
                                    <TextField
                                        fullWidth
                                        label="New Password"
                                        name="newPassword"
                                        type={ showPassword ? 'text' : 'password' }
                                        value={ form.newPassword }
                                        onChange={ handleChange }
                                        sx={ { mb: 2 } }
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

                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type={ showConfirmPassword ? 'text' : 'password' }
                                        value={ form.confirmPassword }
                                        onChange={ handleChange }
                                        sx={ { mb: 3 } }
                                        InputProps={ {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock sx={ { color: '#5a6a80' } } />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={ () => setShowConfirmPassword(!showConfirmPassword) } edge="end">
                                                        { showConfirmPassword ? <VisibilityOff /> : <Visibility /> }
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        } }
                                    />

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={ handleResetPassword }
                                        disabled={ loading }
                                        sx={ {
                                            bgcolor: '#03288C',
                                            borderRadius: '6px',
                                            py: 1.5,
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            '&:hover': { bgcolor: '#021A66' },
                                        } }
                                    >
                                        { loading ? 'Resetting...' : 'Reset Password' }
                                    </Button>
                                </>
                            ) }

                            { step === STEP.DONE && (
                                <Box sx={ { textAlign: 'center' } }>
                                    <CheckCircle sx={ { color: '#22c55e', fontSize: 54, mb: 1 } } />
                                    <Typography variant="body1" sx={ { mb: 3 } }>
                                        Your password was changed successfully.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={ () => navigate('/login') }
                                        sx={ {
                                            bgcolor: '#03288C',
                                            borderRadius: '6px',
                                            px: 3,
                                            fontWeight: 700,
                                            '&:hover': { bgcolor: '#021A66' },
                                        } }
                                    >
                                        Back to Login
                                    </Button>
                                </Box>
                            ) }

                            <Divider sx={ { my: 3 } } />

                            <Typography variant="body2" sx={ { textAlign: 'center', color: '#5a6a80' } }>
                                Remember your password?{ ' ' }
                                <Box
                                    component={ Link }
                                    to="/login"
                                    sx={ { color: '#03288C', fontWeight: 600, textDecoration: 'none' } }
                                >
                                    Sign in
                                </Box>
                            </Typography>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
};

export default ForgotPassword;