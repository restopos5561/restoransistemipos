import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, useTheme, alpha } from '@mui/material';
import { ExitToApp, Person } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import BranchSelector from './BranchSelector';

interface HeaderProps {
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
    const { logout, user } = useAuth();
    const theme = useTheme();

    console.log('🔥 [Header] User:', user);

    return (
        <AppBar 
            position="sticky" 
            sx={{
                background: theme.palette.background.paper,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: 'none'
            }}
        >
            <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
                {children}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    ml: 'auto'
                }}>
                    <BranchSelector />
                    
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        background: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2,
                        py: 0.5,
                        px: 1.5,
                    }}>
                        <Avatar 
                            sx={{ 
                                width: 32,
                                height: 32,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main
                            }}
                        >
                            {user?.name?.charAt(0).toUpperCase() || <Person />}
                        </Avatar>
                        <Typography 
                            variant="subtitle2" 
                            sx={{ 
                                color: theme.palette.text.primary,
                                fontWeight: 600,
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            {user?.name}
                        </Typography>
                    </Box>

                    <IconButton 
                        onClick={() => logout()}
                        sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                                color: theme.palette.error.main,
                                bgcolor: alpha(theme.palette.error.main, 0.1)
                            }
                        }}
                    >
                        <ExitToApp />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header; 