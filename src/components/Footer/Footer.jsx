import { Link } from 'react-router-dom';
import { Box, Container, Typography, Grid, IconButton, Divider } from '@mui/material';
import { motion } from 'framer-motion';

const footerLinks = {
  'Admin Dashboard': [
    { label: 'Market', path: '/services' },
    { label: 'Pricing', path: '/pricing' },
  ],
  Protocol: [
    { label: 'Vision', path: '/about' },
    { label: 'Help Center', path: '/about' },
  ],
};

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: '#0E0E2E',
        color: '#fff',
        pt: 8,
        pb: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {/* Logo */}
              <Box sx={{ mb: 2 }}>
                <Box
                  component="img"
                  src="/logo.png"
                  alt="G-Future"
                  sx={{ height: 56, width: 'auto' }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', maxWidth: 280, lineHeight: 1.8 }}
              >
                "GFuture is India's most trusted ecosystem where everyone earns together."
              </Typography>
            </motion.div>
          </Grid>

          {Object.entries(footerLinks).map(([title, links]) => (
            <Grid size={{ xs: 6, md: 2 }} key={title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', mb: 2, display: 'block' }}
                >
                  {title}
                </Typography>
                {links.map((link) => (
                  <Typography
                    key={link.label}
                    component={Link}
                    to={link.path}
                    variant="body2"
                    sx={{
                      display: 'block',
                      color: 'rgba(255,255,255,0.7)',
                      mb: 1.5,
                      textDecoration: 'none',
                      letterSpacing: '0.05em',
                      transition: 'color 0.2s',
                      '&:hover': { color: '#1a56c4' },
                    }}
                  >
                    {link.label}
                  </Typography>
                ))}
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 4 }} />

        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          © {new Date().getFullYear()} G-Future. All rights reserved. Built for shared growth.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
