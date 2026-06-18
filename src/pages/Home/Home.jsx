import { Box, Container, Typography } from '@mui/material';
import HeroSection from './HeroSection';
import PromoCards from './PromoCards';
import Categories from './Categories';
import WhatIsGFuture from './WhatIsGFuture';
import Workflow from './Workflow';
import Plans from './Plans';
import Advantages from './Advantages';

const Home = () => {
  return (
    <Box>
      <HeroSection />

      <Container maxWidth="lg" sx={ { mt: 2 } }>
        <Box
          sx={ {
            borderRadius: 3,
            px: { xs: 2, md: 3 },
            py: 1.4,
            background: 'linear-gradient(90deg, #111827 0%, #1f2937 45%, #334155 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          } }
        >
          <Typography variant="subtitle2" fontWeight={ 800 } sx={ { letterSpacing: '0.06em' } }>
            GNEWS
          </Typography>
          <Typography variant="body2" sx={ { opacity: 0.92, flex: 1 } }>
            GNews is coming soon with verified business updates, partner stories, and platform announcements.
          </Typography>
          <Typography variant="caption" sx={ { color: '#facc15', fontWeight: 700, whiteSpace: 'nowrap' } }>
            COMING SOON
          </Typography>
        </Box>
      </Container>

      <PromoCards />
      <Categories />
      <WhatIsGFuture />
      <Workflow />
      <Plans />
      <Advantages />
    </Box>
  );
};

export default Home;
