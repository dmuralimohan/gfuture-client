import { Box, Container, Typography, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from '@mui/icons-material';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #eaf1fb 0%, #f0f4ff 40%, #eaf1fb 100%)',
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 14 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,43,102,0.05) 0%, transparent 70%)',
        }}
      />

      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <Chip
            icon={
              <CheckCircle
                sx={{
                  fontSize: 18,
                  color: '#D4A017 !important',
                  filter: 'drop-shadow(0 0 6px rgba(212,160,23,0.7))',
                }}
              />
            }
            label="NEXT GENERATION DIGITAL PLATFORM"
            sx={{
              bgcolor: 'rgba(15,43,102,0.08)',
              color: '#03288C',
              fontWeight: 600,
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              mb: 3,
              height: 36,
              borderRadius: '18px',
              border: '1px solid rgba(212,160,23,0.3)',
              '& .MuiChip-icon': {
                ml: '8px',
              },
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.8rem', sm: '3.8rem', md: '5rem' },
              fontWeight: 900,
              lineHeight: 1.05,
              mb: 3,
              maxWidth: 700,
              background: 'linear-gradient(180deg, #0E0E2E 0%, #0E0E2E 40%, #03288C 60%, #0066CC 80%, #1E90FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SHARED{' '}
            <Box component="span" sx={{ display: 'block' }}>
              GROWTH.
            </Box>
            <Box component="span" sx={{ display: 'block' }}>
              COLLECTIVE
            </Box>
            <Box
              component="span"
              sx={{
                display: 'block',
              }}
            >
              WEALTH.
            </Box>
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Typography
            variant="body1"
            sx={{
              color: '#5a6a80',
              maxWidth: 520,
              mb: 4,
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              lineHeight: 1.7,
            }}
          >
            Buy trusted products. Access verified services. Build long-term income through a
            community-driven revenue sharing ecosystem.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/services')}
              sx={{
                bgcolor: '#03288C',
                px: 4,
                py: 1.5,
                fontSize: '0.95rem',
                borderRadius: '6px',
                '&:hover': { bgcolor: '#021A66', transform: 'translateY(-2px)' },
              }}
            >
              Explore Marketplace
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/signup')}
              sx={{
                borderColor: '#03288C',
                color: '#03288C',
                px: 4,
                py: 1.5,
                fontSize: '0.95rem',
                borderRadius: '6px',
                borderWidth: 2,
                '&:hover': {
                  borderColor: '#1a56c4',
                  color: '#1a56c4',
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Join Platform
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default HeroSection;

