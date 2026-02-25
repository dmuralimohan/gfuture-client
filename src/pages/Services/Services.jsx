import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Rating,
  Grid,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { Search, Star, AccessTime, ShoppingCart, FilterList } from '@mui/icons-material';
import { categories as fallbackCategories, services as fallbackServices } from '../../data/mockData';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Services = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const categoryFilter = searchParams.get('category');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter ? Number(categoryFilter) : 0);
  const [sortBy, setSortBy] = useState('popular');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.cachedGet('/api/categories');
        setCategories(data.categories);
      } catch {
        setCategories(fallbackCategories);
      }
    };
    fetchCategories();
  }, []);

  // Fetch services from API with filters
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();
      if (sortBy !== 'popular') params.sort = sortBy;
      params.limit = 50;

      const { data } = await api.cachedGet('/api/services', { params });
      // Normalize backend shape to frontend shape
      const normalized = data.services.map((s) => ({
        ...s,
        categoryId: s.category_id,
        category: s.category_name || '',
        includes: s.includes || [],
      }));
      setServices(normalized);
      setTotalResults(data.total);
    } catch {
      // Fallback to mock data if API is unreachable
      setServices(fallbackServices);
      setTotalResults(fallbackServices.length);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search, sortBy]);

  useEffect(() => {
    const debounce = setTimeout(fetchServices, 300);
    return () => clearTimeout(debounce);
  }, [fetchServices]);

  const handleAddToCart = (service) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addItem(service);
  };

  return (
    <Box sx={ { py: 4, minHeight: '80vh' } }>
      <Container maxWidth="lg">
        {/* Header */ }
        <motion.div
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5 } }
        >
          <Typography
            variant="h3"
            sx={ { fontWeight: 800, mb: 1, fontSize: { xs: '1.8rem', md: '2.4rem' } } }
          >
            MARKETPLACE
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
            Browse and book trusted services from verified providers
          </Typography>
        </motion.div>

        {/* Search and Filters */ }
        <motion.div
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5, delay: 0.1 } }
        >
          <Box
            sx={ {
              display: 'flex',
              gap: 2,
              mb: 3,
              flexWrap: 'wrap',
              alignItems: 'center',
            } }
          >
            <TextField
              placeholder="Search services... (e.g. washing machine repair)"
              value={ search }
              onChange={ (e) => setSearch(e.target.value) }
              sx={ {
                flex: 1,
                minWidth: 280,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fff',
                  borderRadius: 3,
                },
              } }
              InputProps={ {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={ { color: '#5a6a80' } } />
                  </InputAdornment>
                ),
              } }
            />
            <FormControl sx={ { minWidth: 160 } }>
              <Select
                value={ sortBy }
                onChange={ (e) => setSortBy(e.target.value) }
                size="small"
                sx={ { bgcolor: '#fff', borderRadius: 3 } }
              >
                <MenuItem value="popular">Most Popular</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="price-low">Price: Low → High</MenuItem>
                <MenuItem value="price-high">Price: High → Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </motion.div>

        {/* Category Chips */ }
        <motion.div
          initial={ { opacity: 0 } }
          animate={ { opacity: 1 } }
          transition={ { duration: 0.5, delay: 0.2 } }
        >
          <Box sx={ { display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' } }>
            <Chip
              label="All"
              onClick={ () => setSelectedCategory(0) }
              sx={ {
                fontWeight: 600,
                bgcolor: selectedCategory === 0 ? '#03288C' : '#fff',
                color: selectedCategory === 0 ? '#fff' : '#03288C',
                border: '1px solid',
                borderColor: selectedCategory === 0 ? '#03288C' : 'rgba(15,43,102,0.15)',
                '&:hover': { bgcolor: selectedCategory === 0 ? '#021A66' : '#f0f4ff' },
              } }
            />
            { categories.map((cat) => (
              <Chip
                key={ cat.id }
                label={ cat.name }
                onClick={ () => setSelectedCategory(cat.id === selectedCategory ? 0 : cat.id) }
                sx={ {
                  fontWeight: 600,
                  bgcolor: selectedCategory === cat.id ? '#03288C' : '#fff',
                  color: selectedCategory === cat.id ? '#fff' : '#03288C',
                  border: '1px solid',
                  borderColor: selectedCategory === cat.id ? '#03288C' : 'rgba(15,43,102,0.15)',
                  '&:hover': { bgcolor: selectedCategory === cat.id ? '#021A66' : '#f0f4ff' },
                } }
              />
            )) }
          </Box>
        </motion.div>

        {/* Results count */ }
        <Typography variant="body2" color="text.secondary" sx={ { mb: 3 } }>
          { loading ? 'Loading...' : `${totalResults} service${totalResults !== 1 ? 's' : ''} found` }
        </Typography>

        {/* Loading Skeletons */ }
        { loading && (
          <Grid container spacing={ 3 }>
            { [1, 2, 3, 4, 5, 6].map((i) => (
              <Grid size={ { xs: 12, sm: 6, md: 4 } } key={ i }>
                <Card sx={ { borderRadius: 4, overflow: 'hidden' } }>
                  <Skeleton variant="rectangular" height={ 200 } />
                  <CardContent>
                    <Skeleton variant="text" width="80%" height={ 28 } />
                    <Skeleton variant="text" width="50%" />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            )) }
          </Grid>
        ) }

        {/* Service Grid */ }
        { !loading && (
          <Grid container spacing={ 3 }>
            <AnimatePresence>
              { services.map((service, index) => (
                <Grid size={ { xs: 12, sm: 6, md: 4 } } key={ service.id }>
                  <motion.div
                    initial={ { opacity: 0, y: 30 } }
                    animate={ { opacity: 1, y: 0 } }
                    exit={ { opacity: 0, y: -20 } }
                    transition={ { duration: 0.4, delay: index * 0.05 } }
                    layout
                  >
                    <Card
                      sx={ {
                        borderRadius: 4,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid rgba(15,43,102,0.06)',
                        '&:hover': {
                          boxShadow: '0 12px 40px rgba(15,43,102,0.12)',
                          transform: 'translateY(-6px)',
                        },
                        transition: 'all 0.3s ease',
                      } }
                    >
                      <Box
                        onClick={ () => navigate(`/services/${service.id}`) }
                        sx={ { position: 'relative' } }
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={ service.image }
                          alt={ service.name }
                          sx={ { objectFit: 'cover' } }
                        />
                        <Chip
                          label={ service.category }
                          size="small"
                          sx={ {
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            bgcolor: 'rgba(255,255,255,0.95)',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            backdropFilter: 'blur(10px)',
                          } }
                        />
                      </Box>

                      <CardContent
                        sx={ { flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 } }
                      >
                        <Typography
                          variant="h6"
                          onClick={ () => navigate(`/services/${service.id}`) }
                          sx={ {
                            fontWeight: 700,
                            mb: 1,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            '&:hover': { color: '#03288C' },
                          } }
                        >
                          { service.name }
                        </Typography>

                        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 } }>
                          <Rating value={ service.rating } precision={ 0.1 } readOnly size="small" />
                          <Typography variant="caption" color="text.secondary">
                            ({ service.reviews.toLocaleString() })
                          </Typography>
                        </Box>

                        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 1 } }>
                          <AccessTime sx={ { fontSize: 16, color: '#5a6a80' } } />
                          <Typography variant="caption" color="text.secondary">
                            { service.duration }
                          </Typography>
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={ {
                            mb: 2,
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.5,
                          } }
                        >
                          { service.description }
                        </Typography>

                        <Box
                          sx={ {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mt: 'auto',
                          } }
                        >
                          <Typography variant="h6" sx={ { fontWeight: 800, color: '#03288C' } }>
                            ₹{ service.price.toLocaleString() }
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={ <ShoppingCart /> }
                            onClick={ (e) => {
                              e.stopPropagation();
                              handleAddToCart(service);
                            } }
                            sx={ {
                              bgcolor: '#03288C',
                              borderRadius: '6px',
                              px: 2,
                              fontSize: '0.75rem',
                              '&:hover': { bgcolor: '#03288C' },
                            } }
                          >
                            Add
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              )) }
            </AnimatePresence>
          </Grid>
        ) }

        { !loading && services.length === 0 && (
          <Box sx={ { textAlign: 'center', py: 10 } }>
            <Typography variant="h5" fontWeight={ 700 } sx={ { mb: 1 } }>
              No services found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search or filter criteria
            </Typography>
          </Box>
        ) }
      </Container>
    </Box>
  );
};

export default Services;
