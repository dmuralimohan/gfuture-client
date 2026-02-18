import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const WhatIsGFuture = () => {
  return (
    <Box sx={{ py: 8, background: 'transparent' }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              letterSpacing: '-0.01em',
            }}
          >
            WHAT IS GFUTURE?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              fontStyle: 'italic',
              color: '#5a6a80',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.8,
              fontSize: { xs: '0.95rem', md: '1.05rem' },
            }}
          >
            "GFuture is India's most trusted ecosystem where everyone earns together. Growth should
            be shared, not isolated."
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
};

export default WhatIsGFuture;
