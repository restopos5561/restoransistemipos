import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Stack, useTheme, alpha } from '@mui/material';
import { withMemo } from '@/utils/hoc/withMemo';
import { 
    AttachMoney as MoneyIcon,
    People as PeopleIcon,
    Restaurant as RestaurantIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, bgColor }) => {
    const theme = useTheme();
    
    return (
        <Card 
            elevation={0}
            sx={{
                height: '100%',
                bgcolor: 'white',
                borderRadius: 4,
                boxShadow: 'rgba(145, 158, 171, 0.08) 0px 0px 2px 0px, rgba(145, 158, 171, 0.08) 0px 12px 24px -4px'
            }}
        >
            <CardContent sx={{ p: 3, height: '100%' }}>
                <Stack spacing={2} height="100%">
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            bgcolor: bgColor,
                            color: theme.palette.primary.main
                        }}
                    >
                        {icon}
                    </Box>

                    <Stack spacing={0.5}>
                        <Typography variant="h3" fontWeight={700} sx={{ color: 'rgb(33, 43, 54)' }}>
                            {value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgb(99, 115, 129)', fontWeight: 500 }}>
                            {title}
                        </Typography>
                        {trend && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <TrendingUpIcon sx={{ color: 'rgb(34, 197, 94)', fontSize: 16 }} />
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: 'rgb(34, 197, 94)',
                                        fontWeight: 600
                                    }}
                                >
                                    {trend}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

const DashboardPage: React.FC = () => {
    const theme = useTheme();
    
    const stats = [
        {
            title: 'Toplam Satış',
            value: '₺12,350',
            icon: <MoneyIcon />,
            trend: '%12 Artış',
            bgColor: alpha(theme.palette.primary.main, 0.08)
        },
        {
            title: 'Aktif Müşteriler',
            value: '25',
            icon: <PeopleIcon />,
            trend: '5 Yeni',
            bgColor: alpha(theme.palette.warning.main, 0.08)
        },
        {
            title: 'Toplam Ürün',
            value: '156',
            icon: <RestaurantIcon />,
            trend: '3 Yeni',
            bgColor: alpha(theme.palette.error.main, 0.08)
        }
    ];

    return (
        <Box sx={{ p: 3, maxWidth: '100%', bgcolor: 'rgb(249, 250, 251)' }}>
            <Stack spacing={3}>
                <Stack spacing={0.5}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 700,
                            color: 'rgb(33, 43, 54)',
                            fontSize: '1.5rem'
                        }}
                    >
                        Dashboard
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'rgb(99, 115, 129)',
                            fontWeight: 500
                        }}
                    >
                        Hoş geldiniz! İşte işletmenizin genel durumu.
                    </Typography>
                </Stack>

                <Grid container spacing={3}>
                    {stats.map((stat, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <StatCard {...stat} />
                        </Grid>
                    ))}
                </Grid>
            </Stack>
        </Box>
    );
};

export default withMemo(DashboardPage); 