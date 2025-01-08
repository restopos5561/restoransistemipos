import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Grid,
  Typography,
  Box,
  Stack,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import OrderCard from '../../components/orders/OrderCard';
import { barService } from '../../services/bar.service';
import { OrderStatus } from '../../types/order.types';
import { toast } from 'react-toastify';

const BarPage: React.FC = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  // Siparişleri getir
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['bar-orders'],
    queryFn: () => barService.getOrders({ 
      status: ['PENDING', 'PREPARING'],
      onlyBeverages: true 
    }),
    refetchInterval: 30000, // Her 30 saniyede bir yenile
  });

  // Sipariş durumu güncelleme
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      barService.updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['bar-orders']);
      toast.success('Sipariş durumu güncellendi');
    },
    onError: () => {
      toast.error('Sipariş durumu güncellenirken bir hata oluştu');
    },
  });

  const handleStatusChange = (orderId: number, status: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(['bar-orders']);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  const pendingOrders = ordersData?.orders.filter(order => order.status === 'PENDING') || [];
  const preparingOrders = ordersData?.orders.filter(order => order.status === 'PREPARING') || [];

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h5">Bar Siparişleri</Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            Yenile
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {/* Bekleyen Siparişler */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="h6" color="warning.main">
                Bekleyen Siparişler ({pendingOrders.length})
              </Typography>
              <Stack spacing={2}>
                {pendingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                  />
                ))}
                {pendingOrders.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Bekleyen sipariş yok
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Grid>

          {/* Hazırlanan Siparişler */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="h6" color="info.main">
                Hazırlanan Siparişler ({preparingOrders.length})
              </Typography>
              <Stack spacing={2}>
                {preparingOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                  />
                ))}
                {preparingOrders.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Hazırlanan sipariş yok
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default BarPage; 