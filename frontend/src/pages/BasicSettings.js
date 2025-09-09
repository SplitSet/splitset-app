import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Key, 
  Activity, 
  AlertCircle,
  Save,
  User,
  Store
} from 'lucide-react';

const BasicSettings = () => {
  const { user, currentStore } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [settings, setSettings] = useState({
    shopifyAccessToken: '',
    shopifyApiKey: '',
    shopifyApiSecretKey: '',
    splitsetEnabled: false
  });

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!currentStore?.id) return;
      
      try {
        const response = await api.get(`/stores/${currentStore.id}/settings`);
        if (response.data.success) {
          const data = response.data.data;
          setSettings(prev => ({
            ...prev,
            splitsetEnabled: data.splitsetEnabled || false,
            // Don't load sensitive credentials for security
            shopifyAccessToken: '',
            shopifyApiKey: '',
            shopifyApiSecretKey: ''
          }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [currentStore?.id]);

  const handleSave = async () => {
    if (!currentStore?.id) {
      setMessage('Error: No store selected');
      return;
    }
    
    setSaving(true);
    setMessage('');
    
    try {
      const response = await api.put(`/stores/${currentStore.id}/settings`, settings);
      console.log('Full response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Success value:', response.data?.success);
      console.log('Success type:', typeof response.data?.success);
      
      if ((response.data?.success === true) || (response.success === true) || response.status === 200) {
        console.log('Settings save successful:', response.data);
        setMessage('Settings saved successfully!');
        
        // Clear sensitive fields after successful save
        setSettings(prev => ({
          ...prev,
          shopifyAccessToken: '',
          shopifyApiKey: '',
          shopifyApiSecretKey: ''
        }));
      } else {
        console.log('Save failed, response:', response.data);
        const errorMsg = (response.data && response.data.error) || 'Settings save failed - check console for details';
        setMessage('Error: ' + errorMsg);
      }
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Network error occurred';
      setMessage('Error saving settings: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!currentStore?.id) {
      setMessage('Error: No store selected');
      return;
    }
    
    setMessage('Testing connection...');
    
    try {
      const response = await api.post(`/stores/${currentStore.id}/test-connection`);
      console.log('Test connection response:', response);
      
      if ((response.data?.success === true) || (response.success === true) || response.status === 200) {
        console.log('Connection successful, response data:', response.data);
        const shopName = response.data?.data?.shop?.name || response.data?.shop?.name || 'Unknown Shop';
        setMessage(`Connection successful! Shop: ${shopName}`);
      } else {
        console.log('Connection test failed, response:', response.data);
        const errorMsg = (response.data && response.data.error) || 'Connection failed - check console for details';
        setMessage('Connection test failed: ' + errorMsg);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Network error occurred';
      setMessage('Connection test failed: ' + errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentStore) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please select a store to configure settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Basic Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure your Shopify connection and SplitSet functionality
        </p>
      </div>

      {/* Store Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Store className="h-5 w-5 text-blue-500 mr-2" />
          <div>
            <h3 className="font-medium text-blue-900">Current Store</h3>
            <p className="text-sm text-blue-700">{currentStore.shop_domain}</p>
          </div>
        </div>
      </div>

      {/* Shopify Configuration */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            <Key className="inline h-5 w-5 mr-2" />
            Shopify Configuration
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700">
                Shopify Access Token
              </label>
              <input
                type="password"
                id="accessToken"
                value={settings.shopifyAccessToken}
                onChange={(e) => setSettings(prev => ({ ...prev, shopifyAccessToken: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="shpat_..."
              />
            </div>

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                API Key
              </label>
              <input
                type="text"
                id="apiKey"
                value={settings.shopifyApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, shopifyApiKey: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your Shopify API Key"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-700">
                API Secret Key
              </label>
              <input
                type="password"
                id="apiSecret"
                value={settings.shopifyApiSecretKey}
                onChange={(e) => setSettings(prev => ({ ...prev, shopifyApiSecretKey: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your Shopify API Secret Key"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center">
            <div>
              {message && (
                <div className={`text-sm font-medium ${
                  message.includes('Error') || message.includes('failed') 
                    ? 'text-red-600' 
                    : message.includes('successful') 
                    ? 'text-green-600' 
                    : 'text-blue-600'
                }`}>
                  {message}
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={testConnection}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Activity className="h-4 w-4 mr-2" />
                Test Connection
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SplitSet Control Panel - Coming Soon */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            SplitSet Control Panel
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              🚧 SplitSet enable/disable toggle and theme backup functionality will be available in the next update.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Currently: {settings.splitsetEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center">
          <User className="h-5 w-5 text-gray-500 mr-2" />
          <div>
            <p className="text-sm font-medium text-gray-900">Logged in as: {user?.email}</p>
            <p className="text-xs text-gray-500">Role: {user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicSettings;
