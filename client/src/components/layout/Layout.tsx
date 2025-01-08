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
    TableRestaurant as TableIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Logo from '@/components/common/Logo';

const DRAWER_WIDTH = 280;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Siparişler', icon: <ReceiptIcon />, path: '/orders' },
    { text: 'Mutfak', icon: <KitchenIcon />, path: '/kitchen', role: ['ADMIN', 'CHEF'] },
    { text: 'Bar', icon: <BarIcon />, path: '/bar', role: ['ADMIN', 'BAR'] },
    { text: 'Masalar', icon: <TableIcon />, path: '/tables', role: ['ADMIN', 'WAITER'] },
    { text: 'Ürünler', icon: <RestaurantIcon />, path: '/products' },
    { text: 'Ayarlar', icon: <SettingsIcon />, path: '/settings', role: ['ADMIN'] }
];

const Layout: React.FC = () => {
    const { isAuthenticated, isProfileLoading, profile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    console.log('Current profile:', profile);

    if (isProfileLoading) {
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
        !item.role || (Array.isArray(item.role) && profile?.role && item.role.includes(profile.role))
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