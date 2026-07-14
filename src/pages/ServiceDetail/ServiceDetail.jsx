import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Rating,
  Avatar,
  Divider,
  Grid,
  Breadcrumbs,
  Link as MuiLink,
  Skeleton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  AccessTime,
  Verified,
  CheckCircle,
  Star,
  ArrowBack,
  Shield,
  LocationOn,
} from '@mui/icons-material';
import { services as fallbackServices } from '../../data/mockData';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [cartNotice, setCartNotice] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/services/${id}`);
        const s = data.service;
        // Normalize backend shape
        const normalized = {
          ...s,
          categoryId: s.category_id,
          category: s.category_name || '',
          includes: s.includes || [],
          provider: {
            name: s.provider_name || 'Service Provider',
            rating: s.rating || 4.5,
            jobs: s.reviews || 0,
            avatar: '',
          },
        };
        setService(normalized);
        const gallery = [normalized.image, ...(Array.isArray(normalized.image_links) ? normalized.image_links : [])].filter(Boolean);
        setSelectedImage(gallery[0] || '');

        // Fetch related services in the same category
        try {
          const { data: relData } = await api.get('/api/services', {
            params: { category: s.category_id, limit: 4 },
          });
          const related = relData.services
            .filter((r) => r.id !== Number(id))
            .slice(0, 3)
            .map((r) => ({
              ...r,
              categoryId: r.category_id,
              category: r.category_name || '',
            }));
          setRelatedServices(related);
        } catch {
          setRelatedServices([]);
        }
      } catch {
        // Fallback to mock data
        const mock = fallbackServices.find((s) => s.id === Number(id));
        setService(mock || null);
        if (mock) {
          const gallery = [mock.image, ...(Array.isArray(mock.image_links) ? mock.image_links : [])].filter(Boolean);
          setSelectedImage(gallery[0] || '');
        }
        if (mock) {
          setRelatedServices(
            fallbackServices
              .filter((s) => s.categoryId === mock.categoryId && s.id !== mock.id)
              .slice(0, 3)
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <Box sx={ { py: 4, minHeight: '80vh' } }>
        <Container maxWidth="lg">
          <Skeleton variant="text" width={ 300 } height={ 24 } sx={ { mb: 3 } } />
          <Grid container spacing={ 4 }>
            <Grid size={ { xs: 12, md: 8 } }>
              <Skeleton variant="rectangular" height={ 400 } sx={ { borderRadius: 4, mb: 3 } } />
              <Skeleton variant="text" width="60%" height={ 40 } />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="90%" height={ 80 } sx={ { mt: 2 } } />
            </Grid>
            <Grid size={ { xs: 12, md: 4 } }>
              <Skeleton variant="rectangular" height={ 300 } sx={ { borderRadius: 4 } } />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (!service) {
    return (
      <Container maxWidth="md" sx={ { py: 10, textAlign: 'center' } }>
        <Typography variant="h4" fontWeight={ 700 }>Service not found</Typography>
        <Button onClick={ () => navigate('/services') } sx={ { mt: 2 } }>
          Browse Services
        </Button>
      </Container>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    addItem(service);
    setCartNotice(`${service.name} added to cart!`);
    return true;
  };

  const galleryImages = [service.image, ...(Array.isArray(service.image_links) ? service.image_links : [])].filter(Boolean);

  return (
    <Box sx={ { py: 4, minHeight: '80vh' } }>
      <Container maxWidth="lg">
        {/* Breadcrumbs */ }
        <motion.div initial={ { opacity: 0 } } animate={ { opacity: 1 } } transition={ { duration: 0.3 } }>
          <Breadcrumbs sx={ { mb: 3 } }>
            <MuiLink
              component="button"
              underline="hover"
              color="text.secondary"
              onClick={ () => navigate('/') }
              sx={ { cursor: 'pointer' } }
            >
              Home
            </MuiLink>
            <MuiLink
              component="button"
              underline="hover"
              color="text.secondary"
              onClick={ () => navigate('/services') }
              sx={ { cursor: 'pointer' } }
            >
              Services
            </MuiLink>
            <Typography color="text.primary" fontWeight={ 600 }>
              { service.name }
            </Typography>
          </Breadcrumbs>
        </motion.div>

        <Grid container spacing={ 4 }>
          {/* Left: Image & Details */ }
          <Grid size={ { xs: 12, md: 8 } }>
            <motion.div
              initial={ { opacity: 0, x: -30 } }
              animate={ { opacity: 1, x: 0 } }
              transition={ { duration: 0.5 } }
            >
              <Card sx={ { borderRadius: 4, overflow: 'hidden', mb: 3 } }>
                <Box
                  component="img"
                  src={ selectedImage || service.image }
                  alt={ service.name }
                  sx={ { width: '100%', height: { xs: 250, md: 400 }, objectFit: 'cover' } }
                />
              </Card>

              { galleryImages.length > 1 && (
                <Box sx={ { display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 } }>
                  { galleryImages.map((img) => (
                    <Box
                      key={ img }
                      component="img"
                      src={ img }
                      alt="service"
                      onClick={ () => setSelectedImage(img) }
                      sx={ {
                        width: 72,
                        height: 72,
                        borderRadius: 2,
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: selectedImage === img ? '2px solid #03288C' : '1px solid rgba(0,0,0,0.1)',
                      } }
                    />
                  )) }
                </Box>
              ) }

              <Typography variant="h4" fontWeight={ 800 } sx={ { mb: 1 } }>
                { service.name }
              </Typography>

              <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' } }>
                <Chip label={ service.category } color="primary" variant="outlined" />
                <Chip
                  label={ service.type === 'product' ? 'Product' : 'Service' }
                  size="small"
                  sx={ {
                    fontWeight: 600,
                    bgcolor: service.type === 'product' ? '#dbeafe' : '#f0fdf4',
                    color: service.type === 'product' ? '#1d4ed8' : '#15803d',
                  } }
                />
                { service.type === 'product' && service.size_value && (
                  <Chip
                    label={ `${service.size_value} ${service.size_unit || ''}` }
                    size="small"
                    variant="outlined"
                    sx={ { fontWeight: 600 } }
                  />
                ) }
                <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
                  <Rating value={ service.rating } precision={ 0.1 } readOnly size="small" />
                  <Typography variant="body2" fontWeight={ 600 }>
                    { service.rating } ({ service.reviews.toLocaleString() } reviews)
                  </Typography>
                </Box>
                <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
                  <AccessTime sx={ { fontSize: 18, color: '#5a6a80' } } />
                  <Typography variant="body2" color="text.secondary">
                    { service.duration }
                  </Typography>
                </Box>
                { service.location && (
                  <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
                    <LocationOn sx={ { fontSize: 18, color: '#5a6a80' } } />
                    <Typography variant="body2" color="text.secondary">
                      { service.location }
                    </Typography>
                  </Box>
                ) }
              </Box>

              <Typography variant="body1" sx={ { lineHeight: 1.8, mb: 4, color: '#5a6a80' } }>
                { service.description }
              </Typography>

              {/* What's Included */ }
              <Typography variant="h6" fontWeight={ 700 } sx={ { mb: 2 } }>
                What's Included
              </Typography>
              <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1.5, mb: 4 } }>
                { service.includes.map((item) => (
                  <Box key={ item } sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                    <CheckCircle sx={ { fontSize: 18, color: '#03288C' } } />
                    <Typography variant="body2">{ item }</Typography>
                  </Box>
                )) }
              </Box>

              {/* Warranty */ }
              <Card sx={ { borderRadius: 3, bgcolor: '#f0f4ff', border: '1px solid rgba(15,43,102,0.1)', p: 2, mb: 4 } }>
                <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
                  <Shield sx={ { color: '#03288C' } } />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={ 700 }>
                      { service.warranty } Warranty
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Service guarantee on all work performed
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Grid>

          {/* Right: Booking Card */ }
          <Grid size={ { xs: 12, md: 4 } }>
            <motion.div
              initial={ { opacity: 0, x: 30 } }
              animate={ { opacity: 1, x: 0 } }
              transition={ { duration: 0.5, delay: 0.2 } }
            >
              <Card
                sx={ {
                  borderRadius: 4,
                  position: 'sticky',
                  top: 100,
                  border: '2px solid rgba(15,43,102,0.1)',
                } }
              >
                <CardContent sx={ { p: 3 } }>
                  <Typography variant="h4" fontWeight={ 800 } sx={ { color: '#03288C', mb: 0.5 } }>
                    ₹{ service.price.toLocaleString() }
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 3 } }>
                    + ₹{ (service.price * 0.0102).toFixed(2) } GST
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={ <ShoppingCart /> }
                    onClick={ handleAddToCart }
                    sx={ {
                      bgcolor: '#03288C',
                      borderRadius: '6px',
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      mb: 2,
                      '&:hover': { bgcolor: '#021A66' },
                    } }
                  >
                    Add to Cart
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={ () => {
                      if (handleAddToCart()) {
                        navigate('/cart');
                      }
                    } }
                    sx={ {
                      borderColor: '#03288C',
                      color: '#03288C',
                      borderRadius: '6px',
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderWidth: 2,
                      '&:hover': { borderColor: '#03288C', color: '#03288C', borderWidth: 2 },
                    } }
                  >
                    Book Now
                  </Button>

                  <Divider sx={ { my: 3 } } />

                  {/* Provider Info */ }
                  <Typography variant="subtitle2" fontWeight={ 700 } sx={ { mb: 1.5 } }>
                    Service Provider
                  </Typography>
                  <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5 } }>
                    <Avatar sx={ { bgcolor: '#03288C', width: 44, height: 44 } }>
                      { service.provider.name[0] }
                    </Avatar>
                    <Box>
                      <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
                        <Typography variant="subtitle2" fontWeight={ 700 }>
                          { service.provider.name }
                        </Typography>
                        <Verified sx={ { fontSize: 16, color: '#03288C' } } />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        ⭐ { service.provider.rating } · { service.provider.jobs.toLocaleString() } jobs
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Related Services */ }
        { relatedServices.length > 0 && (
          <Box sx={ { mt: 6 } }>
            <Typography variant="h5" fontWeight={ 700 } sx={ { mb: 3 } }>
              Related Services
            </Typography>
            <Grid container spacing={ 3 }>
              { relatedServices.map((s) => (
                <Grid size={ { xs: 12, sm: 6, md: 4 } } key={ s.id }>
                  <motion.div whileHover={ { y: -6 } } transition={ { duration: 0.2 } }>
                    <Card
                      sx={ { borderRadius: 3, cursor: 'pointer', '&:hover': { boxShadow: '0 8px 30px rgba(15,43,102,0.1)' } } }
                      onClick={ () => navigate(`/services/${s.id}`) }
                    >
                      <Box
                        component="img"
                        src={ s.image }
                        alt={ s.name }
                        sx={ { width: '100%', height: 160, objectFit: 'cover' } }
                      />
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={ 700 }>{ s.name }</Typography>
                        <Typography variant="h6" fontWeight={ 800 } sx={ { color: '#03288C' } }>
                          ₹{ s.price.toLocaleString() }
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              )) }
            </Grid>
          </Box>
        ) }
      </Container>

      <Snackbar
        open={ !!cartNotice }
        autoHideDuration={ 2200 }
        onClose={ () => setCartNotice('') }
        anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
      >
        <Alert severity="success" onClose={ () => setCartNotice('') }>
          { cartNotice }
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServiceDetail;
