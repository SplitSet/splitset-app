import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://splitset-backend.onrender.com' : '/api'),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for authentication
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    // Check for new token in response headers
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('authToken', newToken);
    }
    return response.data;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
);

// Products API
export const fetchProducts = async (limit = 50, pageInfo = null) => {
  const params = { limit };
  if (pageInfo) params.page_info = pageInfo;
  
  const response = await api.get('/products', { params });
  return response.data;
};

export const fetchProduct = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

export const searchProducts = async (query) => {
  const response = await api.get(`/products/search/${encodeURIComponent(query)}`);
  return response.data;
};

// Predictive search suggestions (lightweight)
export const predictProducts = async (q, limit = 8) => {
  const response = await api.get('/products/predict', { params: { q, limit } });
  return response.data;
};

export const duplicateProduct = async ({ productId, titleSuffix, bundleProducts, discount }) => {
  const response = await api.post(`/products/${productId}/duplicate`, {
    titleSuffix,
    bundleProducts,
    discount
  });
  return response.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await api.put(`/products/${productId}`, productData);
  return response.data;
};

// Bundle API
export const createBundle = async (bundleData) => {
  const response = await api.post('/bundles/create', bundleData);
  return response.data;
};

export const fetchBundles = async () => {
  const response = await api.get('/bundles');
  return response.data;
};

export const fetchBundleConfig = async (bundleId) => {
  const response = await api.get(`/bundles/${bundleId}/config`);
  return response.data;
};

export const generateBundleCartData = async (bundleProductId, variantId, quantity = 1) => {
  const response = await api.post('/bundles/cart-data', {
    bundleProductId,
    variantId,
    quantity
  });
  return response.data;
};

export const calculateBundlePrice = async (bundleProductId, quantity = 1) => {
  const response = await api.post('/bundles/calculate-price', {
    bundleProductId,
    quantity
  });
  return response.data;
};

// Orders API
export const fetchOrders = async (limit = 50, status = 'any') => {
  const response = await api.get('/orders', { 
    params: { limit, status } 
  });
  return response.data;
};

export const fetchBundleOrders = async (limit = 50) => {
  const response = await api.get('/orders/bundles', { 
    params: { limit } 
  });
  return response.data;
};

export const fetchBundleAnalytics = async (days = 30) => {
  const response = await api.get('/orders/bundle-analytics', { 
    params: { days } 
  });
  return response.data;
};

// Shopify API
export const testShopifyConnection = async () => {
  const response = await api.get('/shopify/test-connection');
  return response.data;
};

export const fetchShopInfo = async () => {
  const response = await api.get('/shopify/shop-info');
  return response.data;
};

export const validateShopifyToken = async () => {
  const response = await api.get('/shopify/validate-token');
  return response.data;
};

export const fetchApiUsage = async () => {
  const response = await api.get('/shopify/api-usage');
  return response.data;
};

export const fetchShopifyPermissions = async () => {
  const response = await api.get('/shopify/permissions');
  return response.data;
};

// Utility functions
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const generateBundleSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Cart transformation utilities (for frontend integration)
export const addBundleToCart = async (bundleProductId, variantId, quantity = 1) => {
  try {
    // Get bundle cart data
    const cartData = await generateBundleCartData(bundleProductId, variantId, quantity);
    
    // This would typically integrate with Shopify's Ajax Cart API
    // For demo purposes, we'll return the cart items structure
    return {
      success: true,
      cartItems: cartData.cartItems,
      bundleInfo: cartData.bundleInfo
    };
  } catch (error) {
    throw new Error(`Failed to add bundle to cart: ${error.message}`);
  }
};

// Demo cart integration (this would be replaced with actual Shopify cart integration)
export const simulateCartAdd = (cartItems) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Adding to cart:', cartItems);
      resolve({
        success: true,
        message: 'Bundle added to cart successfully!'
      });
    }, 1000);
  });
};

export const fetchSplitterSummary = async () => {
  const response = await api.get('/analytics/splitter/summary');
  return response.data;
};

export const refreshSplitterSummary = async () => {
  const response = await api.post('/analytics/splitter/refresh');
  return response.data;
};

// Authentication API
export const register = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  if (response.data?.token) {
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response;
};

export const login = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  if (response.data?.token) {
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response;
};

export const logout = async () => {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    // Continue with local logout even if API call fails
  } finally {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  if (response.data?.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/me', profileData);
  return response;
};

export const changePassword = async (passwordData) => {
  const response = await api.post('/auth/change-password', passwordData);
  return response;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response;
};

export const resetPassword = async (token, password) => {
  const response = await api.post('/auth/reset-password', { token, password });
  return response;
};

export const checkAuthStatus = async () => {
  const response = await api.get('/auth/status');
  return response;
};

// Store-specific analytics (updated for authentication)
export const fetchStoreAnalytics = async (storeId, year, month) => {
  const params = {};
  if (year) params.year = year;
  if (month) params.month = month;
  
  const response = await api.get(`/analytics/${storeId}/summary`, { params });
  return response;
};

export const refreshStoreAnalytics = async (storeId, force = false) => {
  const response = await api.post(`/analytics/${storeId}/refresh`, { force });
  return response;
};

// User's stores
export const fetchUserStores = async () => {
  const response = await api.get('/stores');
  return response;
};

// Utility functions for authentication
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export default api;
