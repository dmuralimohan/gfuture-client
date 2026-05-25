import { useState, useEffect } from 'react';
import { Box, Container, Typography, Avatar, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as MuiIcons from '@mui/icons-material';
import api from '../../utils/api';

const resolveCategoryIcon = (iconName) => {
  const iconKey = String(iconName || '').trim();
  const IconComponent = MuiIcons[iconKey];
  if (IconComponent) return <IconComponent />;

  // Keep a visible placeholder when API sends an invalid or unknown icon name.
  return <MuiIcons.HelpOutline />;
};

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.cachedGet('/api/categories');
        setCategories(Array.isArray(data?.categories) ? data.categories : []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  return (
    <Box sx={ { py: { xs: 4, md: 8 }, background: 'transparent' } }>
      <Container maxWidth="lg">
        <motion.div
          initial={ { opacity: 0, y: 20 } }
          whileInView={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5 } }
          viewport={ { once: true } }
        >
          <Typography
            variant="h6"
            sx={ {
              textAlign: 'center',
              fontStyle: 'italic',
              color: '#5a6a80',
              mb: 5,
              fontWeight: 400,
            } }
          >
            What are you looking for?
          </Typography>
        </motion.div>

        <Box
          sx={ {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: { xs: 3, md: 4 },
          } }
        >
          { categories.map((cat, index) => (
            <motion.div
              key={ cat.id }
              initial={ { opacity: 0, scale: 0.8 } }
              whileInView={ { opacity: 1, scale: 1 } }
              transition={ { duration: 0.4, delay: index * 0.06 } }
              viewport={ { once: true } }
              whileHover={ { scale: 1.08 } }
            >
              <Box
                onClick={ () => navigate(`/services?category=${cat.id}`) }
                sx={ {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  width: 100,
                  textAlign: 'center',
                } }
              >
                <Avatar
                  sx={ {
                    width: 72,
                    height: 72,
                    bgcolor: '#fff',
                    border: '2px solid rgba(15,43,102,0.1)',
                    color: '#03288C',
                    boxShadow: '0 4px 20px rgba(15,43,102,0.06)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#03288C',
                      boxShadow: '0 6px 24px rgba(15,43,102,0.15)',
                    },
                  } }
                >
                  { resolveCategoryIcon(cat.icon) }
                </Avatar>
                <Typography
                  variant="caption"
                  sx={ {
                    fontWeight: 600,
                    color: '#03288C',
                    lineHeight: 1.3,
                    fontSize: '0.7rem',
                  } }
                >
                  { cat.name }
                </Typography>
              </Box>
            </motion.div>
          )) }
        </Box>
      </Container>
    </Box>
  );
};

export default Categories;

