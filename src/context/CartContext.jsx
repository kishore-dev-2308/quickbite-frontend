import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const FREE_DELIVERY_THRESHOLD = 40.0;
const STANDARD_DELIVERY_FEE = 3.99;
const TAX_RATE = 0.08;

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('quickbite_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('quickbite_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    const handleLogout = () => {
      setItems([]);
      localStorage.removeItem('quickbite_cart');
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i._id === product._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const syncWithMenu = (liveMenuItems) => {
    if (!Array.isArray(liveMenuItems) || liveMenuItems.length === 0) return;
    setItems((prev) => {
      if (!prev || prev.length === 0) return prev;
      const liveMapByName = new Map(liveMenuItems.map((m) => [m.name, m]));
      const liveMapById = new Map(liveMenuItems.map((m) => [m._id, m]));

      let hasChanges = false;
      const updated = prev.map((item) => {
        const match = liveMapById.get(item._id) || liveMapByName.get(item.name);
        if (match) {
          if (match._id !== item._id || match.price !== item.price) {
            hasChanges = true;
          }
          return {
            ...match,
            quantity: item.quantity,
          };
        }
        return item;
      });

      return hasChanges ? updated : prev;
    });
  };

  // Computations
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = parseFloat(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)
  );

  const deliveryFee =
    items.length === 0
      ? 0
      : subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : STANDARD_DELIVERY_FEE;

  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));

  const totalAmount = parseFloat((subtotal + deliveryFee + tax).toFixed(2));

  const value = {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    tax,
    totalAmount,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    syncWithMenu,
    FREE_DELIVERY_THRESHOLD
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
