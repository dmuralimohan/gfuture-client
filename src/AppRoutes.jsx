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
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy/PrivacyPolicy'));

// Admin pages
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'));
const AdminServices = lazy(() => import('./pages/Admin/AdminServices'));
const AdminOrders = lazy(() => import('./pages/Admin/AdminOrders'));
const AdminCategories = lazy(() => import('./pages/Admin/AdminCategories'));
const AdminAnalytics = lazy(() => import('./pages/Admin/AdminAnalytics'));
const AdminPayments = lazy(() => import('./pages/Admin/AdminPayments'));
const AdminPlans = lazy(() => import('./pages/Admin/AdminPlans'));
const AdminOffers = lazy(() => import('./pages/Admin/AdminOffers'));
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings'));
const AdminPromoCards = lazy(() => import('./pages/Admin/AdminPromoCards'));

const Loading = () => (
  <Box sx={ { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' } }>
    <CircularProgress sx={ { color: '#03288C' } } />
  </Box>
);

const AppRoutes = () => (
  <Suspense fallback={ <Loading /> }>
    <Routes>
      <Route path="/" element={ <Home /> } />
      <Route path="/services" element={ <Services /> } />
      <Route path="/services/:id" element={ <ServiceDetail /> } />
      <Route path="/login" element={ <Login /> } />
      <Route path="/signup" element={ <Signup /> } />
      <Route path="/cart" element={ <Cart /> } />
      <Route path="/checkout" element={ <Checkout /> } />
      <Route path="/profile" element={ <Profile /> } />
      <Route path="/provider/dashboard" element={ <ProviderDashboard /> } />
      <Route path="/pricing" element={ <Pricing /> } />
      <Route path="/how-it-works" element={ <HowItWorks /> } />
      <Route path="/about" element={ <About /> } />
      <Route path="/orders" element={ <Orders /> } />
      <Route path="/page/privacy-policy" element={ <PrivacyPolicy /> } />

      {/* Admin Panel */ }
      <Route path="/admin" element={ <AdminLayout /> }>
        <Route index element={ <AdminDashboard /> } />
        <Route path="customers" element={ <AdminUsers roleFilter="customer" /> } />
        <Route path="providers" element={ <AdminUsers roleFilter="provider" /> } />
        <Route path="services" element={ <AdminServices /> } />
        <Route path="orders" element={ <AdminOrders /> } />
        <Route path="categories" element={ <AdminCategories /> } />
        <Route path="analytics" element={ <AdminAnalytics /> } />
        <Route path="payments" element={ <AdminPayments /> } />
        <Route path="plans" element={ <AdminPlans /> } />
        <Route path="offers" element={ <AdminOffers /> } />
        <Route path="settings" element={ <AdminSettings /> } />
        <Route path="promo-cards" element={ <AdminPromoCards /> } />
      </Route>
    </Routes>
  </Suspense>
);

export default AppRoutes;
