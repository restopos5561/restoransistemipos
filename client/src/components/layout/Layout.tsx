import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Box, CircularProgress, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Stack, useTheme, alpha } from '@mui/material';
import { 
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Restaurant as RestaurantIcon,
    Receipt as ReceiptIcon,
    Settings as SettingsIcon,
    Kitchen as KitchenIcon,
    LocalBar as BarIcon,
    ChevronRight,
    TableRestaurant as TableIcon,
    Inventory as InventoryIcon,
    People as PeopleIcon,
    LocalShipping as SupplierIcon,
    AccountBalance as AccountIcon,
    EventAvailable as EventAvailableIcon,
    ShoppingCart as CartIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Logo from '@/components/common/Logo';

const DRAWER_WIDTH = 280;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Hızlı Satış', icon: <CartIcon />, path: '/quick-sale', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { text: 'Siparişler', icon: <ReceiptIcon />, path: '/orders', roles: ['ADMIN', 'MANAGER', 'CHEF', 'WAITER', 'CASHIER'] },
    { text: 'Rezervasyonlar', icon: <EventAvailableIcon />, path: '/reservations', roles: ['ADMIN', 'MANAGER', 'WAITER', 'CASHIER'] },
    { text: 'Mutfak', icon: <KitchenIcon />, path: '/kitchen', roles: ['ADMIN', 'CHEF'] },
    { text: 'Bar', icon: <BarIcon />, path: '/bar', roles: ['ADMIN', 'BAR', 'BAR_STAFF', 'CHEF'] },
    { text: 'Masalar', icon: <TableIcon />, path: '/tables', roles: ['ADMIN', 'WAITER', 'CASHIER', 'CHEF'] },
    { text: 'Ürünler', icon: <RestaurantIcon />, path: '/products', roles: ['ADMIN', 'MANAGER', 'CHEF'] },
    { text: 'Kategoriler', icon: <RestaurantIcon />, path: '/categories', roles: ['ADMIN', 'MANAGER', 'CHEF'] },
    { text: 'Stok', icon: <InventoryIcon />, path: '/stocks', roles: ['ADMIN', 'MANAGER', 'INVENTORY', 'CHEF'] },
    { text: 'Müşteriler', icon: <PeopleIcon />, path: '/customers', roles: ['ADMIN', 'MANAGER', 'CHEF'] },
    { text: 'Tedarikçiler', icon: <SupplierIcon />, path: '/suppliers', roles: ['ADMIN', 'MANAGER', 'CHEF'] },
    { text: 'Cari Hesaplar', icon: <AccountIcon />, path: '/accounts', roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'CHEF'] },
    { text: 'Ayarlar', icon: <SettingsIcon />, path: '/settings', roles: ['ADMIN', 'CHEF'] }
];

const Layout: React.FC = () => {
    const { isAuthenticated, isProfileLoading: isLoading, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    console.log('Current user:', user);

    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: theme.palette.background.default,
            }}>
                <CircularProgress sx={{ color: theme.palette.primary.main }} />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const filteredMenuItems = menuItems.filter(item => 
        !item.roles || (Array.isArray(item.roles) && user?.role && item.roles.includes(user.role))
    );

    return (
        <Box sx={{ 
            display: 'flex',
            background: theme.palette.background.default,
            minHeight: '100vh',
            maxHeight: '100vh'
        }}>
            <Drawer
                open={isOpen}
                onClose={() => setIsOpen(false)}
                PaperProps={{
                    sx: {
                        width: DRAWER_WIDTH,
                        background: theme.palette.background.paper,
                        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.05)'
                    }
                }}
            >
                <Stack spacing={2} sx={{ height: '100%', p: 2 }}>
                    <Stack 
                        direction="row" 
                        alignItems="center" 
                        justifyContent="space-between"
                        sx={{ py: 1 }}
                    >
                        <Logo />
                        <IconButton onClick={() => setIsOpen(false)}>
                            <ChevronRight />
                        </IconButton>
                    </Stack>

                    <List sx={{ flex: 1 }}>
                        {filteredMenuItems.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton
                                    onClick={() => {
                                        navigate(item.path);
                                        setIsOpen(false);
                                    }}
                                    selected={location.pathname === item.path}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 0.5,
                                        '&.Mui-selected': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ 
                                        minWidth: 40,
                                        color: location.pathname === item.path 
                                            ? theme.palette.primary.main 
                                            : theme.palette.text.secondary
                                    }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={item.text} 
                                        primaryTypographyProps={{
                                            color: location.pathname === item.path 
                                                ? theme.palette.primary.main 
                                                : theme.palette.text.primary
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Stack>
            </Drawer>
            
            <Box sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                maxHeight: '100vh'
            }}>
                <Header>
                    <IconButton
                        onClick={() => setIsOpen(true)}
                        sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.1)
                            }
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Header>

                <Box component="main" sx={{ 
                    flex: 1,
                    p: { xs: 2, sm: 3 },
                    overflow: 'auto',
                    bgcolor: theme.palette.background.default,
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: alpha(theme.palette.divider, 0.1),
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: alpha(theme.palette.divider, 0.2),
                        borderRadius: '4px',
                        '&:hover': {
                            background: alpha(theme.palette.divider, 0.3),
                        },
                    },
                }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default Layout; 