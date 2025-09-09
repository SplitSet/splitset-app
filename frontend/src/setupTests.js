// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />
}));

// Mock API calls
const mockApiResponse = {
  data: {
    today: {
      products_split_today: 2,
      orders_today: 1,
      total_quantity_today: 2,
      total_revenue_today: 69.98,
      active_stores: 1,
      splitset_revenue_today: 18
    },
    allTime: {
      total_products_split: 2,
      total_orders: 1,
      total_quantity_all_time: 2,
      total_revenue_all_time: 69.98,
      total_stores: 1,
      splitset_revenue_all_time: 18
    },
    weeklyTrend: [
      { date: '2025-09-09', products_split: 2, orders: 1 }
    ]
  }
};

// Global test helpers
global.testHelpers = {
  mockApiResponse,
  mockAdminUser: {
    id: 1,
    email: 'admin@test.com',
    role: 'admin',
    firstName: 'Test',
    lastName: 'Admin'
  },
  mockStoreOwner: {
    id: 2,
    email: 'owner@test.com',
    role: 'store_owner',
    firstName: 'Test',
    lastName: 'Owner'
  }
};

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
