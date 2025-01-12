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
import KitchenPage from './pages/kitchen/KitchenPage';
import BarPage from './pages/bar/BarPage';
import TablesPage from './pages/tables/TablesPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import NewProductPage from './pages/products/NewProductPage';
import StocksPage from './pages/stocks/StocksPage';
import CategoriesPage from './pages/products/CategoriesPage';
import CustomersPage from './pages/customers/CustomersPage';
import NewCustomerPage from './pages/customers/NewCustomerPage';
import CustomerDetailPage from './pages/customers/CustomerDetailPage';
import EditCustomerPage from './pages/customers/EditCustomerPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import NewSupplierPage from './pages/suppliers/NewSupplierPage';
import EditSupplierPage from './pages/suppliers/EditSupplierPage';
import SupplierDetailPage from './pages/suppliers/SupplierDetailPage';
import AccountsPage from './pages/accounts/AccountsPage';
import AccountDetailPage from './pages/accounts/AccountDetailPage';
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
import { useConfirm } from './hooks/useConfirm';
import ReservationsPage from './pages/reservations/ReservationsPage';
import QuickSalePage from './pages/quick-sale/QuickSalePage';

const queryClient = new QueryClient();

const App: React.FC = () => {
    const isLoading = useLoadingStore((state) => state.isLoading);
    const confirm = useConfirm();

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

                                        {/* Kitchen & Bar Routes */}
                                        <Route path="/kitchen" element={<KitchenPage />} />
                                        <Route path="/bar" element={<BarPage />} />

                                        {/* Tables Route */}
                                        <Route path="/tables" element={<TablesPage />} />

                                        {/* Reservations Route */}
                                        <Route path="/reservations" element={<ReservationsPage />} />

                                        {/* Products Route */}
                                        <Route path="/products" element={<ProductsPage />} />
                                        <Route path="/products/new" element={<NewProductPage />} />
                                        <Route path="/products/:id" element={<ProductDetailPage />} />
                                        <Route path="/categories" element={<CategoriesPage />} />

                                        {/* Suppliers Route */}
                                        <Route path="/suppliers" element={<SuppliersPage />} />
                                        <Route path="/suppliers/new" element={<NewSupplierPage />} />
                                        <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
                                        <Route path="/suppliers/:id/edit" element={<EditSupplierPage />} />

                                        {/* Stock Routes */}
                                        <Route path="/stocks" element={<StocksPage />} />

                                        {/* Customers Route */}
                                        <Route path="/customers" element={<CustomersPage />} />
                                        <Route path="/customers/new" element={<NewCustomerPage />} />
                                        <Route path="/customers/:id" element={<CustomerDetailPage />} />
                                        <Route path="/customers/:id/edit" element={<EditCustomerPage />} />

                                        {/* Accounts Route */}
                                        <Route path="/accounts" element={<AccountsPage />} />
                                        <Route path="/accounts/:id" element={<AccountDetailPage />} />

                                        {/* Quick Sale Route */}
                                        <Route path="/quick-sale" element={<QuickSalePage />} />
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
                            <confirm.ConfirmationDialog />
                        </BrowserRouter>
                    </LocalizationProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
};

export default App; 