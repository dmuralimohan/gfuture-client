import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Divider,
  Avatar,
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCartOutlined, ArrowForward } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, subtotal, platformFee, total, totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <Box sx={{ py: 10, textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <ShoppingCartOutlined sx={{ fontSize: 80, color: '#d0d5dd', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Explore our marketplace and add services
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/services')}
              sx={{ bgcolor: '#1a3af5', borderRadius: '30px', px: 4, py: 1.2, '&:hover': { bgcolor: '#0a2ae5' } }}
            >
              Browse Services
            </Button>
          </motion.div>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 1, fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
            Your Cart
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Items */}
          <Box sx={{ flex: 1 }}>
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card sx={{ mb: 2, borderRadius: 3, border: '1px solid rgba(26,58,245,0.06)' }}>
                    <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Avatar
                        src={item.image}
                        variant="rounded"
                        sx={{ width: 80, height: 80, borderRadius: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.category} · {item.duration}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          sx={{ border: '1px solid #e0e0e0' }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography fontWeight={700} sx={{ width: 24, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          sx={{ border: '1px solid #e0e0e0' }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>

                      <Typography variant="h6" fontWeight={800} sx={{ minWidth: 80, textAlign: 'right', color: '#1a3af5' }}>
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </Typography>

                      <IconButton onClick={() => removeItem(item.id)} sx={{ color: '#e53e3e' }}>
                        <Delete />
                      </IconButton>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              sx={{
                borderRadius: 4,
                minWidth: { md: 340 },
                position: 'sticky',
                top: 100,
                border: '2px solid rgba(26,58,245,0.1)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                  Order Summary
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2" fontWeight={600}>₹{subtotal.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Platform Fee (1.02%)
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>₹{platformFee.toFixed(2)}</Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={800}>Total</Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ color: '#1a3af5' }}>
                    ₹{total.toFixed(2)}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={handleCheckout}
                  sx={{
                    bgcolor: '#1a3af5',
                    borderRadius: '30px',
                    py: 1.5,
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#0a2ae5' },
                  }}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default Cart;

