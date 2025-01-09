import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LoginPage from '@/pages/auth/LoginPage';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import NotFoundPage from '@/pages/error/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';
import OrdersPage from '../pages/orders/OrdersPage';
import NewOrderPage from '../pages/orders/NewOrderPage';
import OrderDetailPage from '../pages/orders/OrderDetailPage';
import EditOrderPage from '../pages/orders/EditOrderPage';
import PaymentPage from '../pages/orders/PaymentPage';
import KitchenPage from '../pages/kitchen/KitchenPage';
import BarPage from '../pages/bar/BarPage';
import StocksPage from '../pages/stocks/StocksPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          
          {/* Orders Routes */}
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/new" element={<NewOrderPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders/:id/edit" element={<EditOrderPage />} />
          <Route path="/orders/:id/payment" element={<PaymentPage />} />

          {/* Kitchen & Bar Routes */}
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="/bar" element={<BarPage />} />

          {/* Stock Routes */}
          <Route path="/stocks" element={<StocksPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes; 