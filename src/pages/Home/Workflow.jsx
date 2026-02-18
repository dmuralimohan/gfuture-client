import { Box, Container, Typography, Avatar, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { PersonAdd, Store, Groups } from '@mui/icons-material';
import { workflowSteps } from '../../data/mockData';

const iconMap = {
  PersonAdd: <PersonAdd sx={{ fontSize: 28 }} />,
  Store: <Store sx={{ fontSize: 28 }} />,
  Groups: <Groups sx={{ fontSize: 28 }} />,
};

const Workflow = () => {
  return (
    <Box sx={{ py: 10, background: 'linear-gradient(180deg, #f0f4ff 0%, #e8f0fe 100%)' }}>
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
            THE ECOSYSTEM WORKFLOW
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              fontStyle: 'italic',
              color: '#5a6a80',
              mb: 6,
            }}
          >
            3 Steps to start building value together.
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: '0 2px 16px rgba(10,22,40,0.05)',
                  border: '1px solid rgba(26,58,245,0.06)',
                  '&:hover': {
                    boxShadow: '0 8px 32px rgba(26,58,245,0.1)',
                    transform: 'translateX(8px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: { xs: 3, md: 4 } }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: '#e8f0fe',
                      color: '#1a3af5',
                      fontFamily: 'Poppins',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      flexShrink: 0,
                    }}
                  >
                    {step.step}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        mb: 0.5,
                        fontSize: { xs: '1rem', md: '1.15rem' },
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
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

export default Workflow;

