import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
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
            <Typography variant="h1" color="primary">404</Typography>
            <Typography variant="h5" gutterBottom>Sayfa Bulunamadı</Typography>
            <Typography color="text.secondary" align="center" sx={{ mb: 2 }}>
                Aradığınız sayfa mevcut değil veya taşınmış olabilir.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
                Ana Sayfaya Dön
            </Button>
        </Box>
    );
};

export default NotFoundPage; 