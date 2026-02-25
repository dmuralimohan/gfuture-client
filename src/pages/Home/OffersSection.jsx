import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
    IconButton,
    Tooltip,
    Container,
} from '@mui/material';
import { ContentCopy, LocalOffer, ArrowForward, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const MotionCard = motion.create(Card);

const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

const OffersSection = () => {
    const [offers, setOffers] = useState([]);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const { data } = await api.cachedGet('/api/offers');
                setOffers(data.offers || []);
            } catch {
                // Silently fail — section simply won't render
            }
        };
        fetchOffers();
    }, []);

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (offers.length === 0) return null;

    return (
        <Box sx={ { py: { xs: 6, md: 10 }, bgcolor: '#faf9ff' } }>
            <Container maxWidth="lg">
                {/* Section Header */ }
                <Box sx={ { textAlign: 'center', mb: 6 } }>
                    <Chip
                        icon={ <LocalOffer sx={ { fontSize: 16 } } /> }
                        label="EXCLUSIVE OFFERS"
                        sx={ {
                            mb: 2,
                            fontWeight: 700,
                            fontSize: 12,
                            bgcolor: '#ec489915',
                            color: '#ec4899',
                            letterSpacing: 1,
                            border: '1px solid #ec489930',
                        } }
                    />
                    <Typography
                        variant="h3"
                        fontWeight={ 900 }
                        sx={ {
                            color: '#0E0E2E',
                            mb: 1.5,
                            fontSize: { xs: '1.8rem', md: '2.5rem' },
                        } }
                    >
                        Deals You Can't Miss
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={ { maxWidth: 520, mx: 'auto' } }>
                        Grab these limited-time offers and save big on services, subscriptions, and more.
                    </Typography>
                </Box>

                {/* Offers Grid */ }
                <Box
                    sx={ {
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: 3,
                    } }
                >
                    { offers.slice(0, 6).map((offer, idx) => (
                        <MotionCard
                            key={ offer.id }
                            initial={ { opacity: 0, y: 30 } }
                            whileInView={ { opacity: 1, y: 0 } }
                            transition={ { duration: 0.4, delay: idx * 0.08 } }
                            viewport={ { once: true } }
                            whileHover={ { y: -6, scale: 1.02 } }
                            sx={ {
                                borderRadius: 4,
                                overflow: 'hidden',
                                border: 'none',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                                position: 'relative',
                            } }
                        >
                            {/* Gradient Banner */ }
                            <Box
                                sx={ {
                                    background: gradients[idx % gradients.length],
                                    p: 3,
                                    position: 'relative',
                                    minHeight: 120,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                } }
                            >
                                { offer.badge && (
                                    <Chip
                                        label={ offer.badge }
                                        size="small"
                                        sx={ {
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            fontWeight: 800,
                                            fontSize: 10,
                                            bgcolor: 'rgba(255,255,255,0.95)',
                                            color: '#0E0E2E',
                                        } }
                                    />
                                ) }
                                <Typography variant="h5" fontWeight={ 900 } sx={ { color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.15)' } }>
                                    { offer.discount_percent > 0 ? `${offer.discount_percent}% OFF` : offer.discount_flat > 0 ? `₹${offer.discount_flat} OFF` : 'SPECIAL' }
                                </Typography>
                                <Typography variant="body2" sx={ { color: 'rgba(255,255,255,0.9)', mt: 0.5, fontWeight: 500 } }>
                                    { offer.title }
                                </Typography>
                            </Box>

                            <CardContent sx={ { p: 2.5 } }>
                                <Typography variant="body2" color="text.secondary" sx={ { mb: 2, minHeight: 40 } }>
                                    { offer.description }
                                </Typography>

                                { offer.code && (
                                    <Box
                                        sx={ {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            bgcolor: '#f0f4ff',
                                            borderRadius: 2,
                                            px: 2,
                                            py: 1,
                                            border: '1px dashed #03288C50',
                                        } }
                                    >
                                        <Typography variant="body2" fontWeight={ 800 } sx={ { fontFamily: 'monospace', color: '#03288C', letterSpacing: 1 } }>
                                            { offer.code }
                                        </Typography>
                                        <Tooltip title={ copiedId === offer.id ? 'Copied!' : 'Copy Code' }>
                                            <IconButton size="small" onClick={ () => handleCopy(offer.code, offer.id) }>
                                                { copiedId === offer.id ? (
                                                    <CheckCircle sx={ { fontSize: 18, color: '#10b981' } } />
                                                ) : (
                                                    <ContentCopy sx={ { fontSize: 16, color: '#03288C' } } />
                                                ) }
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                ) }

                                <Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 } }>
                                    <Chip
                                        label={ offer.target === 'both' ? 'Everyone' : offer.target === 'provider' ? 'Providers' : 'Customers' }
                                        size="small"
                                        variant="outlined"
                                        sx={ { fontSize: 11, textTransform: 'capitalize' } }
                                    />
                                    { offer.valid_until && (
                                        <Typography variant="caption" color="text.secondary">
                                            Ends { new Date(offer.valid_until).toLocaleDateString() }
                                        </Typography>
                                    ) }
                                </Box>
                            </CardContent>
                        </MotionCard>
                    )) }
                </Box>

                {/* CTA */ }
                <Box sx={ { textAlign: 'center', mt: 5 } }>
                    <Button
                        variant="outlined"
                        endIcon={ <ArrowForward /> }
                        href="/pricing"
                        sx={ {
                            borderRadius: 3,
                            px: 4,
                            py: 1.2,
                            borderColor: '#03288C',
                            color: '#03288C',
                            fontWeight: 700,
                            '&:hover': { bgcolor: '#03288C', color: '#fff' },
                        } }
                    >
                        View All Plans & Offers
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default OffersSection;
