import { useState, useEffect } from 'react';
import { Box, Container, Typography, Avatar, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BuildCircle,
  ElectricalServices,
  CleaningServices,
  WaterDrop,
  Bathtub,
  AcUnit,
  FormatPaint,
  BugReport,
} from '@mui/icons-material';
import { categories as fallbackCategories } from '../../data/mockData';
import api from '../../utils/api';

const iconMap = {
  BuildCircle: <BuildCircle />,
  ElectricalServices: <ElectricalServices />,
  CleaningServices: <CleaningServices />,
  WaterDrop: <WaterDrop />,
  Bathtub: <Bathtub />,
  AcUnit: <AcUnit />,
  FormatPaint: <FormatPaint />,
  BugReport: <BugReport />,
};

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(fallbackCategories);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/api/categories');
        // Map backend categories, keeping icon from fallback if available
        const mapped = data.categories.map((cat) => {
          const fallback = fallbackCategories.find((f) => f.id === cat.id);
          return { ...cat, icon: fallback?.icon || 'BuildCircle' };
        });
        setCategories(mapped);
      } catch {
        // keep fallback
      }
    };
    fetchCategories();
  }, []);

  return (
    <Box sx={{ py: 8, background: 'transparent' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              fontStyle: 'italic',
              color: '#5a6a80',
              mb: 5,
              fontWeight: 400,
            }}
          >
            What are you looking for?
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: { xs: 3, md: 4 },
          }}
        >
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.08 }}
            >
              <Box
                onClick={() => navigate(`/services?category=${cat.id}`)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  width: 100,
                  textAlign: 'center',
                }}
              >
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: '#fff',
                    border: '2px solid rgba(26,58,245,0.1)',
                    color: '#1a3af5',
                    boxShadow: '0 4px 20px rgba(10,22,40,0.06)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#1a3af5',
                      boxShadow: '0 6px 24px rgba(26,58,245,0.15)',
                    },
                  }}
                >
                  {iconMap[cat.icon]}
                </Avatar>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: '#0a1628',
                    lineHeight: 1.3,
                    fontSize: '0.7rem',
                  }}
                >
                  {cat.name}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Categories;

