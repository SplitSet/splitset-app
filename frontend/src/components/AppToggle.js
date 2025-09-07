import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AppToggle = () => {
  const [appStatus, setAppStatus] = useState({
    active: false,
    bundleSectionExists: false,
    bundleProductsCount: 0,
    loading: true
  });
  const [isToggling, setIsToggling] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  useEffect(() => {
    fetchAppStatus();
  }, []);

  const fetchAppStatus = async () => {
    try {
      const response = await api.get('/app-toggle/status');
      if (response.data.success) {
        setAppStatus({
          ...response.data.data,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching app status:', error);
      setAppStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const handleToggle = async () => {
    if (isToggling) return;

    setIsToggling(true);
    setLastAction(null);

    try {
      const endpoint = appStatus.active ? '/app-toggle/deactivate' : '/app-toggle/activate';
      const response = await api.post(endpoint);

      if (response.data.success) {
        setLastAction({
          success: true,
          message: response.data.message,
          details: response.data.details
        });
        
        // Refresh status
        await fetchAppStatus();
      } else {
        setLastAction({
          success: false,
          message: response.data.error || 'Operation failed'
        });
      }
    } catch (error) {
      console.error('Error toggling app:', error);
      setLastAction({
        success: false,
        message: error.response?.data?.error || 'Failed to toggle app status'
      });
    } finally {
      setIsToggling(false);
    }
  };

  const getStatusColor = () => {
    if (appStatus.loading) return 'bg-gray-500';
    return appStatus.active ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = () => {
    if (appStatus.loading) return 'Loading...';
    return appStatus.active ? 'Active' : 'Inactive';
  };

  if (appStatus.loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Bundle App Control
          </h2>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <span className="text-sm font-medium text-gray-700">
              Status: {getStatusText()}
            </span>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isToggling
              ? 'bg-gray-400 cursor-not-allowed'
              : appStatus.active
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isToggling ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            appStatus.active ? 'Deactivate App' : 'Activate App'
          )}
        </button>
      </div>

      {/* App Status Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Bundle Sections</div>
          <div className="text-lg font-semibold">
            {appStatus.bundleSectionExists ? (
              <span className="text-green-600">✓ Installed</span>
            ) : (
              <span className="text-red-600">✗ Not Found</span>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Bundle Products</div>
          <div className="text-lg font-semibold text-blue-600">
            {appStatus.bundleProductsCount}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Last Checked</div>
          <div className="text-sm text-gray-800">
            {appStatus.lastChecked ? 
              new Date(appStatus.lastChecked).toLocaleTimeString() : 
              'Never'
            }
          </div>
        </div>
      </div>

      {/* Last Action Result */}
      {lastAction && (
        <div className={`p-4 rounded-lg mb-4 ${
          lastAction.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className={`font-medium ${
            lastAction.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {lastAction.success ? '✓ Success' : '✗ Error'}
          </div>
          <div className={`text-sm mt-1 ${
            lastAction.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {lastAction.message}
          </div>
          
          {lastAction.details && (
            <div className="mt-3 text-xs">
              <details className="cursor-pointer">
                <summary className="font-medium">View Details</summary>
                <pre className="mt-2 p-2 bg-white rounded border text-gray-600 overflow-auto">
                  {JSON.stringify(lastAction.details, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      {/* App Status Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">What does this do?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Activate:</strong> Installs bundle sections to theme, enables bundle functionality</li>
          <li><strong>Deactivate:</strong> Removes all bundle sections, resets products to normal display</li>
          <li><strong>Safe Operation:</strong> No data is lost, can be toggled anytime</li>
        </ul>
      </div>

      {/* Refresh Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={fetchAppStatus}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default AppToggle;
