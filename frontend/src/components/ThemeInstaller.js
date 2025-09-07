import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Loader, Download, Trash2, Info } from 'lucide-react';

const ThemeInstaller = () => {
  const [installing, setInstalling] = useState(false);
  const [uninstalling, setUninstalling] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [installationStatus, setInstallationStatus] = useState(null);

  // Check installation status on mount
  React.useEffect(() => {
    checkInstallation();
  }, []);

  const checkInstallation = async () => {
    try {
      const response = await axios.get('/api/theme/check-installation');
      setInstallationStatus(response.data);
    } catch (error) {
      console.error('Error checking installation:', error);
    }
  };

  const handleInstall = async () => {
    setInstalling(true);
    setError(null);
    setStatus(null);

    try {
      const response = await axios.post('/api/theme/install-bundle-display');
      
      if (response.data.success) {
        setStatus({
          type: 'success',
          message: response.data.message,
          details: response.data.details
        });
        // Refresh installation status
        await checkInstallation();
      } else {
        setError(response.data.error || 'Installation failed');
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    } finally {
      setInstalling(false);
    }
  };

  const handleUninstall = async () => {
    if (!window.confirm('Are you sure you want to uninstall the bundle display from your theme?')) {
      return;
    }

    setUninstalling(true);
    setError(null);
    setStatus(null);

    try {
      const response = await axios.post('/api/theme/uninstall-bundle-display');
      
      if (response.data.success) {
        setStatus({
          type: 'success',
          message: response.data.message
        });
        // Refresh installation status
        await checkInstallation();
      } else {
        setError(response.data.error || 'Uninstallation failed');
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    } finally {
      setUninstalling(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Automatic Theme Installation
        </h2>
        <p className="text-gray-600">
          Install bundle display components directly into your Shopify theme without manual editing.
        </p>
      </div>

      {/* Current Status */}
      {installationStatus && (
        <div className={`mb-6 p-4 rounded-lg ${
          installationStatus.installed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center">
            {installationStatus.installed ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <Info className="h-5 w-5 text-yellow-500 mr-2" />
            )}
            <div>
              <p className="font-medium text-gray-900">
                {installationStatus.message}
              </p>
              {installationStatus.theme && (
                <p className="text-sm text-gray-600 mt-1">
                  Active theme: {installationStatus.theme}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Installation Details */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">What will be installed:</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Bundle display snippet (snippets/bundle-display.liquid)</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Product template integration (automatic bundle detection)</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Variant synchronization JavaScript</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Cart add functionality for bundle components</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!installationStatus?.installed ? (
          <button
            onClick={handleInstall}
            disabled={installing}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {installing ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Installing...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Install Bundle Display
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleUninstall}
            disabled={uninstalling}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uninstalling ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Uninstalling...
              </>
            ) : (
              <>
                <Trash2 className="h-5 w-5 mr-2" />
                Uninstall Bundle Display
              </>
            )}
          </button>
        )}
        
        <button
          onClick={checkInstallation}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Check Status
        </button>
      </div>

      {/* Status Messages */}
      {status && (
        <div className={`mt-6 p-4 rounded-lg ${
          status.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start">
            {status.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">{status.message}</p>
              {status.details && (
                <div className="mt-2 text-sm text-gray-700">
                  <p>✅ Theme: {status.details.theme}</p>
                  <p>✅ Snippet: {status.details.snippetInstalled ? 'Installed' : 'Failed'}</p>
                  <p>✅ Template: {status.details.templateUpdated ? 'Updated' : 'Manual update required'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Installation Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">How it works:</h4>
        <ol className="space-y-2 text-sm text-gray-700">
          <li>1. Click "Install Bundle Display" to automatically add bundle functionality to your theme</li>
          <li>2. The system will create the necessary files and update your product template</li>
          <li>3. Processed bundle products will automatically display their components on product pages</li>
          <li>4. Customers can add all bundle items to cart with synchronized variants</li>
        </ol>
        
        <p className="mt-3 text-sm text-gray-600">
          <strong>Note:</strong> If automatic template update fails, you may need to manually add the bundle 
          include code to your product template. Check the console for details.
        </p>
      </div>
    </div>
  );
};

export default ThemeInstaller;
