import { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, CardMedia, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { promoCards as fallbackCards } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const PromoCards = () => {
  const navigate = useNavigate();
  const [promoCards, setPromoCards] = useState(fallbackCards);

  useEffect(() => {
    api.get('/api/promo-cards')
      .then(({ data }) => {
        if (data.promoCards?.length) setPromoCards(data.promoCards);
      })
      .catch(() => { });
  }, []);

  return (
    <Container maxWidth="lg" sx={ { mt: { xs: 0, md: 0 }, mb: { xs: 3, md: 6 }, position: 'relative', zIndex: 2 } }>
      <Box
        sx={ {
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: { xs: 2, md: 3 },
        } }
      >
        { promoCards.map((card, index) => (
          <motion.div
            key={ card.id }
            initial={ { opacity: 0, y: 30 } }
            whileInView={ { opacity: 1, y: 0 } }
            transition={ { duration: 0.5, delay: index * 0.1 } }
            viewport={ { once: true } }
          >
            <Card
              sx={ {
                background: card.bg,
                borderRadius: 4,
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                minHeight: 180,
                display: 'flex',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 40px rgba(15,43,102,0.15)',
                },
                transition: 'all 0.3s ease',
              } }
              onClick={ () => navigate(card.link || '/services') }
            >
              <CardContent sx={ { flex: 1, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }>
                <Box>
                  <Typography
                    variant="overline"
                    sx={ { fontWeight: 700, letterSpacing: '0.1em', color: '#03288C' } }
                  >
                    { card.title }
                  </Typography>
                  <Typography variant="h6" sx={ { fontWeight: 700, mb: 0.5 } }>
                    { card.subtitle }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    { card.description }
                  </Typography>
                </Box>
                <Button
                  size="small"
                  sx={ {
                    alignSelf: 'flex-start',
                    mt: 2,
                    bgcolor: '#03288C',
                    color: '#fff',
                    borderRadius: '6px',
                    px: 2.5,
                    fontSize: '0.75rem',
                    '&:hover': { bgcolor: '#03288C' },
                  } }
                >
                  { card.cta }
                </Button>
              </CardContent>
              <Box
                sx={ {
                  width: 140,
                  display: { xs: 'none', sm: 'block' },
                  overflow: 'hidden',
                } }
              >
                <Box
                  component="img"
                  src={ card.image }
                  alt={ card.title }
                  sx={ {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  } }
                />
              </Box>
            </Card>
          </motion.div>
        )) }
      </Box>
    </Container>
  );
};

export default PromoCards;
