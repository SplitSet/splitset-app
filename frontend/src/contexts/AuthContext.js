import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as apiLogout, isAuthenticated, getStoredUser, clearAuth } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isAuthenticated()) {
          const storedUser = getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
          
          // Verify with server and get latest data
          const response = await getCurrentUser();
          if (response.data) {
            setUser(response.data.user);
            setStores(response.data.stores || []);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearAuth();
        setUser(null);
        setStores([]);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const { login: apiLogin } = await import('../services/api');
      const response = await apiLogin(credentials);
      
      if (response.data) {
        setUser(response.data.user);
        setStores(response.data.stores || []);
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const { register: apiRegister } = await import('../services/api');
      const response = await apiRegister(userData);
      
      if (response.data) {
        setUser(response.data.user);
        setStores([response.data.store]);
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      setStores([]);
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  };

  const refreshUserData = async () => {
    try {
      const response = await getCurrentUser();
      if (response.data) {
        setUser(response.data.user);
        setStores(response.data.stores || []);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // Get current store (for single-store users) or selected store
  const getCurrentStore = () => {
    if (stores.length === 1) {
      return stores[0];
    }
    
    // For multi-store users, get from localStorage or first store
    const selectedStoreId = localStorage.getItem('selectedStoreId');
    if (selectedStoreId) {
      const store = stores.find(s => s.id.toString() === selectedStoreId);
      if (store) return store;
    }
    
    return stores[0] || null;
  };

  const selectStore = (storeId) => {
    localStorage.setItem('selectedStoreId', storeId.toString());
    // Trigger a re-render by updating a dummy state
    setStores(prev => [...prev]);
  };

  const hasStoreAccess = (storeId, requiredRole = 'viewer') => {
    const store = stores.find(s => s.id === storeId);
    if (!store) return false;
    
    const roleHierarchy = ['viewer', 'manager', 'admin', 'owner'];
    const userLevel = roleHierarchy.indexOf(store.userRole || 'viewer');
    const requiredLevel = roleHierarchy.indexOf(requiredRole);
    
    return userLevel >= requiredLevel;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    // State
    user,
    stores,
    loading,
    initialized,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    refreshUserData,
    
    // Store management
    getCurrentStore,
    selectStore,
    hasStoreAccess,
    
    // Utilities
    isAuthenticated: !!user,
    isAdmin,
    currentStore: getCurrentStore()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
