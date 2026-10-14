import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request Interceptor: Attach JWT Bearer Token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized / Token Expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

// Menu Endpoints
export const menuApi = {
  getMenu: async (params = {}) => {
    const res = await api.get('/menu', { params });
    return res.data;
  },
  getMenuItem: async (id) => {
    const res = await api.get(`/menu/${id}`);
    return res.data;
  },
  createMenuItem: async (data) => {
    const res = await api.post('/menu', data);
    return res.data;
  }
};

// Order Endpoints
export const orderApi = {
  createOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },
  getOrder: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  getUserOrders: async () => {
    const res = await api.get('/orders');
    return res.data;
  },
  getAllOrders: async () => {
    const res = await api.get('/orders/all');
    return res.data;
  },
  updateOrderStatus: async (id, status, note) => {
    const res = await api.patch(`/orders/${id}/status`, { status, note });
    return res.data;
  },
  claimOrders: async (orderIds) => {
    const res = await api.post('/orders/claim', { orderIds });
    return res.data;
  },
  getOrdersBatch: async (orderIds) => {
    const res = await api.post('/orders/batch', { orderIds });
    return res.data;
  },
  simulateStatus: async (id) => {
    const res = await api.post(`/orders/${id}/simulate`);
    return res.data;
  }
};

export default api;
