import React, { useState, useEffect } from 'react';
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
import KitchenFilters from '../../components/kitchen/KitchenFilters';
import KitchenStats from '../../components/kitchen/KitchenStats';
import { kitchenService } from '../../services/kitchen.service';
import { OrderStatus } from '../../types/enums';
import { KitchenOrdersFilters } from '../../types/kitchen.types';
import { toast } from 'react-toastify';
import { SocketService } from '../../services/socket/socket.service';
import { SOCKET_EVENTS } from '../../services/socket/socket.events';
import useSound from 'use-sound';
import { useAuth } from '../../hooks/useAuth';

const KitchenPage: React.FC = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Ses çalma hook'u
  const [playSound] = useSound('/sounds/notification.mp3', {
    volume: 1.0,
    interrupt: true,
  });

  // Ses çalma fonksiyonu
  const playNotification = () => {
    console.log('[Kitchen] Bildirim sesi çalınıyor');
    try {
      playSound();
    } catch (error) {
      console.error('[Kitchen] Ses çalma hatası:', error);
    }
  };

  const [filters, setFilters] = useState<KitchenOrdersFilters>({
    status: [OrderStatus.PENDING, OrderStatus.PREPARING],
    onlyFood: true,
    branchId: user?.branchId
  });

  useEffect(() => {
    if (!user?.branchId) {
      toast.error('Şube bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    setFilters(prev => ({
      ...prev,
      branchId: user.branchId
    }));
  }, [user?.branchId]);

  //statistikleri getir
  const { data: statsData } = useQuery({
    queryKey: ['kitchen-stats', user?.branchId],
    queryFn: () => {
      if (!user?.branchId) {
        throw new Error('Şube ID\'si bulunamadı');
      }
      return kitchenService.getStats(user.branchId);
    },
    refetchInterval: 30000,
    enabled: !!user?.branchId
  });

  // Siparişleri getir
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['kitchen-orders', filters],
    queryFn: async () => {
      console.log('[Kitchen] Siparişler isteniyor:', filters);
      if (!user?.branchId) {
        throw new Error('Şube ID\'si bulunamadı');
      }
      const data = await kitchenService.getOrders(filters);
      console.log('[Kitchen] Siparişler alındı:', data);
      return data;
    },
    refetchInterval: 30000,
    enabled: !!user?.branchId
  });

  // Socket.IO event dinleyicisi
  useEffect(() => {
    console.log('[Kitchen] Socket.IO event dinleyicileri ayarlanıyor');

    // Event dinleyicilerini ayarla
    const handleOrderCreated = (data: any) => {
      console.log('[Kitchen] Yeni sipariş alındı:', {
        event: SOCKET_EVENTS.ORDER_CREATED,
        orderId: data.orderId
      });

      // Ses çal
      playNotification();

      // Bildirim göster
      toast.info('Yeni sipariş geldi!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Verileri yenile
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-stats'] });
    };

    const handleOrderUpdated = (data: any) => {
      console.log('[Kitchen] Sipariş güncellendi:', {
        event: SOCKET_EVENTS.ORDER_UPDATED,
        orderId: data.orderId,
        status: data.order?.status
      });

      // Bildirim göster
      toast.info('Sipariş güncellendi!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Verileri yenile
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-stats'] });
    };

    const handleOrderDeleted = (data: any) => {
      console.log('[Kitchen] Sipariş silindi:', {
        event: SOCKET_EVENTS.ORDER_DELETED,
        data
      });

      // Ses çal
      playNotification();

      // Bildirim göster
      toast.info(data.message || 'Sipariş silindi!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Verileri yenile
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-stats'] });
    };

    SocketService.on(SOCKET_EVENTS.ORDER_CREATED, handleOrderCreated);
    SocketService.on(SOCKET_EVENTS.ORDER_UPDATED, handleOrderUpdated);
    SocketService.on(SOCKET_EVENTS.ORDER_DELETED, handleOrderDeleted);

    // Cleanup function
    return () => {
      console.log('[Kitchen] Socket.IO event dinleyicileri temizleniyor');
      SocketService.off(SOCKET_EVENTS.ORDER_CREATED, handleOrderCreated);
      SocketService.off(SOCKET_EVENTS.ORDER_UPDATED, handleOrderUpdated);
      SocketService.off(SOCKET_EVENTS.ORDER_DELETED, handleOrderDeleted);
    };
  }, [queryClient, playSound]);

  // Sipariş durumu güncelleme
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      kitchenService.updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-stats'] });
      toast.success('Sipariş durumu güncellendi');
    },
    onError: () => {
      toast.error('Sipariş durumu güncellenirken bir hata oluştu');
    },
  });

  const handleStatusChange = (orderId: number, status: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const handleFilterChange = (newFilters: KitchenOrdersFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
    queryClient.invalidateQueries({ queryKey: ['kitchen-stats'] });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  const pendingOrders = ordersData?.orders?.filter(order => order.status === OrderStatus.PENDING) || [];
  const preparingOrders = ordersData?.orders?.filter(order => order.status === OrderStatus.PREPARING) || [];

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h5">Mutfak Siparişleri</Typography>
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

        {/* İstatistikler */}
        {statsData && <KitchenStats stats={statsData.data} />}

        {/* Filtreler */}
        <KitchenFilters filters={filters} onFilterChange={handleFilterChange} />

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

export default KitchenPage; 