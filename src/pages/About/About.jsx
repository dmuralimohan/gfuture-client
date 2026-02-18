import { Box, Container, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { Visibility, Groups, TrendingUp, Security } from '@mui/icons-material';

const values = [
  {
    title: 'Shared Growth',
    description: 'Every participant earns through the collective growth model. Your success is tied to community success.',
    icon: <TrendingUp sx={{ fontSize: 28 }} />,
  },
  {
    title: 'Transparency',
    description: 'Clear rules, visible commission structures, and fair governance for all members.',
    icon: <Visibility sx={{ fontSize: 28 }} />,
  },
  {
    title: 'Community First',
    description: 'Thousands of service providers and customers building wealth together across India.',
    icon: <Groups sx={{ fontSize: 28 }} />,
  },
  {
    title: 'Trust & Security',
    description: 'Verified providers, secure payments, and guaranteed service quality with every booking.',
    icon: <Security sx={{ fontSize: 28 }} />,
  },
];

const About = () => {
  return (
    <Box sx={{ py: 8, minHeight: '80vh' }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h2" sx={{ textAlign: 'center', fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
            ABOUT G-FUTURE
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', color: '#5a6a80', mb: 8, maxWidth: 620, mx: 'auto', lineHeight: 1.8 }}>
            G-Future is India's most trusted ecosystem where everyone earns together.
            We connect service providers with customers while sharing revenue across the active community.
            Growth should be shared, not isolated.
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {values.map((value, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={value.title}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    height: '100%',
                    border: '1px solid rgba(26,58,245,0.08)',
                    '&:hover': { boxShadow: '0 8px 32px rgba(26,58,245,0.1)', transform: 'translateY(-4px)' },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Avatar sx={{ bgcolor: '#e8f0fe', color: '#1a3af5', mb: 2 }}>{value.icon}</Avatar>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{value.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Card sx={{ mt: 6, borderRadius: 4, bgcolor: '#0a1628', color: '#fff' }}>
            <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
                Join the Revolution
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 500, mx: 'auto', lineHeight: 1.8 }}>
                Whether you're a service provider looking to grow your business or a customer
                seeking trusted services — G-Future is your platform for shared prosperity.
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default About;