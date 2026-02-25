import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircleOutline, Apartment } from '@mui/icons-material';

const missionPoints = [
  'Digital business sectors accessible from just ₹500.',
  'A community model where growth is distributed fairly across nodes.',
  'Uniting Real Estate, IT, Media, and Essentials in one hub.',
];

const About = () => {
  return (
    <Box sx={{ minHeight: '80vh' }}>
      {/* Hero: SHARED GROWTH */}
      <Box sx={{ pt: { xs: 8, md: 10 }, pb: { xs: 4, md: 6 } }}>
        <Container maxWidth="md">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                component="h1"
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 900,
                  fontStyle: 'italic',
                  fontSize: { xs: '2.8rem', sm: '3.8rem', md: '4.8rem' },
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  mb: 0,
                }}
              >
                <Box component="span" sx={{ color: '#0E0E2E', display: 'block' }}>
                  SHARED
                </Box>
                <Box component="span" sx={{ color: '#03288C', display: 'block' }}>
                  GROWTH.
                </Box>
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                fontStyle: 'italic',
                color: '#5a6a80',
                mt: 3,
                mb: 0,
                maxWidth: 560,
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
              }}
            >
              "GFuture is India's most trusted ecosystem where everyone earns together.
              Growth should be shared, not isolated."
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* OUR MISSION */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.8rem', md: '2.4rem' },
                mb: { xs: 4, md: 5 },
                textTransform: 'uppercase',
              }}
            >
              OUR MISSION.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: { xs: 4, md: 8 },
              }}
            >
              {/* Mission Points */}
              <Box sx={{ flex: 1 }}>
                {missionPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        mb: index < missionPoints.length - 1 ? 4 : 0,
                      }}
                    >
                      <CheckCircleOutline
                        sx={{
                          color: '#03288C',
                          fontSize: 28,
                          mt: 0.3,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: 'italic',
                          fontWeight: 500,
                          color: '#3a4a5e',
                          lineHeight: 1.7,
                          fontSize: { xs: '0.95rem', md: '1.05rem' },
                        }}
                      >
                        {point}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>

              {/* Building Illustration */}
              <Box
                sx={{
                  flex: '0 0 auto',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: { xs: '100%', md: 280 },
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      alignItems: 'flex-end',
                    }}
                  >
                    {/* Building group */}
                    <Apartment sx={{ fontSize: 120, color: '#9ab0cc' }} />
                    <Apartment sx={{ fontSize: 160, color: '#7a96b8' }} />
                    <Apartment sx={{ fontSize: 100, color: '#b0c4de' }} />
                  </Box>
                </motion.div>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default About;