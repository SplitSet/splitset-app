# 🧪 SplitSet Automated Testing Guide

## Overview

This document outlines the comprehensive automated testing setup for the SplitSet application, including daily automated testing, coverage reports, and continuous integration.

## 🏗️ Testing Architecture

### Backend Testing (Node.js/Express)
- **Framework**: Jest + Supertest
- **Types**: Unit tests, Integration tests, API tests
- **Coverage**: Routes, Middleware, Models, Services, Utils
- **Database**: In-memory SQLite for testing

### Frontend Testing (React)
- **Framework**: Jest + React Testing Library
- **Types**: Component tests, Integration tests, User interaction tests
- **Coverage**: Pages, Components, Services, Hooks

## 📊 Test Coverage Goals

| Component | Target Coverage |
|-----------|----------------|
| Backend Routes | 80%+ |
| Backend Middleware | 85%+ |
| Backend Services | 75%+ |
| Frontend Components | 70%+ |
| Critical Functions | 90%+ |

## 🚀 Running Tests

### Local Development

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:admin        # Admin functionality
npm run test:auth         # Authentication
npm run test:splitset     # SplitSet revenue logic

# Watch mode for development
npm run test:watch
```

### Backend-Specific Commands

```bash
cd backend

# All backend tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Admin API tests
npm run test:admin

# Authentication tests
npm run test:auth

# SplitSet revenue tests
npm run test:splitset

# Coverage report
npm run test:coverage
```

### Frontend-Specific Commands

```bash
cd frontend

# All frontend tests
npm test

# Admin component tests
npm run test:admin

# Auth component tests
npm run test:auth

# Coverage report
npm run test:coverage
```

## 🎯 Test Categories

### 1. **Admin Panel Tests**
- ✅ Authentication & Authorization
- ✅ Dashboard Metrics Display
- ✅ SplitSet Revenue Calculation (₹9 per product)
- ✅ Split Products API
- ✅ Orders API
- ✅ Currency Formatting (₹ symbol)
- ✅ Role-based Access Control

### 2. **Authentication Tests**
- ✅ User Login/Logout
- ✅ Token Generation & Validation
- ✅ Session Management
- ✅ Role-based Access (admin vs store_owner)
- ✅ Security Middleware

### 3. **SplitSet Revenue Tests**
- ✅ Revenue Formula (quantity × ₹9)
- ✅ Daily Revenue Calculation
- ✅ All-time Revenue Calculation
- ✅ Product Quantity Aggregation
- ✅ Fulfilled Orders Only
- ✅ Currency Formatting

### 4. **API Integration Tests**
- ✅ Health Check Endpoint
- ✅ Admin Dashboard Metrics
- ✅ Split Products CRUD
- ✅ Orders Management
- ✅ Error Handling
- ✅ Response Validation

### 5. **Frontend Component Tests**
- ✅ Admin Panel Access Control
- ✅ Metrics Display
- ✅ Navigation Tabs
- ✅ Loading States
- ✅ Error Handling
- ✅ User Interactions

## 🔄 Daily Automated Testing

### GitHub Actions Workflow

The system runs comprehensive tests daily at 6 AM UTC via GitHub Actions:

1. **Backend Tests**
   - Linting
   - Unit Tests
   - Integration Tests
   - Admin-specific Tests
   - Authentication Tests
   - SplitSet Revenue Tests
   - Coverage Reports

2. **Frontend Tests**
   - Linting
   - Component Tests
   - Admin Panel Tests
   - Coverage Reports

3. **Integration Tests**
   - Full Application Build
   - Health Checks
   - API Endpoint Testing

4. **Security Scanning**
   - npm audit (backend)
   - npm audit (frontend)
   - Dependency vulnerabilities

### Manual Triggering

You can manually trigger tests:
- Push to main/master branch
- Create pull request
- Manual workflow dispatch in GitHub Actions

## 📈 Coverage Reports

Coverage reports are generated automatically and uploaded to:
- **Codecov**: For detailed coverage analysis
- **GitHub Actions**: Summary in workflow results
- **Local**: `coverage/` directories in backend/frontend

### Viewing Coverage Locally

```bash
# Backend coverage
cd backend && npm run test:coverage
open coverage/lcov-report/index.html

# Frontend coverage  
cd frontend && npm run test:coverage
open coverage/lcov-report/index.html
```

## 🛡️ Test Data & Mocking

### Backend Test Data
- Mock admin user: `admin@test.com`
- Mock store owner: `owner@test.com`
- Test store: `test-store.myshopify.com`
- Sample split products with known quantities
- Sample orders with fulfilled status

### Frontend Test Data
- Mocked API responses
- Test user contexts
- Simulated loading states
- Error scenarios

## 🔧 Test Configuration

### Backend (Jest)
- **Environment**: Node.js
- **Database**: In-memory SQLite
- **Timeout**: 30 seconds
- **Coverage Threshold**: 70%
- **Setup**: `tests/setup.js`

### Frontend (React Testing Library)
- **Environment**: jsdom
- **Mocks**: API calls, Charts, Observers
- **Setup**: `src/setupTests.js`
- **Utilities**: Custom render functions

## 📋 Test Checklist

Before deploying, ensure all tests pass:

- [ ] Backend unit tests (100% pass rate)
- [ ] Backend integration tests (100% pass rate)
- [ ] Frontend component tests (100% pass rate)
- [ ] Admin functionality tests (100% pass rate)
- [ ] Authentication tests (100% pass rate)
- [ ] SplitSet revenue tests (100% pass rate)
- [ ] Coverage above thresholds
- [ ] No security vulnerabilities
- [ ] Linting passes

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Ensure test database is properly setup
   cd backend && npm run migrate
   ```

2. **Port Conflicts**
   ```bash
   # Kill existing processes
   pkill -f node
   ```

3. **Redis Connection (CI)**
   - GitHub Actions includes Redis service
   - Local tests may need Redis running

4. **Frontend Chart Mocking**
   - Recharts is mocked in setupTests.js
   - Update mocks if chart components change

### Debug Mode

```bash
# Run tests with debug output
DEBUG=* npm test

# Run specific test file
npm test -- --testPathPattern=admin.test.js

# Run with verbose output
npm test -- --verbose
```

## 📊 Monitoring & Alerts

### Success Metrics
- Daily test pass rate: >95%
- Coverage maintenance: Above thresholds
- Security scan: No high/critical vulnerabilities
- Performance: Tests complete within 10 minutes

### Failure Handling
- Immediate notification on test failures
- Automatic retry for flaky tests
- Detailed logs and error reporting
- Coverage regression alerts

## 🎯 Best Practices

1. **Write Tests First**: TDD approach for new features
2. **Mock External Services**: Avoid real API calls in tests
3. **Test Edge Cases**: Handle null/undefined/error scenarios
4. **Keep Tests Fast**: Unit tests should run in milliseconds
5. **Descriptive Names**: Clear test descriptions
6. **Clean Setup/Teardown**: Proper test isolation
7. **Regular Updates**: Keep test dependencies current

## 📅 Maintenance Schedule

- **Daily**: Automated test runs
- **Weekly**: Review coverage reports
- **Monthly**: Update test dependencies
- **Quarterly**: Review and refactor test suites

---

**Your SplitSet app now has enterprise-grade automated testing! 🚀**

All critical functionality including admin panel, SplitSet revenue calculation (₹9 per product), authentication, and session management is thoroughly tested and monitored daily.
