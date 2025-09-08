import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Home,
  Layers,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchStoreAnalytics } from '../services/api';
import StoreSelector from './StoreSelector';
import { ElasticIconButton } from './ElasticButton';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [splitterTotals, setSplitterTotals] = useState({ totalOrders: 0, totalRevenueRupees: 0 });
  
  const { user, currentStore, logout } = useAuth();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (currentStore) {
          const res = await fetchStoreAnalytics(currentStore.id);
          const data = res?.data?.summary;
          if (mounted && data) {
            setSplitterTotals({
              totalOrders: data.totalOrders || 0,
              totalRevenueRupees: data.totalRevenueRupees || 0
            });
          }
        }
      } catch (_) {}
    };
    load();
    const id = setInterval(load, 30 * 60 * 1000); // 30 minutes
    return () => { mounted = false; clearInterval(id); };
  }, [currentStore]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Set Manager', href: '/sets', icon: Layers },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Layers className="w-8 h-8 text-shopify-600" />
            <span className="text-xl font-bold text-gray-900">SplitSet</span>
          </div>
          <ElasticIconButton
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
            size="md"
          >
            <X className="w-6 h-6" />
          </ElasticIconButton>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive(item.href)
                        ? 'bg-shopify-100 text-shopify-700 border-r-2 border-shopify-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                      }
                    `}
                  >
                    <Icon className={`
                      mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200
                      ${isActive(item.href) ? 'text-shopify-600' : 'text-gray-400 group-hover:text-gray-600'}
                    `} />
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-4 left-3 right-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <ElasticIconButton
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600"
                title="Logout"
                size="sm"
              >
                <LogOut className="w-4 h-4" />
              </ElasticIconButton>
            </div>
            {currentStore && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">
                    {currentStore.shopDomain}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <ElasticIconButton
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-gray-600"
                size="md"
              >
                <Menu className="w-6 h-6" />
              </ElasticIconButton>
              
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {navigation.find(item => isActive(item.href))?.name || 'SplitSet App'}
                </h1>
                <p className="text-sm text-gray-500">
                  Split products into sets with intelligent analytics
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Store Selector */}
              <StoreSelector />

              {/* Running splitter totals */}
              {currentStore && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Splitter orders (this month)</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {splitterTotals.totalOrders} orders · ₹{splitterTotals.totalRevenueRupees}
                  </div>
                </div>
              )}

              {/* User menu */}
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">{user?.role}</div>
                </div>
                <ElasticIconButton
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  title="Logout"
                  size="md"
                >
                  <LogOut className="w-4 h-4" />
                </ElasticIconButton>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
