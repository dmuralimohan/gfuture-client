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
                  borderRadius: 2,
                  position: 'relative',
                  border: plan.recommended
                    ? '2px solid #03288C'
                    : '1px solid rgba(15,43,102,0.1)',
                  overflow: 'visible',
                  height: '100%',
                  '&:hover': {
                    boxShadow: plan.recommended
                      ? '0 12px 48px rgba(15,43,102,0.2)'
                      : '0 8px 32px rgba(15,43,102,0.08)',
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
                      bgcolor: '#03288C',
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
                        <CheckCircle sx={{ fontSize: 16, color: '#03288C' }} />
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
                      borderRadius: '6px',
                      py: 1,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                      ...(plan.recommended
                        ? {
                            bgcolor: '#03288C',
                            '&:hover': { bgcolor: '#021A66' },
                          }
                        : {
                            borderColor: '#03288C',
                            color: '#03288C',
                            '&:hover': { borderColor: '#03288C', color: '#03288C' },
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
