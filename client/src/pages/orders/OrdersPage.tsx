import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
  alpha
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, LocalPrintshop as LocalPrintshopIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

// Components
import SearchBar from '../../components/common/SearchBar/SearchBar';
import Pagination from '../../components/common/Pagination/Pagination';
import DateRangePicker from '../../components/common/DateRangePicker';
import NewOrderDialog from '../../components/orders/NewOrderDialog';

// Services
import ordersService from '../../services/orders.service';

// Types
import { OrderListParams } from '../../types/order.types';
import { OrderStatus, OrderSource } from '../../types/enums';

interface OrderDetail {
  id: number;
  orderNumber: string;
  orderTime?: string;
  openingTime: string;
  orderSource: OrderSource;
  table?: {
    id: number;
    number: string;
  };
  customer?: {
    firstName: string;
    lastName: string;
  };
  customerCount?: number;
  totalAmount: number;
  status: OrderStatus;
  payment?: {
    status: 'COMPLETED' | 'PENDING';
  };
}

const OrdersPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<OrderSource | ''>('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    firstDay.setHours(0, 0, 0, 0);
    lastDay.setHours(23, 59, 59, 999);
    return [firstDay, lastDay];
  });
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'delete' | 'status' | null>(null);
  const [newOrderDialogOpen, setNewOrderDialogOpen] = useState(false);

  // Sipariş durumuna göre chip rengi ve metin
  const getStatusColor = useCallback((status: OrderStatus) => {
    const colors: Record<OrderStatus, "warning" | "info" | "success" | "default" | "error"> = {
      [OrderStatus.PENDING]: 'warning',
      [OrderStatus.PREPARING]: 'info',
      [OrderStatus.READY]: 'success',
      [OrderStatus.DELIVERED]: 'default',
      [OrderStatus.CANCELLED]: 'error',
      [OrderStatus.COMPLETED]: 'success',
      [OrderStatus.ITEM_ISSUE]: 'error',
      [OrderStatus.PARTIALLY_PAID]: 'warning'
    };
    return colors[status];
  }, []);

  const getStatusText = useCallback((status: OrderStatus) => {
    const texts: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Beklemede',
      [OrderStatus.PREPARING]: 'Hazırlanıyor',
      [OrderStatus.READY]: 'Hazır',
      [OrderStatus.DELIVERED]: 'Teslim Edildi',
      [OrderStatus.CANCELLED]: 'İptal Edildi',
      [OrderStatus.COMPLETED]: 'Tamamlandı',
      [OrderStatus.ITEM_ISSUE]: 'Ürün Sorunu',
      [OrderStatus.PARTIALLY_PAID]: 'Kısmi Ödeme'
    };
    return texts[status];
  }, []);

  // Sipariş kaynağına göre metin
  const getOrderSourceText = useCallback((source: OrderSource) => {
    const sources = {
      [OrderSource.IN_STORE]: 'Restoran İçi',
      [OrderSource.PACKAGE]: 'Paket Servis',
      [OrderSource.ONLINE]: 'Online Sipariş',
    };
    return sources[source];
  }, []);

  // Siparişleri getir
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: OrderListParams = {
        page,
        limit: 10,
        search: searchTerm,
        status: statusFilter as OrderStatus,
        type: sourceFilter as OrderSource,
        ...(profile?.branchId && { branchId: profile.branchId })
      };

      // Sadece geçerli tarihler varsa ekle
      if (dateRange[0] instanceof Date && !isNaN(dateRange[0].getTime())) {
        const startDate = new Date(dateRange[0]);
        startDate.setHours(0, 0, 0, 0);
        params.startDate = format(startDate, 'yyyy-MM-dd');
      }

      if (dateRange[1] instanceof Date && !isNaN(dateRange[1].getTime())) {
        const endDate = new Date(dateRange[1]);
        endDate.setHours(0, 0, 0, 0);
        params.endDate = format(endDate, 'yyyy-MM-dd');
      }

      const response = await ordersService.getOrders(params);
      
      if (!response.success) {
        throw new Error(response.error || 'Siparişler alınamadı');
      }

      setOrders(response.data);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error('Siparişler yüklenirken hata oluştu:', error);
      setError('Siparişler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter, sourceFilter, dateRange, profile?.branchId]);

  // Çoklu seçim işlemleri
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedOrders(orders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  // Toplu silme işlemi
  const handleBulkDelete = async () => {
    try {
      await ordersService.bulkDeleteOrders(selectedOrders);
      toast.success('Seçili siparişler başarıyla silindi');
      setSelectedOrders([]);
      setBulkActionDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      console.error('Siparişler silinirken hata oluştu:', error);
      toast.error('Siparişler silinirken bir hata oluştu');
    }
  };

  // Toplu yazdırma işlemi
  const handleBulkPrint = async () => {
    try {
      const response = await ordersService.getOrdersForPrinting(selectedOrders);
      if (response.success) {
        // Yazdırma işlemi için gerekli kodlar eklenecek
        console.log('Yazdırılacak siparişler:', response.data);
        toast.success('Siparişler yazdırılıyor...');
      }
    } catch (error: any) {
      console.error('Yazdırma hatası:', error);
      toast.error('Siparişler yazdırılırken bir hata oluştu');
    }
  };

  // Toplu işlem dialog kontrolü
  const handleBulkActionClick = (actionType: 'delete' | 'status') => {
    setBulkActionType(actionType);
    setBulkActionDialogOpen(true);
  };

  const handleNewOrder = () => {
    setNewOrderDialogOpen(true);
  };

  const handleNewOrderClose = () => {
    setNewOrderDialogOpen(false);
  };

  const handleOrderCreated = () => {
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Memoize edilmiş tablo başlıkları
  const tableHeaders = useMemo(() => [
    { id: 'orderNumber', label: 'Sipariş No', align: 'left' as const },
    { id: 'date', label: 'Tarih', align: 'left' as const },
    { id: 'source', label: 'Kaynak', align: 'center' as const },
    { id: 'tableCustomer', label: 'Masa/Müşteri', align: 'center' as const },
    { id: 'customerCount', label: 'Kişi', align: 'center' as const },
    { id: 'amount', label: 'Tutar', align: 'center' as const },
    { id: 'payment', label: 'Ödeme', align: 'center' as const },
    { id: 'status', label: 'Durum', align: 'center' as const },
    { id: 'actions', label: 'İşlemler', align: 'center' as const }
  ], []);

  // Toplu işlem aksiyonları
  const bulkActions = [
    { icon: <DeleteIcon />, name: 'Sil', action: () => handleBulkActionClick('delete') },
    { icon: <LocalPrintshopIcon />, name: 'Yazdır', action: handleBulkPrint },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: '100%', bgcolor: 'rgb(249, 250, 251)' }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: 'rgb(33, 43, 54)',
              fontSize: '1.5rem'
            }}
          >
            Siparişler
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              borderRadius: 2,
              px: 3,
              '&:hover': {
                bgcolor: theme.palette.primary.dark
              }
            }}
            onClick={handleNewOrder}
          >
            Yeni Sipariş
          </Button>
        </Stack>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
              '& .MuiAlert-icon': {
                color: theme.palette.error.main
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Paper 
          elevation={0}
          sx={{ 
            p: 2,
            borderRadius: 3,
            bgcolor: 'white',
            boxShadow: 'rgba(145, 158, 171, 0.08) 0px 0px 2px 0px, rgba(145, 158, 171, 0.08) 0px 12px 24px -4px'
          }}
        >
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <SearchBar
                value={searchTerm}
                onChange={(value) => setSearchTerm(value)}
                placeholder="Sipariş numarası, müşteri adı veya masa numarası ile ara..."
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select
                  value={statusFilter}
                  label="Durum"
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.divider, 0.2)
                    }
                  }}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {Object.values(OrderStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {getStatusText(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sipariş Kaynağı</InputLabel>
                <Select
                  value={sourceFilter}
                  label="Sipariş Kaynağı"
                  onChange={(e) => setSourceFilter(e.target.value as OrderSource | '')}
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.divider, 0.2)
                    }
                  }}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {Object.values(OrderSource).map((source) => (
                    <MenuItem key={source} value={source}>
                      {getOrderSourceText(source)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                size="small"
              />
            </Grid>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedOrders.length > 0 && selectedOrders.length === orders.length}
                      indeterminate={selectedOrders.length > 0 && selectedOrders.length < orders.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  {tableHeaders.map((header) => (
                    <TableCell 
                      key={header.id} 
                      align={header.align}
                    >
                      {header.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        Sipariş bulunamadı
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow 
                      key={order.id}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04)
                        }
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                        />
                      </TableCell>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{format(new Date(order.orderTime || order.openingTime), 'dd.MM.yyyy HH:mm', { locale: tr })}</TableCell>
                      <TableCell align="center">{getOrderSourceText(order.orderSource)}</TableCell>
                      <TableCell align="center">{order.table ? `Masa ${order.table.number}` : `${order.customer?.firstName} ${order.customer?.lastName}`}</TableCell>
                      <TableCell align="center">{order.customerCount || '-'}</TableCell>
                      <TableCell align="center">₺{order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={order.payment?.status === 'COMPLETED' ? 'Ödendi' : 'Beklemede'}
                          color={order.payment?.status === 'COMPLETED' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getStatusText(order.status)}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <ViewIcon 
                          fontSize="small" 
                          sx={{ color: 'primary.main', cursor: 'pointer', mr: 1 }}
                          onClick={() => navigate(`/orders/${order.id}`)}
                        />
                        <EditIcon 
                          fontSize="small" 
                          sx={{ color: 'warning.main', cursor: 'pointer', mr: 1 }}
                          onClick={() => navigate(`/orders/${order.id}/edit`)}
                        />
                        <DeleteIcon 
                          fontSize="small" 
                          sx={{ color: 'error.main', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedOrders([order.id]);
                            handleBulkActionClick('delete');
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {orders.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </Box>
          )}
        </Paper>
      </Stack>

      {/* Toplu İşlem SpeedDial */}
      {selectedOrders.length > 0 && (
        <SpeedDial
          ariaLabel="Toplu İşlemler"
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            '& .MuiFab-primary': {
              bgcolor: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.primary.dark
              }
            }
          }}
          icon={<SpeedDialIcon />}
        >
          {bulkActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
              sx={{
                bgcolor: 'white',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08)
                }
              }}
            />
          ))}
        </SpeedDial>
      )}

      {/* Toplu Silme Dialog */}
      <Dialog
        open={bulkActionDialogOpen && bulkActionType === 'delete'}
        onClose={() => setBulkActionDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 'rgba(145, 158, 171, 0.08) 0px 0px 2px 0px, rgba(145, 158, 171, 0.08) 0px 12px 24px -4px'
          }
        }}
      >
        <DialogTitle sx={{ color: 'rgb(33, 43, 54)', fontWeight: 700 }}>
          Toplu Silme Onayı
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            {selectedOrders.length} adet siparişi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setBulkActionDialogOpen(false)}
            sx={{ 
              color: 'rgb(99, 115, 129)',
              '&:hover': {
                bgcolor: alpha(theme.palette.text.secondary, 0.08)
              }
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleBulkDelete} 
            color="error" 
            variant="contained"
            sx={{
              borderRadius: 1,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                bgcolor: theme.palette.error.dark
              }
            }}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      <NewOrderDialog
        open={newOrderDialogOpen}
        onClose={handleNewOrderClose}
        onOrderCreated={handleOrderCreated}
      />
    </Box>
  );
};

export default OrdersPage; 