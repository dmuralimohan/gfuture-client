import { Box, Container, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { Hub, Verified, Handshake } from '@mui/icons-material';
import { advantages } from '../../data/mockData';

const iconMap = {
  Hub: <Hub sx={{ fontSize: 28 }} />,
  Verified: <Verified sx={{ fontSize: 28 }} />,
  Handshake: <Handshake sx={{ fontSize: 28 }} />,
};

const Advantages = () => {
  return (
    <Box sx={{ py: 10 }}>
      <Container maxWidth="md">
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
            THE G FUTURE ADVANTAGE
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', fontStyle: 'italic', color: '#5a6a80', mb: 6 }}
          >
            Why thousands are choosing the community-driven model
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          {advantages.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              viewport={{ once: true }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: '#eaf1fb',
                    color: '#03288C',
                    mx: 'auto',
                    mb: 2,
                    border: '2px solid rgba(15,43,102,0.1)',
                  }}
                >
                  {iconMap[item.icon]}
                </Avatar>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    mb: 1,
                    fontSize: '0.85rem',
                  }}
                >
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {item.description}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Advantages;
