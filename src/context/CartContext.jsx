import { createContext, useContext, useState, useCallback, useMemo } from 'react';

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

  const platformFee = useMemo(() => Math.round(subtotal * 0.0102 * 100) / 100, [subtotal]);

  const total = useMemo(() => subtotal + platformFee, [subtotal, platformFee]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        platformFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
