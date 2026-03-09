import { Box } from '@mui/material';
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
