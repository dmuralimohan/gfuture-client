import { Box, Container, Typography, Card, CardContent, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle } from '@mui/icons-material';
import { plans } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Plans = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handlePlanClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/pricing');
    }
  };

  return (
    <Box sx={{ py: 10 }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              mb: 1.5,
              fontSize: { xs: '1.8rem', md: '2.4rem' },
            }}
          >
            THE DEPLOYMENT PLANS
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', fontStyle: 'italic', color: '#5a6a80', mb: 6 }}
          >
            Select your convenient plan
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3,
          }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                sx={{
                  borderRadius: 4,
                  position: 'relative',
                  border: plan.recommended
                    ? '2px solid #1a3af5'
                    : '1px solid rgba(26,58,245,0.1)',
                  overflow: 'visible',
                  height: '100%',
                  '&:hover': {
                    boxShadow: plan.recommended
                      ? '0 12px 48px rgba(26,58,245,0.2)'
                      : '0 8px 32px rgba(10,22,40,0.08)',
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
                      height: 28,
                    }}
                  />
                )}
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      color: '#5a6a80',
                      mb: 1,
                    }}
                  >
                    {plan.name}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '2rem', md: '2.5rem' } }}
                  >
                    {plan.price ? `${plan.currency}${plan.price.toLocaleString()}` : plan.priceLabel}
                  </Typography>
                  {plan.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                      {plan.description}
                    </Typography>
                  )}

                  <Box sx={{ flex: 1, my: 2 }}>
                    {plan.features.map((feature) => (
                      <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CheckCircle sx={{ fontSize: 16, color: '#1a3af5' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    fullWidth
                    variant={plan.recommended ? 'contained' : 'outlined'}
                    onClick={handlePlanClick}
                    sx={{
                      mt: 'auto',
                      borderRadius: '24px',
                      py: 1,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                      ...(plan.recommended
                        ? {
                            bgcolor: '#1a3af5',
                            '&:hover': { bgcolor: '#0a2ae5' },
                          }
                        : {
                            borderColor: '#0a1628',
                            color: '#0a1628',
                            '&:hover': { borderColor: '#1a3af5', color: '#1a3af5' },
                          }),
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

export default Plans;
