import { Box, Container, Typography, Card, CardContent, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { PersonAdd, Store, Groups } from '@mui/icons-material';
import { workflowSteps } from '../../data/mockData';

const iconMap = {
  PersonAdd: <PersonAdd sx={{ fontSize: 32 }} />,
  Store: <Store sx={{ fontSize: 32 }} />,
  Groups: <Groups sx={{ fontSize: 32 }} />,
};

const HowItWorks = () => {
  return (
    <Box sx={{ py: 8, minHeight: '80vh' }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h2" sx={{ textAlign: 'center', fontWeight: 800, mb: 1.5, fontSize: { xs: '2rem', md: '3rem' } }}>
            THE ECOSYSTEM WORKFLOW
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', fontStyle: 'italic', color: '#5a6a80', mb: 8 }}>
            3 Steps to start building value together.
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <Card
                sx={{
                  borderRadius: 4,
                  border: '1px solid rgba(15,43,102,0.08)',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(15,43,102,0.1)',
                    transform: 'translateY(-4px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 4, p: { xs: 3, md: 5 } }}>
                  <Avatar
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: '#03288C',
                      color: '#fff',
                      fontFamily: 'Poppins',
                      fontWeight: 800,
                      fontSize: '1.5rem',
                      flexShrink: 0,
                    }}
                  >
                    {step.step}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {step.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;
