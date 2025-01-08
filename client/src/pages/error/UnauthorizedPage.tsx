import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LockOutlined } from '@mui/icons-material';

const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ 
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2
        }}>
            <LockOutlined sx={{ fontSize: 60, color: 'error.main' }} />
            <Typography variant="h4" gutterBottom>Yetkisiz Erişim</Typography>
            <Typography color="text.secondary" align="center" sx={{ mb: 2 }}>
                Bu sayfaya erişim yetkiniz bulunmamaktadır.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
                Ana Sayfaya Dön
            </Button>
        </Box>
    );
};

export default UnauthorizedPage; 