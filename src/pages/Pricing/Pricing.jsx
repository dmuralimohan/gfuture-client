import { Box, Container, Typography, Card, CardContent, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle } from '@mui/icons-material';
import { plans } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSelect = () => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  };

  return (
    <Box sx={{ py: 8, minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h2" sx={{ textAlign: 'center', fontWeight: 800, mb: 1.5, fontSize: { xs: '2rem', md: '3rem' } }}>
            MEMBERSHIP TIERS
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', fontStyle: 'italic', color: '#5a6a80', mb: 8, maxWidth: 600, mx: 'auto' }}>
            Choose your activation level and participate in shared community prosperity.
          </Typography>
        </motion.div>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  borderRadius: 4,
                  position: 'relative',
                  border: plan.recommended ? '2px solid #1a3af5' : '1px solid rgba(26,58,245,0.1)',
                  overflow: 'visible',
                  height: '100%',
                  transform: plan.recommended ? 'scale(1.05)' : 'none',
                  zIndex: plan.recommended ? 2 : 1,
                  '&:hover': {
                    boxShadow: plan.recommended
                      ? '0 16px 56px rgba(26,58,245,0.25)'
                      : '0 8px 32px rgba(10,22,40,0.1)',
                    transform: plan.recommended ? 'scale(1.08)' : 'translateY(-6px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {plan.recommended && (
                  <Chip
                    label="HIGHLY RECOMMENDED"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -14,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: '#1a3af5',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.6rem',
                      letterSpacing: '0.08em',
                    }}
                  />
                )}
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.12em', color: '#5a6a80', mb: 2 }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '2.2rem', md: '2.8rem' } }}>
                    {plan.price ? `${plan.currency}${plan.price.toLocaleString()}` : plan.priceLabel}
                  </Typography>
                  {plan.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                      {plan.description}
                    </Typography>
                  )}

                  <Box sx={{ flex: 1, my: 2 }}>
                    {plan.features.map((feature) => (
                      <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <CheckCircle sx={{ fontSize: 18, color: '#1a3af5' }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    fullWidth
                    variant={plan.recommended ? 'contained' : 'outlined'}
                    onClick={handleSelect}
                    sx={{
                      mt: 'auto',
                      borderRadius: '24px',
                      py: 1.2,
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      ...(plan.recommended
                        ? { bgcolor: '#1a3af5', '&:hover': { bgcolor: '#0a2ae5' } }
                        : { borderColor: '#0a1628', color: '#0a1628', '&:hover': { borderColor: '#1a3af5', color: '#1a3af5' } }),
                    }}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Pricing;
