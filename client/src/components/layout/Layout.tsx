import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Box, CircularProgress, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography, Stack, useTheme, alpha } from '@mui/material';
import { 
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Restaurant as RestaurantIcon,
    Receipt as ReceiptIcon,
    Settings as SettingsIcon,
    ChevronRight
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Logo from '@/components/common/Logo';

const DRAWER_WIDTH = 280;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Siparişler', icon: <ReceiptIcon />, path: '/orders' },
    { text: 'Ürünler', icon: <RestaurantIcon />, path: '/products' },
    { text: 'Ayarlar', icon: <SettingsIcon />, path: '/settings', role: 'ADMIN' }
];

const Layout: React.FC = () => {
    const { isAuthenticated, isProfileLoading, profile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

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
                <Stack spacing={4} sx={{ height: '100%', p: 3 }}>
                    {/* Logo ve Başlık */}
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main
                            }}
                        >
                            <Logo />
                        </Box>
                        <Typography variant="h6" fontWeight={600}>
                            Restaurant POS
                        </Typography>
                    </Stack>

                    {/* Menü Öğeleri */}
                    <List sx={{ flex: 1 }}>
                        {menuItems.map((item) => {
                            if (item.role && profile?.role !== item.role) {
                                return null;
                            }

                            const isSelected = location.pathname === item.path;

                            return (
                                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                                    <ListItemButton
                                        selected={isSelected}
                                        onClick={() => {
                                            navigate(item.path);
                                            setIsOpen(false);
                                        }}
                                        sx={{
                                            borderRadius: 2,
                                            py: 1.5,
                                            px: 2,
                                            transition: 'all 0.2s ease',
                                            '&.Mui-selected': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                                                },
                                                '& .MuiListItemIcon-root': {
                                                    color: theme.palette.primary.main,
                                                },
                                                '& .MuiTypography-root': {
                                                    color: theme.palette.primary.main,
                                                    fontWeight: 600
                                                }
                                            },
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ 
                                            color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
                                            minWidth: 40,
                                            transition: 'all 0.2s ease'
                                        }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={
                                                <Typography sx={{ 
                                                    color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
                                                    fontWeight: isSelected ? 600 : 500,
                                                    fontSize: '0.875rem',
                                                    transition: 'all 0.2s ease'
                                                }}>
                                                    {item.text}
                                                </Typography>
                                            }
                                        />
                                        {isSelected && (
                                            <ChevronRight sx={{ 
                                                color: theme.palette.primary.main,
                                                opacity: 0.5
                                            }} />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
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