import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Store, 
  TrendingUp,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [productsData, setProductsData] = useState({ products: [], pagination: {} });
  const [ordersData, setOrdersData] = useState({ ordersByStore: {}, pagination: {} });
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    store: '',
    search: ''
  });

  // Fetch dashboard metrics
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/metrics');
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch products data
  const fetchProductsData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filters.store && { store: filters.store }),
        ...(filters.search && { search: filters.search })
      });
      
      const response = await api.get(`/admin/products?${params}`);
      setProductsData(response.data);
    } catch (error) {
      toast.error('Failed to fetch products data');
      console.error('Products fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.store, filters.search]);

  // Fetch orders data
  const fetchOrdersData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filters.store && { store: filters.store }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });
      
      const response = await api.get(`/admin/orders?${params}`);
      setOrdersData(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders data');
      console.error('Orders fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.store, filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'products') {
      fetchProductsData();
    } else if (activeTab === 'orders') {
      fetchOrdersData();
    }
  }, [activeTab, fetchDashboardData, fetchProductsData, fetchOrdersData]);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProductsData();
    } else if (activeTab === 'orders') {
      fetchOrdersData();
    }
  }, [filters, activeTab, fetchOrdersData, fetchProductsData]);

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }


  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ dateFrom: '', dateTo: '', store: '', search: '' });
  };

  const exportData = (type) => {
    toast.success(`Exporting ${type} data...`);
    // Implementation for data export would go here
  };

  const MetricCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {Math.abs(trend)}% vs last week
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const DashboardTab = () => {
    if (!dashboardData) return <div>Loading dashboard...</div>;

    const { today, allTime, weeklyTrend } = dashboardData;

    return (
      <div className="space-y-6">
        {/* Daily Metrics */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Products Split Today"
              value={today.products_split_today || 0}
              icon={Package}
              color="blue"
            />
            <MetricCard
              title="Orders Today"
              value={today.orders_today || 0}
              icon={ShoppingCart}
              color="green"
            />
            <MetricCard
              title="Revenue Today"
              value={`₹${(today.total_revenue_today || 0).toFixed(2)}`}
              icon={DollarSign}
              color="yellow"
            />
            <MetricCard
              title="Active Stores"
              value={today.active_stores || 0}
              icon={Store}
              color="purple"
            />
          </div>
          
          {/* SplitSet Revenue */}
          <div className="mt-6">
            <MetricCard
              title="SplitSet Revenue Today"
              value={`₹${(today.splitset_revenue_today || 0).toFixed(2)}`}
              icon={DollarSign}
              color="indigo"
            />
          </div>
        </div>

        {/* All-Time Metrics */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">All-Time Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Products Split"
              value={allTime.total_products_split || 0}
              icon={Package}
              color="blue"
            />
            <MetricCard
              title="Total Orders"
              value={allTime.total_orders || 0}
              icon={ShoppingCart}
              color="green"
            />
            <MetricCard
              title="Total Revenue"
              value={`₹${(allTime.total_revenue_all_time || 0).toFixed(2)}`}
              icon={DollarSign}
              color="yellow"
            />
            <MetricCard
              title="Total Stores"
              value={allTime.total_stores || 0}
              icon={Store}
              color="purple"
            />
          </div>
          
          {/* SplitSet All-Time Revenue */}
          <div className="mt-6">
            <MetricCard
              title="SplitSet Revenue (All-Time)"
              value={`₹${(allTime.splitset_revenue_all_time || 0).toFixed(2)}`}
              icon={DollarSign}
              color="indigo"
            />
          </div>
        </div>

        {/* Weekly Trend Chart */}
        {weeklyTrend && weeklyTrend.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrend.reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="products_split" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Products Split"
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const ProductsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Store domain..."
            value={filters.store}
            onChange={(e) => handleFilterChange('store', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Clear
          </button>
          <button
            onClick={() => exportData('products')}
            className="ml-auto flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Split Products</h3>
          <p className="text-sm text-gray-600">
            Total: {productsData.pagination.total || 0} products
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Split Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsData.products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {product.product_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.shop_domain}</div>
                    <div className="text-sm text-gray-500">{product.store_plan}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.split_type === 'auto' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {product.split_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(product.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const OrdersTab = () => {
    const ordersByStoreArray = Object.values(ordersData.ordersByStore || {});
    
    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              placeholder="Store domain..."
              value={filters.store}
              onChange={(e) => handleFilterChange('store', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
            <button
              onClick={() => exportData('orders')}
              className="ml-auto flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Orders by Store */}
        {ordersByStoreArray.map((storeData) => (
          <div key={storeData.store_domain} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{storeData.store_domain}</h3>
                  <p className="text-sm text-gray-600">
                    {storeData.totals.order_count} orders • 
                    {storeData.totals.total_quantity} items • 
                    ${storeData.totals.total_revenue.toFixed(2)} revenue
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {storeData.orders.map((order) => (
                    <tr key={`${order.order_id}-${order.product_name}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.order_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            ${order.order_total.toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.product_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₹{order.product_price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.line_total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.fulfillment_status === 'fulfilled' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.fulfillment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {ordersByStoreArray.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">No orders containing split products match your filters.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">App owner control panel</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart },
              { id: 'products', name: 'Split Products', icon: Package },
              { id: 'orders', name: 'Orders', icon: ShoppingCart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}
          
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'orders' && <OrdersTab />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
