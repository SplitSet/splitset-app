import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Admin from '../../pages/Admin';
import AuthContext from '../../contexts/AuthContext';

// Mock the API module
jest.mock('../../services/api', () => ({
  fetchAdminMetrics: jest.fn(),
  fetchAdminSplitProducts: jest.fn(),
  fetchAdminSplitOrders: jest.fn(),
}));

const mockApi = require('../../services/api');

// Test wrapper component
const TestWrapper = ({ children, user = global.testHelpers.mockAdminUser }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const authValue = {
    user,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    isAuthenticated: true,
  };

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>
          {children}
          <Toaster />
        </AuthContext.Provider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Admin Page Component Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default API responses
    mockApi.fetchAdminMetrics.mockResolvedValue({
      data: global.testHelpers.mockApiResponse.data
    });
    
    mockApi.fetchAdminSplitProducts.mockResolvedValue({
      data: {
        products: [
          {
            id: 1,
            title: 'Test Split Product 1',
            price: 34.99,
            split_type: 'manual',
            shop_domain: 'test-store.myshopify.com'
          },
          {
            id: 2,
            title: 'Test Split Product 2', 
            price: 35.00,
            split_type: 'auto',
            shop_domain: 'test-store.myshopify.com'
          }
        ],
        pagination: { currentPage: 1, totalPages: 1, totalItems: 2 }
      }
    });
    
    mockApi.fetchAdminSplitOrders.mockResolvedValue({
      data: {
        ordersByStore: {
          'test-store.myshopify.com': [
            {
              order_number: '#1001',
              product_name: 'Test Split Product 1',
              product_price: 34.99,
              quantity: 1
            }
          ]
        }
      }
    });
  });

  describe('Admin Access Control', () => {
    test('should deny access to non-admin users', () => {
      render(
        <TestWrapper user={{ ...global.testHelpers.mockStoreOwner }}>
          <Admin />
        </TestWrapper>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('You need admin privileges to access this page.')).toBeInTheDocument();
    });

    test('should allow access to admin users', async () => {
      render(
        <TestWrapper user={global.testHelpers.mockAdminUser}>
          <Admin />
        </TestWrapper>
      );

      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      
      // Wait for data to load
      await waitFor(() => {
        expect(mockApi.fetchAdminMetrics).toHaveBeenCalled();
      });
    });
  });

  describe('Dashboard Metrics Display', () => {
    test('should display today\'s metrics correctly', async () => {
      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Products Split Today')).toBeInTheDocument();
        expect(screen.getByText('Orders Today')).toBeInTheDocument();
        expect(screen.getByText('Revenue Today')).toBeInTheDocument();
        expect(screen.getByText('SplitSet Revenue Today')).toBeInTheDocument();
      });
    });

    test('should display SplitSet revenue with correct currency formatting', async () => {
      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('₹18.00')).toBeInTheDocument();
      });
    });

    test('should display correct metric values', async () => {
      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      );

      await waitFor(() => {
        // Check for specific values from mock data
        expect(screen.getByText('2')).toBeInTheDocument(); // products split
        expect(screen.getByText('1')).toBeInTheDocument(); // orders
        expect(screen.getByText('₹69.98')).toBeInTheDocument(); // revenue
      });
    });

    test('should display all-time metrics', async () => {
      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('All-Time Stats')).toBeInTheDocument();
        expect(screen.getByText('Total Products Split')).toBeInTheDocument();
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
        expect(screen.getByText('SplitSet Revenue (All-Time)')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Tabs', () => {
    test('should display navigation tabs', async () => {
      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /split products/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /orders/i })).toBeInTheDocument();
      });
    });

    test('should start with dashboard tab active', async () => {
      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      );

      await waitFor(() => {
        const dashboardTab = screen.getByRole('button', { name: /dashboard/i });
        expect(dashboardTab).toHaveClass('border-indigo-500', 'text-indigo-600');
      });
    });
  });

  describe('Loading States', () => {
    test('should show loading spinner while fetching data', () => {
      // Mock API to return a pending promise
      mockApi.fetchAdminMetrics.mockReturnValue(new Promise(() => {}));
      
      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      // Mock API to reject
      mockApi.fetchAdminMetrics.mockRejectedValue(new Error('API Error'));
      
      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });
  });

  describe('Split Products Tab', () => {
    test('should display split products when tab is clicked', async () => {
      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(mockApi.fetchAdminMetrics).toHaveBeenCalled();
      });

      // Click on Split Products tab
      const productsTab = screen.getByRole('button', { name: /split products/i });
      productsTab.click();

      await waitFor(() => {
        expect(mockApi.fetchAdminSplitProducts).toHaveBeenCalled();
        expect(screen.getByText('Test Split Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Split Product 2')).toBeInTheDocument();
      });
    });

    test('should display product prices with rupee symbol', async () => {
      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      );

      // Click on Split Products tab
      const productsTab = screen.getByRole('button', { name: /split products/i });
      productsTab.click();

      await waitFor(() => {
        expect(screen.getByText('₹34.99')).toBeInTheDocument();
        expect(screen.getByText('₹35.00')).toBeInTheDocument();
      });
    });
  });

  describe('Orders Tab', () => {
    test('should display orders when tab is clicked', async () => {
      render(
        <TestWrapper>
          <Admin />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(mockApi.fetchAdminMetrics).toHaveBeenCalled();
      });

      // Click on Orders tab
      const ordersTab = screen.getByRole('button', { name: /orders/i });
      ordersTab.click();

      await waitFor(() => {
        expect(mockApi.fetchAdminSplitOrders).toHaveBeenCalled();
        expect(screen.getByText('test-store.myshopify.com')).toBeInTheDocument();
        expect(screen.getByText('#1001')).toBeInTheDocument();
      });
    });
  });
});
