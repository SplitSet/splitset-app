import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useAuth } from '../contexts/AuthContext';
import { fetchStoreAnalytics, refreshStoreAnalytics } from '../services/api';
import { AlertCircle } from 'lucide-react';
import ElasticButton from '../components/ElasticButton';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  
  const { currentStore, hasStoreAccess } = useAuth();

  const load = async (force = false) => {
    if (!currentStore) {
      setError('No store selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = force 
        ? await refreshStoreAnalytics(currentStore.id, true)
        : await fetchStoreAnalytics(currentStore.id);
      
      setSummary(res?.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (currentStore) {
      load(false); 
    }
  }, [currentStore]);

  const labels = summary?.dailyItems?.map(d => d.date) || [];
  const counts = summary?.dailyItems?.map(d => d.count) || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Items via Splitter (daily)',
        data: counts,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(5, 150, 105, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
    },
  };

  // Handle no store selected
  if (!currentStore) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Store Selected</h3>
          <p className="text-gray-500">Please select a store to view analytics.</p>
        </div>
      </div>
    );
  }

  // Handle errors
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <ElasticButton
                onClick={() => load(false)}
                className="mt-2"
                variant="ghost"
                size="sm"
              >
                Try again
              </ElasticButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">
            {currentStore.shopDomain} - Splitter orders and items this month
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {summary?.lastRefresh?.completedAt && (
            <p className="text-xs text-gray-500">
              Last updated: {new Date(summary.lastRefresh.completedAt).toLocaleString()}
            </p>
          )}
          <ElasticButton
            onClick={() => load(true)}
            disabled={loading}
            loading={loading}
            variant="primary"
            size="md"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </ElasticButton>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div 
          className="bg-white rounded-lg shadow p-4 cursor-pointer"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <div className="text-sm text-gray-500">Total orders via splitter</div>
          <div className="text-2xl font-semibold text-gray-900">{summary?.summary?.totalOrders ?? 0}</div>
        </motion.div>
        <motion.div 
          className="bg-white rounded-lg shadow p-4 cursor-pointer"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <div className="text-sm text-gray-500">Total items via splitter</div>
          <div className="text-2xl font-semibold text-gray-900">{summary?.summary?.totalItems ?? 0}</div>
        </motion.div>
        <motion.div 
          className="bg-white rounded-lg shadow p-4 cursor-pointer"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <div className="text-sm text-gray-500">Billing (₹9 × orders)</div>
          <div className="text-2xl font-semibold text-gray-900">₹{summary?.summary?.totalRevenueRupees ?? 0}</div>
        </motion.div>
      </div>

      <motion.div 
        className="bg-white rounded-lg shadow p-4 h-80"
        whileHover={{ scale: 1.01, y: -1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="text-sm text-gray-600 mb-2">Daily items via splitter</div>
        <Bar data={chartData} options={chartOptions} />
      </motion.div>
    </div>
  );
};

export default Analytics;
