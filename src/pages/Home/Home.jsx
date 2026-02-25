import { Box } from '@mui/material';
import HeroSection from './HeroSection';
import PromoCards from './PromoCards';
import Categories from './Categories';
import WhatIsGFuture from './WhatIsGFuture';
import Workflow from './Workflow';
import Plans from './Plans';
import Advantages from './Advantages';
import OffersSection from './OffersSection';

const Home = () => {
  return (
    <Box>
      <HeroSection />
      <PromoCards />
      <Categories />
      <WhatIsGFuture />
      <Workflow />
      <OffersSection />
      <Plans />
      <Advantages />
    </Box>
  );
};

export default Home;
