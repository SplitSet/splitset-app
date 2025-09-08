import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Eye, EyeOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const ComponentVisibilityControl = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [componentStats, setComponentStats] = useState({
    totalFound: 0,
    hiddenCount: 0,
    visibleCount: 0
  });

  useEffect(() => {
    // Initial load - we could fetch stats here if needed
  }, []);

  const handleHideAllComponents = async () => {
    if (isLoading) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to hide ALL component products from your storefront? ' +
      'This will make them invisible to customers but keep them functional for bundles.'
    );
    
    if (!confirmed) return;

    setIsLoading(true);
    setLastAction(null);

    try {
      const response = await api.post('/component-visibility/hide-all');
      
      if (response.success) {
        setLastAction({
          success: true,
          message: response.message,
          details: {
            hiddenCount: response.hiddenCount,
            totalFound: response.totalFound
          }
        });
        
        setComponentStats({
          totalFound: response.totalFound,
          hiddenCount: response.hiddenCount,
          visibleCount: response.totalFound - response.hiddenCount
        });
      } else {
        setLastAction({
          success: false,
          message: response.error || 'Failed to hide component products'
        });
      }
    } catch (error) {
      console.error('Error hiding component products:', error);
      setLastAction({
        success: false,
        message: error.message || 'Failed to hide component products'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Component Product Visibility
          </h2>
          <p className="text-sm text-gray-600">
            Control whether split/component products are visible to customers on your storefront
          </p>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">How Component Visibility Works:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Hidden (Recommended):</strong> Component products are draft/unpublished - customers can't see them in search or browse</li>
              <li><strong>Visible:</strong> Component products appear normally on your storefront alongside the main bundle product</li>
              <li><strong>Bundle Functionality:</strong> Works the same regardless of visibility - customers always get individual components in cart</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Display */}
      {componentStats.totalFound > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Components</div>
            <div className="text-2xl font-bold text-gray-900">{componentStats.totalFound}</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Hidden from Customers</div>
            <div className="text-2xl font-bold text-green-600">{componentStats.hiddenCount}</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Visible to Customers</div>
            <div className="text-2xl font-bold text-orange-600">{componentStats.visibleCount}</div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={handleHideAllComponents}
          disabled={isLoading}
          className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Hiding Components...
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide All Component Products
            </>
          )}
        </button>
        
        <div className="text-sm text-gray-500 flex items-center">
          <Eye className="w-4 h-4 mr-1" />
          Recommended: Keep components hidden for better customer experience
        </div>
      </div>

      {/* Last Action Result */}
      {lastAction && (
        <div className={`p-4 rounded-lg mb-4 ${
          lastAction.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className={`flex items-center space-x-2 font-medium ${
            lastAction.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {lastAction.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>{lastAction.success ? 'Success' : 'Error'}</span>
          </div>
          <div className={`text-sm mt-1 ${
            lastAction.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {lastAction.message}
          </div>
          
          {lastAction.details && (
            <div className="mt-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Components Found: </span>
                  {lastAction.details.totalFound}
                </div>
                <div>
                  <span className="font-medium">Successfully Hidden: </span>
                  {lastAction.details.hiddenCount}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Usage Guidelines */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Best Practices:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Always hide component products</strong> to avoid customer confusion</li>
          <li>• <strong>Customers should only see the main bundle product</strong> in search and browse</li>
          <li>• <strong>Bundle functionality works perfectly</strong> with hidden components</li>
          <li>• <strong>Components are still accessible</strong> for cart and inventory management</li>
          <li>• <strong>Run this after creating new bundles</strong> to ensure components are hidden</li>
        </ul>
      </div>
    </div>
  );
};

export default ComponentVisibilityControl;

