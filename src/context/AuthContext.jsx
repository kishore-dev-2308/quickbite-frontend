import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, orderApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const claimLocalGuestOrders = async (targetUser) => {
    try {
      const activeUser = targetUser || user;
      if (activeUser?.role === 'admin' || activeUser?.role === 'kitchen') {
        return;
      }
      const saved = localStorage.getItem('quickbite_recent_orders');
      const orderIds = saved ? JSON.parse(saved) : [];
      if (orderIds && orderIds.length > 0) {
        await orderApi.claimOrders(orderIds);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authApi.getProfile();
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            await claimLocalGuestOrders(res.data.user);
          }
        } catch {
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    };

    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    initAuth();

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    const { user: userData, token: jwtToken } = res.data;
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
    await claimLocalGuestOrders(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const { user: newUser, token: jwtToken } = res.data;
    setUser(newUser);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('token', jwtToken);
    await claimLocalGuestOrders(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('quickbite_recent_orders');
    localStorage.removeItem('quickbite_cart');
    window.dispatchEvent(new CustomEvent('auth:logout'));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin' || user?.role === 'kitchen',
    isKitchenStaff: user?.role === 'admin' || user?.role === 'kitchen',
    isCustomer: !user || user.role === 'customer',
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      isAdmin: false,
      isKitchenStaff: false,
      isCustomer: true,
      login: async () => {},
      register: async () => {},
      logout: () => {},
    };
  }
  return context;
};
