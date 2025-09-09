import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Search,
  Layers,
  IndianRupee,
  ShoppingBag,
  RefreshCw,
  Settings,
  Square,
  CheckSquare,
  Minus,
  X,
  Minimize2
} from 'lucide-react';
import toast from 'react-hot-toast';

import LoadingSpinner from '../components/LoadingSpinner';
import ThemeInstaller from '../components/ThemeInstaller';

const SetManager = () => {
  const { currentStore } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageInfo, setNextPageInfo] = useState(null);
  const [showProcessAll, setShowProcessAll] = useState(false);
  const [processingState, setProcessingState] = useState(null); // null, 'processing', 'splitting', 'completed'
  const [showThemeInstaller, setShowThemeInstaller] = useState(false);
  
  // Selection state
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Batch processing state
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({
    current: 0,
    total: 0,
    currentProduct: null,
    completed: [],
    failed: [],
    isBackground: false
  });

  // Manual refresh function
  const handleManualRefresh = async () => {
    try {
      console.log('Manual refresh initiated');
      
      // Reset all states
      setCurrentPage(1);
      setNextPageInfo(null);
      setSelectedProducts(new Set());
      setSelectAll(false);
      setSelectedProduct(null);
      
      // Force refetch with cache invalidation
      await refetchSets();
      
      toast.success('Products refreshed successfully!');
    } catch (error) {
      console.error('Manual refresh error:', error);
      toast.error('Failed to refresh products');
    }
  };

  // Add keyboard shortcut for refresh
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        handleManualRefresh();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleManualRefresh]);

  // Fetch all set products
  const { 
    data: setProductsData, 
    isLoading: loadingSets, 
    error: loadingError,
    refetch: refetchSets 
  } = useQuery(['setProducts', currentStore?.id, currentPage, nextPageInfo], async () => {
    if (!currentStore?.id) {
      throw new Error('No store selected');
    }
    
    try {
      // Add timeout to prevent infinite hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Build URL with pagination parameters
      const params = new URLSearchParams({
        page: currentPage.toString()
      });
      
      if (nextPageInfo) {
        params.append('pageInfo', nextPageInfo);
      }
      
      const response = await fetch(`/api/sets/${currentStore.id}/find-all?${params}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch set products');
      return data.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - backend may not be responding');
      }
      console.error('Error fetching set products:', error);
      throw error;
    }
  }, {
    enabled: !!currentStore?.id,
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    cacheTime: 1000 * 60 * 5, // 5 minutes
    staleTime: 1000 * 30, // 30 seconds
    onError: (error) => {
      console.error('Query error:', error);
      toast.error(`Failed to load set products: ${error.message}`);
    },
    onSuccess: (data) => {
      console.log('Set products loaded successfully:', data?.count || 0, 'products');
    }
  });

  // Selection helper functions
  const handleProductSelect = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    
    // Update select all state
    const availableProducts = setProductsData?.setProducts || [];
    setSelectAll(newSelected.size === availableProducts.length && availableProducts.length > 0);
  };

  const handleSelectAll = () => {
    const availableProducts = setProductsData?.setProducts || [];
    if (selectAll) {
      // Unselect all
      setSelectedProducts(new Set());
      setSelectAll(false);
    } else {
      // Select all
      const allIds = new Set(availableProducts.map(p => p.id));
      setSelectedProducts(allIds);
      setSelectAll(true);
    }
  };

  const getSelectionState = () => {
    const availableProducts = setProductsData?.setProducts || [];
    const selectedCount = selectedProducts.size;
    const totalCount = availableProducts.length;
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === totalCount) return 'all';
    return 'partial';
  };

  // Check individual product
  const checkProductMutation = useMutation(
    async (productId) => {
      if (!currentStore?.id) {
        throw new Error('No store selected');
      }
      const response = await fetch(`/api/sets/${currentStore.id}/check/${productId}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    {
      onSuccess: (data) => {
        setSelectedProduct(data);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to check product');
      }
    }
  );

  // Process single product
  const processProductMutation = useMutation(
    async (productId) => {
      console.log('Sending POST request to process product:', productId);
      setProcessingState('processing');
      
      try {
        // Start with processing state
        // After 3 seconds, show splitting
        const splittingTimer = setTimeout(() => {
          setProcessingState(prevState => 
            prevState === 'processing' ? 'splitting' : prevState
          );
        }, 3000);
        
        if (!currentStore?.id) {
          throw new Error('No store selected');
        }
        
        const response = await fetch(`/api/sets/${currentStore.id}/process/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        clearTimeout(splittingTimer);
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        if (!data.success) throw new Error(data.error || 'Failed to process product');
        
        // Show completed state
        setProcessingState('completed');
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setSelectedProduct(null);
          setProcessingState(null);
          refetchSets(); // Refresh the data
          toast.success('Product processed successfully! Component products are hidden from storefront.');
        }, 2000);
        
        return data;
      } catch (error) {
        console.error('Error processing product:', error);
        setProcessingState(null);
        throw error;
      }
    },
    {
      onSuccess: (data) => {
        console.log('Process successful:', data);
        toast.success(`Successfully created bundle: ${data.data.originalProduct.title}`);
        refetchSets();
      },
      onError: (error) => {
        console.error('Process failed:', error);
        toast.error(error.message || 'Failed to process product');
        setProcessingState(null);
      }
    }
  );

  // Process all products
  const processAllMutation = useMutation(
    async () => {
      if (!currentStore?.id) {
        throw new Error('No store selected');
      }
      
      const response = await fetch(`/api/sets/${currentStore.id}/process-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmProcessAll: true })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    {
      onSuccess: (data) => {
        toast.success(`Processed ${data.data.processedCount} products successfully`);
        refetchSets();
        setShowProcessAll(false);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to process all products');
      }
    }
  );

  // Batch process selected products
  const processBatchProducts = async (productIds, allowBackground = false) => {
    if (!productIds || productIds.length === 0) {
      toast.error('No products selected for processing');
      return;
    }

    setBatchProcessing(true);
    setBatchProgress({
      current: 0,
      total: productIds.length,
      currentProduct: null,
      completed: [],
      failed: [],
      isBackground: allowBackground
    });

    const results = {
      completed: [],
      failed: []
    };

    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];
      const product = setProductsData?.products?.find(p => p.id === productId);
      
      // Update progress
      setBatchProgress(prev => ({
        ...prev,
        current: i + 1,
        currentProduct: product
      }));

      try {
        console.log(`Processing product ${i + 1}/${productIds.length}:`, productId);
        
        if (!currentStore?.id) {
          throw new Error('No store selected');
        }
        
        const response = await fetch(`/api/sets/${currentStore.id}/process/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Failed to process product');

        results.completed.push({
          productId,
          product,
          data: data.data
        });

        // Update progress with success
        setBatchProgress(prev => ({
          ...prev,
          completed: [...prev.completed, { productId, product, success: true }]
        }));

        console.log(`✅ Successfully processed: ${product?.title}`);

      } catch (error) {
        console.error(`❌ Failed to process product ${productId}:`, error);
        
        results.failed.push({
          productId,
          product,
          error: error.message
        });

        // Update progress with failure
        setBatchProgress(prev => ({
          ...prev,
          failed: [...prev.failed, { productId, product, error: error.message }]
        }));
      }

      // Small delay between requests to avoid overwhelming the server
      if (i < productIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Final results
    const successCount = results.completed.length;
    const failureCount = results.failed.length;

    if (successCount > 0) {
      toast.success(`Successfully processed ${successCount} products! Component products are hidden from storefront.`);
    }
    
    if (failureCount > 0) {
      toast.error(`Failed to process ${failureCount} products. Check the progress details.`);
    }

    // Refresh the data
    refetchSets();

    // Keep progress visible for a moment before clearing
    setTimeout(() => {
      setBatchProcessing(false);
      setBatchProgress({
        current: 0,
        total: 0,
        currentProduct: null,
        completed: [],
        failed: [],
        isBackground: false
      });
    }, 3000);

    return results;
  };

  const handleCheckProduct = (productId) => {
    checkProductMutation.mutate(productId);
  };

  const handleProcessProduct = (productId) => {
    console.log('Processing product with ID:', productId);
    if (!productId) {
      console.error('Product ID is undefined!');
      toast.error('Product ID is missing');
      return;
    }
    processProductMutation.mutate(productId);
  };

  const handleProcessAll = () => {
    processAllMutation.mutate();
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  if (loadingSets) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading set products...</p>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Set Products</h2>
        <p className="text-gray-600 mb-4">{loadingError.message}</p>
        <button
          onClick={() => refetchSets()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Layers className="text-green-600" />
                Set Manager
              </h1>
              <p className="text-gray-600 mt-2">
                Automatically create bundles from products with "set" in their title
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowThemeInstaller(!showThemeInstaller)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Theme Setup
              </button>
              
              <button
                onClick={handleManualRefresh}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loadingSets}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingSets ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {setProductsData?.setProducts?.length > 0 && (
                <>
                  <button
                    onClick={() => setShowProcessAll(true)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Process All Sets
                  </button>
                  
                  {selectedProducts.size > 0 && (
                    <button
                      onClick={() => processBatchProducts(Array.from(selectedProducts))}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={batchProcessing}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Process Selected ({selectedProducts.size})
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Theme Installer */}
        {showThemeInstaller && (
          <ThemeInstaller />
        )}

        {/* Stats Cards */}
        {setProductsData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Layers className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sets Found</p>
                  <p className="text-2xl font-bold text-gray-900">{setProductsData.count}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Already Processed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {setProductsData.setProducts.filter(p => p.isProcessed).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Processing</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {setProductsData.setProducts.filter(p => !p.isProcessed).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Set Products List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Set Products</h2>
              
              {setProductsData?.setProducts?.length > 0 && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      {getSelectionState() === 'all' ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : getSelectionState() === 'partial' ? (
                        <Minus className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      <span>
                        {getSelectionState() === 'all' ? 'Unselect All' : 'Select All'}
                      </span>
                    </button>
                  </div>
                  
                  {selectedProducts.size > 0 && (
                    <span className="text-sm text-blue-600 font-medium">
                      {selectedProducts.size} selected
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {setProductsData?.setProducts?.length > 0 ? (
            <>
              <div className="divide-y divide-gray-200">
                {setProductsData.setProducts.map((product) => (
                  <div key={product.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleProductSelect(product.id)}
                          className="flex-shrink-0"
                        >
                          {selectedProducts.has(product.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {product.title}
                            </h3>
                            {product.isProcessed ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Processed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Pending
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <IndianRupee className="w-4 h-4 mr-1" />
                              {formatCurrency(product.price)}
                            </span>
                            <span className="flex items-center">
                              <Layers className="w-4 h-4 mr-1" />
                              {product.estimatedPieces}-piece set
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleCheckProduct(product.id)}
                          className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          disabled={checkProductMutation.isLoading}
                        >
                          <Search className="w-4 h-4 mr-1" />
                          Check
                        </button>

                        {!product.isProcessed && (
                          <button
                            onClick={() => handleProcessProduct(product.id)}
                            className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            disabled={processProductMutation.isLoading}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Process
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {setProductsData?.pagination && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Page {setProductsData.pagination.currentPage} • 
                      Found {setProductsData.count} set products out of {setProductsData.pagination.totalFetched} total products
                    </span>
                    {setProductsData.summary?.searchTerms && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Searching for: {setProductsData.summary.searchTerms.join(', ')})
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setCurrentPage(1);
                        setNextPageInfo(null);
                      }}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      First
                    </button>
                    
                    {setProductsData.pagination.hasNext && (
                      <button
                        onClick={() => {
                          setCurrentPage(prev => prev + 1);
                          setNextPageInfo(setProductsData.pagination.nextPageInfo);
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Load Next 250 →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Set Products Found</h3>
              <p className="text-gray-600">
                No products containing "set", "bundle", "group", "piece", "coord", or " - " were found in your store.
              </p>
            </div>
          )}
        </div>

        {/* Selected Product Details Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                {/* Show processing animation if processing */}
                {processingState ? (
                  <div className="text-center py-12">
                    <div className="mb-8">
                      {processingState === 'processing' && (
                        <>
                          <Layers className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Product...</h3>
                          <p className="text-gray-600">Creating component products in Shopify</p>
                        </>
                      )}
                      {processingState === 'splitting' && (
                        <>
                          <Layers className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-bounce" />
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Splitting Prices...</h3>
                          <p className="text-gray-600">Applying price constraints and creating bundle</p>
                        </>
                      )}
                      {processingState === 'completed' && (
                        <>
                          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Completed!</h3>
                          <p className="text-gray-600">Bundle created successfully</p>
                        </>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${processingState === 'processing' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        <div className={`w-3 h-3 rounded-full ${processingState === 'splitting' ? 'bg-purple-500' : 'bg-gray-300'}`} />
                        <div className={`w-3 h-3 rounded-full ${processingState === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Product Analysis</h3>
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedProduct.title}</h4>
                        <p className="text-sm text-gray-600">Product ID: {selectedProduct.productId}</p>
                      </div>

                      {selectedProduct.isSetProduct ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Piece Count</label>
                          <p className="text-lg font-bold text-green-600">{selectedProduct.pieceCount}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Original Price</label>
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(selectedProduct.originalPrice)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Proposed Component Products & Pricing
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {selectedProduct.componentNames.map((name, index) => (
                            <div key={index} className="flex justify-between items-center py-1">
                              <span className="text-sm font-medium">{selectedProduct.title.replace(/\bset\b/gi, '').trim()} {name}</span>
                              <span className="text-sm font-bold text-green-600">
                                {formatCurrency(selectedProduct.proposedPriceSplit[index])}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <button
                          onClick={() => setSelectedProduct(null)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        {!selectedProduct.isAlreadyProcessed && (
                          <button
                            onClick={() => {
                              handleProcessProduct(selectedProduct.productId);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={processProductMutation.isLoading}
                          >
                            {processProductMutation.isLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Process This Product'
                            )}
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                      <p className="text-gray-600">{selectedProduct.message}</p>
                    </div>
                  )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Process All Confirmation Modal */}
        {showProcessAll && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <AlertCircle className="w-8 h-8 text-yellow-500 mr-3" />
                  <h3 className="text-lg font-bold text-gray-900">Process All Set Products</h3>
                </div>

                <p className="text-gray-600 mb-6">
                  This will automatically process {setProductsData?.setProducts?.filter(p => !p.isProcessed).length} set products and create component products for each. This action cannot be undone.
                </p>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowProcessAll(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessAll}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    disabled={processAllMutation.isLoading}
                  >
                    {processAllMutation.isLoading ? 'Processing...' : 'Process All'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Batch Processing Progress Modal */}
        {batchProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Processing Products</h3>
                    <p className="text-sm text-gray-600">
                      {batchProgress.current} of {batchProgress.total} products processed
                    </p>
                  </div>
                  
                  {!batchProgress.isBackground && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setBatchProgress(prev => ({ ...prev, isBackground: true }))}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                      >
                        <Minimize2 className="w-3 h-3" />
                        Run in Background
                      </button>
                      <button
                        onClick={() => {
                          setBatchProcessing(false);
                          setBatchProgress({
                            current: 0,
                            total: 0,
                            currentProduct: null,
                            completed: [],
                            failed: [],
                            isBackground: false
                          });
                        }}
                        className="px-2 py-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Current Product */}
                {batchProgress.currentProduct && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 text-white animate-spin" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Currently Processing</p>
                        <p className="text-sm text-blue-700">{batchProgress.currentProduct.title}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results Summary */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Completed</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">{batchProgress.completed.length}</p>
                  </div>
                  
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Failed</span>
                    </div>
                    <p className="text-lg font-bold text-red-600">{batchProgress.failed.length}</p>
                  </div>
                </div>

                {/* Detailed Results */}
                {(batchProgress.completed.length > 0 || batchProgress.failed.length > 0) && (
                  <div className="max-h-40 overflow-y-auto">
                    {/* Completed Items */}
                    {batchProgress.completed.map((item, index) => (
                      <div key={`completed-${index}`} className="flex items-center space-x-2 py-1 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 truncate">{item.product?.title}</span>
                      </div>
                    ))}
                    
                    {/* Failed Items */}
                    {batchProgress.failed.map((item, index) => (
                      <div key={`failed-${index}`} className="flex items-center space-x-2 py-1 text-sm">
                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                        <span className="text-gray-700 truncate">{item.product?.title}</span>
                        <span className="text-xs text-red-600">({item.error})</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Completion Message */}
                {batchProgress.current === batchProgress.total && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">Batch Processing Complete!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Successfully processed {batchProgress.completed.length} products. 
                      Component products are hidden from storefront.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetManager;
