import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import api from '../utils/api';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [feeSettings, setFeeSettings] = useState({
    platform_fee_rate: 1.02,
    extra_fee_label: '',
    extra_fee_amount: 0,
  });
  const [cartNotice, setCartNotice] = useState('');

  // Fetch platform settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/api/settings/public');
        const s = data.settings || {};
        setFeeSettings({
          platform_fee_rate: s.platform_fee_rate ? Number(s.platform_fee_rate.value) : 1.02,
          extra_fee_label: s.extra_fee_label?.value || '',
          extra_fee_amount: s.extra_fee_amount ? Number(s.extra_fee_amount.value) : 0,
        });
      } catch {
        // Use defaults silently
      }
    };
    fetchSettings();
  }, []);

  const saveToStorage = (newItems) => {
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const addItem = useCallback((service) => {
    setItems((prev) => {
      const exists = prev.find((item) => item.id === service.id);
      let updated;
      if (exists) {
        updated = prev.map((item) =>
          item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prev, { ...service, quantity: 1 }];
      }
      saveToStorage(updated);
      setCartNotice(`${service.name} added to cart`);
      return updated;
    });
  }, []);

  const removeItem = useCallback((serviceId) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== serviceId);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((serviceId, quantity) => {
    if (quantity <= 0) {
      removeItem(serviceId);
      return;
    }
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === serviceId ? { ...item, quantity } : item
      );
      saveToStorage(updated);
      return updated;
    });
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('cart');
  }, []);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const platformFeeRate = feeSettings.platform_fee_rate;
  const platformFee = useMemo(() => Math.round(subtotal * (platformFeeRate / 100) * 100) / 100, [subtotal, platformFeeRate]);

  const extraFeeLabel = feeSettings.extra_fee_label;
  const extraFeeAmount = feeSettings.extra_fee_amount;

  const total = useMemo(() => subtotal + platformFee + extraFeeAmount, [subtotal, platformFee, extraFeeAmount]);

  return (
    <CartContext.Provider
      value={ {
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        platformFee,
        platformFeeRate,
        extraFeeLabel,
        extraFeeAmount,
        total,
        feeSettings,
        cartNotice,
        clearCartNotice: () => setCartNotice(''),
      } }
    >
      { children }
    </CartContext.Provider>
  );
};
