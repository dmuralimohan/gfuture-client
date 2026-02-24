import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home/Home'));
const Services = lazy(() => import('./pages/Services/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail/ServiceDetail'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Signup = lazy(() => import('./pages/Auth/Signup'));
const Cart = lazy(() => import('./pages/Cart/Cart'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const ProviderDashboard = lazy(() => import('./pages/Provider/ProviderDashboard'));
const Pricing = lazy(() => import('./pages/Pricing/Pricing'));
const HowItWorks = lazy(() => import('./pages/HowItWorks/HowItWorks'));
const About = lazy(() => import('./pages/About/About'));
const Orders = lazy(() => import('./pages/Orders/Orders'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));

const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress sx={{ color: '#03288C' }} />
  </Box>
);

const AppRoutes = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/:id" element={<ServiceDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/provider/dashboard" element={<ProviderDashboard />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/about" element={<About />} />
      <Route path="/orders" element={<Orders />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
