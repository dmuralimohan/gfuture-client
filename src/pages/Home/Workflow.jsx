import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { PersonAddAlt1Outlined, Inventory2Outlined, TrendingUpOutlined } from '@mui/icons-material';
import { workflowSteps } from '../../data/mockData';

const iconMap = {
  PersonAdd: <PersonAddAlt1Outlined sx={{ fontSize: 32, color: '#03288C' }} />,
  Store: <Inventory2Outlined sx={{ fontSize: 32, color: '#03288C' }} />,
  Groups: <TrendingUpOutlined sx={{ fontSize: 32, color: '#03288C' }} />,
};

const Workflow = () => {
  return (
    <Box sx={{ py: 10, background: 'linear-gradient(180deg, #e0ecff 0%, #dce8fd 100%)' }}>
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
              fontWeight: 900,
              mb: 1.5,
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              color: '#03288C',
            }}
          >
            THE WORKFLOW
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              fontStyle: 'italic',
              color: '#5a6a80',
              mb: 6,
              textDecoration: 'underline',
              textDecorationColor: '#5a6a80',
            }}
          >
            3-Simple steps to start your journey in a shared economy
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: '0 2px 16px rgba(15,43,102,0.05)',
                  border: '1px solid rgba(15,43,102,0.06)',
                  height: '100%',
                  '&:hover': {
                    boxShadow: '0 8px 32px rgba(15,43,102,0.1)',
                    transform: 'translateY(-4px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: { xs: 3, md: 4 },
                  }}
                >
                  <Box sx={{ mb: 2.5 }}>
                    {iconMap[step.icon]}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 900,
                      mb: 1.5,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                      color: '#03288C',
                      lineHeight: 1.3,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#8a95a5',
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                      fontSize: '0.85rem',
                    }}
                  >
                    {step.description}
                  </Typography>
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

