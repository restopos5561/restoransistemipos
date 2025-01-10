import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Stack, Grid, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { barService } from '../../services/bar.service';
import { OrderStatus } from '../../types/enums';
import { BarOrdersFilters } from '../../types/bar.types';
import OrderCard from '../../components/orders/OrderCard';
import BarStats from '../../components/bar/BarStats';
import { SocketService } from '../../services/socket/socket.service';
import { SOCKET_EVENTS } from '../../services/socket/socket.events';
import useSound from 'use-sound';
import { useAuth } from '../../hooks/useAuth';
import BarFilters from '../../components/bar/BarFilters';
import Pagination from '../../components/common/Pagination/Pagination';
import { Navigate } from 'react-router-dom';

const BarPage: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Rol kontrolü
  if (!user || (user.role !== 'BAR' && user.role !== 'ADMIN')) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Ses çalma hook'u
  const [playSound] = useSound('/sounds/notification.mp3', {
    volume: 1.0,
    interrupt: true,
    onload: () => {
      console.log('🔊 [Bar] Ses dosyası yüklendi');
      setAudioInitialized(true);
    },
    onloaderror: (_id: string, error: Error) => {
      console.error('🔊 [Bar] Ses dosyası yüklenirken hata:', error);
      setAudioInitialized(false);
    },
    onplayerror: (_id: string, error: Error) => {
      console.error('🔊 [Bar] Ses çalınırken hata:', error);
    }
  });

  // Ses çalma fonksiyonu
  const playNotification = () => {
    console.log('🔊 [Bar] Bildirim sesi çalınıyor');
    if (audioEnabled && audioInitialized) {
      try {
        playSound();
      } catch (error) {
        console.error('🔊 [Bar] Ses çalma hatası:', error);
      }
    } else {
      console.warn('🔊 [Bar] Ses devre dışı veya başlatılmadı:', { audioEnabled, audioInitialized });
    }
  };

  // Ses özelliğini başlat
  const initializeAudio = async () => {
    try {
      playSound();
      setAudioEnabled(true);
      setAudioInitialized(true);
      console.log('🔊 [Bar] Ses özelliği başlatıldı');
    } catch (error) {
      console.error('🔊 [Bar] Ses özelliği başlatılamadı:', error);
      setAudioEnabled(false);
      setAudioInitialized(false);
    }
  };

  // Ses durumunu değiştir
  const toggleAudio = async () => {
    console.log('🔊 [Bar] Ses durumu değiştiriliyor:', { audioEnabled, audioInitialized });
    if (!audioEnabled) {
      await initializeAudio();
    } else {
      setAudioEnabled(false);
    }
  };

  // Filtreler
  const [filters, setFilters] = useState<BarOrdersFilters>({
    status: [OrderStatus.PENDING, OrderStatus.PREPARING],
    onlyBeverages: true,
    branchId: user.branchId,
    search: '',
    page: 1,
    limit: 10
  });

  // Şube değişikliğinde filtreleri güncelle
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      branchId: user.branchId
    }));
    
    // Verileri yenile
    queryClient.invalidateQueries({ queryKey: ['bar-orders'] });
    queryClient.invalidateQueries({ queryKey: ['bar-stats'] });
  }, [user.branchId, queryClient]);

  useEffect(() => {
    if (!user?.branchId) {
      toast.error('Şube bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }
  }, [user?.branchId]);

  // İstatistikleri getir
  const { data: statsData } = useQuery({
    queryKey: ['bar-stats', user?.branchId],
    queryFn: () => {
      if (!user?.branchId) {
        throw new Error('Şube ID\'si bulunamadı');
      }
      return barService.getStats(user.branchId);
    },
    refetchInterval: 30000,
    enabled: !!user?.branchId
  });

  // Siparişleri getir
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['bar-orders', filters],
    queryFn: () => {
      console.log('[Bar] Siparişler isteniyor:', filters);
      if (!user?.branchId) {
        throw new Error('Şube ID\'si bulunamadı');
      }
      return barService.getOrders(filters);
    },
    refetchInterval: 30000,
    enabled: !!user?.branchId
  });

  // Socket.IO event dinleyicisi
  useEffect(() => {
    console.log('🔌 [Bar] Socket.IO event dinleyicileri ayarlanıyor');

    // Socket bağlantısını kontrol et
    const socket = SocketService.getSocket();
    if (!socket) {
      console.error('🔌 [Bar] Socket bağlantısı bulunamadı!');
      return;
    }

    // Event dinleyicilerini ayarla
    const handleOrderCreated = (data: any) => {
      console.log('🔌 [Bar] Yeni sipariş alındı:', {
        event: SOCKET_EVENTS.ORDER_CREATED,
        orderId: data.orderId,
        data
      });

      // Ses çal
      if (audioEnabled && audioInitialized) {
        playNotification();
      } else {
        console.warn('🔊 [Bar] Ses devre dışı - bildirim çalınamadı');
      }

      // Bildirim göster
      toast.info('Yeni içecek siparişi geldi!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Verileri yenile
      queryClient.invalidateQueries({ queryKey: ['bar-orders'] });
      queryClient.invalidateQueries({ queryKey: ['bar-stats'] });
    };

    const handleOrderDeleted = (data: any) => {
      console.log('🔌 [Bar] Sipariş silindi:', {
        event: SOCKET_EVENTS.ORDER_DELETED,
        orderId: data.orderId,
        data
      });

      // Ses çal
      if (audioEnabled && audioInitialized) {
        playNotification();
      } else {
        console.warn('🔊 [Bar] Ses devre dışı - bildirim çalınamadı');
      }

      // Bildirim göster
      toast.warning('Sipariş iptal edildi!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Verileri yenile
      queryClient.invalidateQueries({ queryKey: ['bar-orders'] });
      queryClient.invalidateQueries({ queryKey: ['bar-stats'] });
    };

    const handleOrderStatusChanged = (data: any) => {
      console.log('🔌 [Bar] Sipariş durumu değişti:', {
        event: SOCKET_EVENTS.ORDER_STATUS_CHANGED,
        orderId: data.orderId,
        status: data.status,
        data
      });

      // Ses çal
      if (audioEnabled && audioInitialized) {
        playNotification();
      } else {
        console.warn('🔊 [Bar] Ses devre dışı - bildirim çalınamadı');
      }

      // Bildirim göster
      let message = 'Sipariş durumu güncellendi';
      let type: 'info' | 'success' | 'warning' = 'info';

      switch (data.status) {
        case OrderStatus.PREPARING:
          message = 'Sipariş hazırlanmaya başlandı';
          type = 'info';
          break;
        case OrderStatus.READY:
          message = 'Sipariş hazır';
          type = 'success';
          break;
        case OrderStatus.CANCELLED:
          message = 'Sipariş iptal edildi';
          type = 'warning';
          break;
      }

      toast[type](message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Verileri yenile
      queryClient.invalidateQueries({ queryKey: ['bar-orders'] });
      queryClient.invalidateQueries({ queryKey: ['bar-stats'] });
    };

    // Event dinleyicilerini ekle
    socket.on(SOCKET_EVENTS.ORDER_CREATED, handleOrderCreated);
    socket.on(SOCKET_EVENTS.ORDER_DELETED, handleOrderDeleted);
    socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, handleOrderStatusChanged);

    // Cleanup function
    return () => {
      console.log('🔌 [Bar] Socket.IO event dinleyicileri temizleniyor');
      socket.off(SOCKET_EVENTS.ORDER_CREATED, handleOrderCreated);
      socket.off(SOCKET_EVENTS.ORDER_DELETED, handleOrderDeleted);
      socket.off(SOCKET_EVENTS.ORDER_STATUS_CHANGED, handleOrderStatusChanged);
    };
  }, [audioEnabled, audioInitialized, queryClient, playNotification]);

  // Sipariş durumu güncelleme
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      barService.updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bar-orders'] });
      queryClient.invalidateQueries({ queryKey: ['bar-stats'] });
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
    queryClient.invalidateQueries({ queryKey: ['bar-orders'] });
    queryClient.invalidateQueries({ queryKey: ['bar-stats'] });
  };

  const handleFilterChange = (newFilters: Partial<BarOrdersFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  const pendingOrders = ordersData?.orders.filter(order => order.status === OrderStatus.PENDING) || [];
  const preparingOrders = ordersData?.orders.filter(order => order.status === OrderStatus.PREPARING) || [];

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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={toggleAudio}
              startIcon={audioEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
              sx={{
                color: audioEnabled ? 'success.main' : 'error.main',
                '&:hover': {
                  backgroundColor: alpha(audioEnabled ? theme.palette.success.main : theme.palette.error.main, 0.1),
                },
              }}
            >
              {audioEnabled ? 'Ses Açık' : 'Ses Kapalı'}
            </Button>
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
          </Box>
        </Stack>

        {/* İstatistikler */}
        {statsData && <BarStats stats={statsData.data} />}

        {/* Filtreler */}
        <BarFilters filters={filters} onFilterChange={handleFilterChange} />

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

        {/* Sayfalama */}
        {ordersData && ordersData.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              currentPage={ordersData.page}
              totalPages={ordersData.totalPages}
              onPageChange={handlePageChange}
            />
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default BarPage; 