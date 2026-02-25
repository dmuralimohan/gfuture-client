import { Box, Container, Typography, Card, CardContent, Button, Chip, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle, CheckCircleOutline } from '@mui/icons-material';
import { plans } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const capabilityRows = [
  { label: 'MARKETPLACE ACCESS', starter: 'check', moderator: 'check' },
  { label: 'REVENUE SHARE TIER', starter: 'Standard', moderator: 'Professional (2x)', moderatorHighlight: true },
  { label: 'PAYOUT FREQUENCY', starter: 'Weekly', moderator: 'Instant (48h)', moderatorHighlight: true },
  { label: 'GROWTH TRAINING', starter: null, moderator: 'check' },
  { label: 'DEDICATED MANAGER', starter: null, moderator: 'check' },
];

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Typography variant="h2" sx={{ textAlign: 'center', fontWeight: 800, mb: 1.5, fontSize: { xs: '2rem', md: '3rem' } }}>
            MEMBERSHIP TIERS
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', fontStyle: 'italic', color: '#5a6a80', mb: 8, maxWidth: 600, mx: 'auto' }}>
            Choose your activation level and participate in shared community prosperity.
          </Typography>
        </motion.div>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
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
                  border: plan.recommended ? '2px solid #03288C' : '1px solid rgba(15,43,102,0.1)',
                  overflow: 'visible',
                  height: '100%',
                  minHeight: 500,
                  transform: plan.recommended ? 'scale(1.05)' : 'none',
                  zIndex: plan.recommended ? 2 : 1,
                  boxShadow: plan.recommended
                    ? '0 12px 40px rgba(15,43,102,0.18)'
                    : '0 4px 20px rgba(15,43,102,0.08)',
                  '&:hover': {
                    boxShadow: plan.recommended
                      ? '0 20px 60px rgba(15,43,102,0.28)'
                      : '0 12px 40px rgba(15,43,102,0.14)',
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
                      bgcolor: '#03288C',
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
                        <CheckCircle sx={{ fontSize: 18, color: '#03288C' }} />
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
                      borderRadius: '6px',
                      py: 1.2,
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      ...(plan.recommended
                        ? { bgcolor: '#03288C', '&:hover': { bgcolor: '#021A66' } }
                        : { borderColor: '#03288C', color: '#03288C', '&:hover': { borderColor: '#03288C', color: '#03288C' } }),
                    }}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>

        {/* Capability Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Card
            sx={{
              mt: 8,
              borderRadius: 4,
              boxShadow: '0 4px 32px rgba(15,43,102,0.08)',
              overflow: 'hidden',
            }}
          >
            {/* Header Row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr',
                px: { xs: 2, md: 4 },
                py: 3,
                alignItems: 'center',
              }}
            >
              <Typography
                variant="overline"
                sx={{ fontWeight: 700, letterSpacing: '0.12em', color: '#5a6a80', fontSize: '0.75rem' }}
              >
                CAPABILITY MATRIX
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
                Starter
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, textAlign: 'center', color: '#03288C', fontStyle: 'italic' }}
              >
                Moderator
              </Typography>
            </Box>

            <Divider />

            {/* Data Rows */}
            {capabilityRows.map((row, index) => (
              <Box key={row.label}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr',
                    px: { xs: 2, md: 4 },
                    py: 2.5,
                    alignItems: 'center',
                    bgcolor: index % 2 === 0 ? 'transparent' : 'rgba(15,43,102,0.02)',
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{ fontWeight: 600, letterSpacing: '0.1em', color: '#3a4a5e', fontSize: '0.7rem' }}
                  >
                    {row.label}
                  </Typography>

                  {/* Starter Column */}
                  <Box sx={{ textAlign: 'center' }}>
                    {row.starter === 'check' ? (
                      <CheckCircleOutline sx={{ color: '#03288C', fontSize: 24 }} />
                    ) : row.starter ? (
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {row.starter}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">—</Typography>
                    )}
                  </Box>

                  {/* Moderator Column */}
                  <Box sx={{ textAlign: 'center' }}>
                    {row.moderator === 'check' ? (
                      <CheckCircleOutline sx={{ color: '#03288C', fontSize: 24 }} />
                    ) : row.moderator ? (
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontStyle: 'italic',
                          color: row.moderatorHighlight ? '#03288C' : 'inherit',
                        }}
                      >
                        {row.moderator}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">—</Typography>
                    )}
                  </Box>
                </Box>
                {index < capabilityRows.length - 1 && <Divider />}
              </Box>
            ))}
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Pricing;
