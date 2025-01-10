import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LoginPage from '@/pages/auth/LoginPage';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import NotFoundPage from '@/pages/error/NotFoundPage';
import UnauthorizedPage from '@/pages/error/UnauthorizedPage';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import DashboardPage from '@/pages/dashboard/DashboardPage';
import OrdersPage from '@/pages/orders/OrdersPage';
import NewOrderPage from '@/pages/orders/NewOrderPage';
import OrderDetailPage from '@/pages/orders/OrderDetailPage';
import EditOrderPage from '@/pages/orders/EditOrderPage';
import PaymentPage from '@/pages/orders/PaymentPage';
import KitchenPage from '@/pages/kitchen/KitchenPage';
import BarPage from '@/pages/bar/BarPage';
import TablesPage from '@/pages/tables/TablesPage';
import ProductsPage from '@/pages/products/ProductsPage';
import CategoriesPage from '@/pages/products/CategoriesPage';
import StocksPage from '@/pages/stocks/StocksPage';
import CustomersPage from '@/pages/customers/CustomersPage';
import SuppliersPage from '@/pages/suppliers/SuppliersPage';
import AccountsPage from '@/pages/accounts/AccountsPage';
import SettingsPage from '@/pages/settings/SettingsPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Orders Routes */}
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/new" element={<NewOrderPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders/:id/edit" element={<EditOrderPage />} />
          <Route path="/orders/:id/payment" element={<PaymentPage />} />

          {/* Kitchen & Bar Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'CHEF', 'KITCHEN_STAFF']} />}>
            <Route path="/kitchen" element={<KitchenPage />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'BAR', 'BAR_STAFF']} />}>
            <Route path="/bar" element={<BarPage />} />
          </Route>

          {/* Tables Route */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER', 'CASHIER']} />}>
            <Route path="/tables" element={<TablesPage />} />
          </Route>

          {/* Products & Categories Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF']} />}>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </Route>

          {/* Stock Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'INVENTORY', 'CHEF']} />}>
            <Route path="/stocks" element={<StocksPage />} />
          </Route>

          {/* Customers & Suppliers Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF']} />}>
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
          </Route>

          {/* Accounts Route */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'ACCOUNTANT', 'CHEF']} />}>
            <Route path="/accounts" element={<AccountsPage />} />
          </Route>

          {/* Settings Route */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'CHEF']} />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes; 