import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './routes/ProtectedRoute';
import ErrorBoundary from './components/error/ErrorBoundary';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import DashboardPage from './pages/dashboard/DashboardPage';
import NotFoundPage from './pages/error/NotFoundPage';
import UnauthorizedPage from './pages/error/UnauthorizedPage';
import OrdersPage from './pages/orders/OrdersPage';
import NewOrderPage from './pages/orders/NewOrderPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import EditOrderPage from './pages/orders/EditOrderPage';
import PaymentPage from './pages/orders/PaymentPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from './components/common/Loading/Loading';
import { useLoadingStore } from './store/loading/loadingStore';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import theme from './theme/theme';

const queryClient = new QueryClient();

const App: React.FC = () => {
    const isLoading = useLoadingStore((state) => state.isLoading);

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                        <CssBaseline />
                        <BrowserRouter>
                            {isLoading && <Loading fullScreen />}
                            <Routes>
                                {/* Public routes */}
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />

                                {/* Protected routes */}
                                <Route element={<ProtectedRoute />}>
                                    <Route element={<Layout />}>
                                        <Route path="/" element={<DashboardPage />} />
                                        <Route path="/dashboard" element={<DashboardPage />} />
                                        
                                        {/* Orders Routes */}
                                        <Route path="/orders" element={<OrdersPage />} />
                                        <Route path="/orders/new" element={<NewOrderPage />} />
                                        <Route path="/orders/:id" element={<OrderDetailPage />} />
                                        <Route path="/orders/:id/edit" element={<EditOrderPage />} />
                                        <Route path="/orders/:id/payment" element={<PaymentPage />} />
                                    </Route>
                                </Route>

                                {/* Error routes */}
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                            <ToastContainer
                                position="top-right"
                                autoClose={5000}
                                hideProgressBar={false}
                                closeOnClick
                                pauseOnHover
                            />
                        </BrowserRouter>
                    </LocalizationProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
};

export default App; 