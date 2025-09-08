import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null, requiredStoreAccess = null }) => {
  const { user, loading, initialized, hasStoreAccess, isAdmin, currentStore } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    const roleHierarchy = ['store_owner', 'manager', 'admin'];
    const userLevel = roleHierarchy.indexOf(user.role);
    const requiredLevel = roleHierarchy.indexOf(requiredRole);
    
    if (userLevel < requiredLevel && !isAdmin()) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You need {requiredRole} role or higher to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Your current role: {user.role}
            </p>
          </div>
        </div>
      );
    }
  }

  // Check store-specific access
  if (requiredStoreAccess && currentStore) {
    if (!hasStoreAccess(currentStore.id, requiredStoreAccess) && !isAdmin()) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You need {requiredStoreAccess} access or higher to this store.
            </p>
            <p className="text-sm text-gray-500">
              Store: {currentStore.shopDomain}
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
