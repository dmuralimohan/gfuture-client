import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AppRoutes from './AppRoutes';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isAdminRoute && <Header />}
      <Box component="main" sx={{ flex: 1 }}>
        <AppRoutes />
      </Box>
      {!isAdminRoute && <Footer />}
    </Box>
  );
}

export default App;
