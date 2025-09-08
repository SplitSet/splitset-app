import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown, Store, Check } from 'lucide-react';
import { ElasticIconButton } from './ElasticButton';

const StoreSelector = () => {
  const { stores, currentStore, selectStore } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if user has only one store
  if (stores.length <= 1) {
    return null;
  }

  const handleStoreSelect = (storeId) => {
    selectStore(storeId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        type="button"
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-shopify-500"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        <Store className="w-4 h-4 text-gray-400" />
        <span className="text-gray-700">
          {currentStore?.shopDomain || 'Select Store'}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </motion.button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-1 w-72 bg-white shadow-lg rounded-md border border-gray-200 py-1">
            <div className="px-3 py-2 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Your Stores
              </p>
            </div>
            
            {stores.map((store) => (
              <motion.button
                key={store.id}
                onClick={() => handleStoreSelect(store.id)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                whileHover={{ scale: 1.01, x: 2 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {store.shopDomain}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        store.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {store.status}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {store.plan}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {store.userRole}
                      </span>
                    </div>
                    {store.currentMonthOrders !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        {store.currentMonthOrders} orders this month • ₹{store.currentMonthCharges || 0}
                      </p>
                    )}
                  </div>
                  
                  {currentStore?.id === store.id && (
                    <Check className="w-4 h-4 text-shopify-600" />
                  )}
                </div>
              </motion.button>
            ))}
            
            <div className="border-t border-gray-200 mt-1 pt-1">
              <div className="px-3 py-2">
                <p className="text-xs text-gray-500">
                  Need to add another store?{' '}
                  <button className="text-shopify-600 hover:text-shopify-500 font-medium">
                    Contact support
                  </button>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StoreSelector;
