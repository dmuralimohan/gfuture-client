import { Box, Container, Typography, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const HeroSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Box
      sx={ {
        background: 'linear-gradient(135deg, #eaf1fb 0%, #f0f4ff 40%, #eaf1fb 100%)',
        pt: { xs: 5, md: 10 },
        pb: { xs: 3, md: 10 },
        position: 'relative',
        overflow: 'hidden',
      } }
    >
      {/* Decorative background elements */ }
      <Box
        sx={ {
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,43,102,0.05) 0%, transparent 70%)',
        } }
      />
      {/* Subtle decorative dots */ }
      <Box
        sx={ {
          position: 'absolute',
          bottom: 40,
          left: '45%',
          width: 120,
          height: 120,
          opacity: 0.04,
          backgroundImage: 'radial-gradient(circle, #03288C 1.5px, transparent 1.5px)',
          backgroundSize: '18px 18px',
          display: { xs: 'none', md: 'block' },
        } }
      />

      <Container maxWidth="lg">
        <Box
          sx={ {
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 4, md: 6 },
          } }
        >
          {/* ── Left: Text Content ── */ }
          <Box sx={ { flex: '1 1 55%', maxWidth: { md: '55%' }, position: 'relative', zIndex: 2 } }>
            <motion.div
              initial={ { opacity: 0, y: 40 } }
              animate={ { opacity: 1, y: 0 } }
              transition={ { duration: 0.8, ease: [0.4, 0, 0.2, 1] } }
            >
              <Chip
                icon={
                  <CheckCircle
                    sx={ {
                      fontSize: 18,
                      color: '#D4A017 !important',
                      filter: 'drop-shadow(0 0 6px rgba(212,160,23,0.7))',
                    } }
                  />
                }
                label="NEXT GENERATION DIGITAL PLATFORM"
                sx={ {
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
                } }
              />
            </motion.div>

            <motion.div
              initial={ { opacity: 0, y: 50 } }
              animate={ { opacity: 1, y: 0 } }
              transition={ { duration: 0.9, delay: 0.15, ease: [0.4, 0, 0.2, 1] } }
            >
              <Typography
                variant="h1"
                sx={ {
                  fontSize: { xs: '2.2rem', sm: '3.2rem', md: '4.5rem', lg: '5rem' },
                  fontWeight: 900,
                  lineHeight: 1.05,
                  mb: 3,
                  background: 'linear-gradient(180deg, #0E0E2E 0%, #0E0E2E 40%, #03288C 60%, #0066CC 80%, #1E90FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                } }
              >
                SHARED{ ' ' }
                <Box component="span" sx={ { display: 'block' } }>
                  GROWTH.
                </Box>
                <Box component="span" sx={ { display: 'block' } }>
                  COLLECTIVE
                </Box>
                <Box
                  component="span"
                  sx={ {
                    display: 'block',
                  } }
                >
                  WEALTH.
                </Box>
              </Typography>
            </motion.div>

            <motion.div
              initial={ { opacity: 0, y: 30 } }
              animate={ { opacity: 1, y: 0 } }
              transition={ { duration: 0.7, delay: 0.3 } }
            >
              <Typography
                variant="body1"
                sx={ {
                  color: '#5a6a80',
                  maxWidth: 520,
                  mb: 4,
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  lineHeight: 1.7,
                } }
              >
                Buy trusted products. Access verified services. Build long-term income through a
                community-driven revenue sharing ecosystem.
              </Typography>
            </motion.div>

            <motion.div
              initial={ { opacity: 0, y: 20 } }
              animate={ { opacity: 1, y: 0 } }
              transition={ { duration: 0.6, delay: 0.45 } }
            >
              <Box sx={ { display: 'flex', gap: 2, flexWrap: 'wrap' } }>
                <Button
                  variant="contained"
                  size="large"
                  onClick={ () => navigate('/services') }
                  sx={ {
                    bgcolor: '#03288C',
                    px: 4,
                    py: 1.5,
                    fontSize: '0.95rem',
                    borderRadius: '6px',
                    '&:hover': { bgcolor: '#021A66', transform: 'translateY(-2px)' },
                  } }
                >
                  Explore Marketplace
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={ () => navigate(isAuthenticated ? '/profile' : '/signup') }
                  sx={ {
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
                  } }
                >
                  Join Platform
                </Button>
              </Box>
            </motion.div>
          </Box>

          {/* ── Right: Hero Image ── */ }
          <Box
            sx={ {
              flex: '1 1 42%',
              maxWidth: { xs: '85%', sm: '65%', md: '42%' },
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
            } }
          >
            {/* Soft glow behind image */ }
            <Box
              sx={ {
                position: 'absolute',
                bottom: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: '60%',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(3,40,140,0.08) 0%, rgba(3,40,140,0.03) 50%, transparent 70%)',
                filter: 'blur(30px)',
                zIndex: 0,
              } }
            />
            <motion.div
              initial={ { opacity: 0, y: 60, scale: 0.92 } }
              animate={ { opacity: 1, y: 0, scale: 1 } }
              transition={ { duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] } }
              style={ { position: 'relative', zIndex: 1, width: '100%' } }
            >
              <Box
                component="img"
                src="/hero-girl.png"
                alt="Girl dreaming about growth and success"
                sx={ {
                  width: '100%',
                  maxHeight: { xs: 340, sm: 400, md: 520 },
                  objectFit: 'contain',
                  objectPosition: 'bottom center',
                  display: 'block',
                  filter: 'drop-shadow(0 20px 40px rgba(3,40,140,0.10))',
                  mixBlendMode: 'multiply',
                } }
              />
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;

