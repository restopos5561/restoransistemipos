import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Container,
  TextField,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import BackButton from '../../components/common/BackButton/BackButton';
import { toast } from 'react-hot-toast';

// Services
import ordersService from '../../services/orders.service';
import productsService from '../../services/products.service';

// Types
import { OrderStatus } from '../../types/enums';

interface OrderDetail {
  id: number;
  orderNumber: string;
  branchId: number;
  restaurantId: number;
  orderSource: 'IN_STORE' | 'PACKAGE' | 'ONLINE';
  status: OrderStatus;
  table?: {
    id: number;
    number: string;
  };
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  customerCount?: number;
  notes: string;
  orderItems: Array<{
    id: number;
    productId: number;
    product: {
      id: number;
      name: string;
      price: number;
    };
    quantity: number;
    notes: string;
    totalPrice: number;
    status: OrderStatus;
  }>;
  totalAmount: number;
  createdAt: string;
  payment?: {
    id: string;
    amount: number;
    paymentMethod: 'CASH' | 'CREDIT_CARD' | 'MEAL_CARD';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    createdAt: string;
  };
  type: 'DINE_IN' | 'TAKEAWAY';
  waiter?: {
    firstName: string;
    lastName: string;
  };
}

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [products, setProducts] = useState<Array<{ id: number; name: string; price: number }>>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [itemNotes, setItemNotes] = useState<string>('');
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);

  useEffect(() => {
    if (order) {
      setNewStatus(order.status);
    }
  }, [order]);

  // Sipariş durumuna göre chip rengi
  const getStatusColor = (status: OrderStatus) => {
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
  };

  // Sipariş durumu metni
  const getStatusText = (status: OrderStatus) => {
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
  };

  // Sipariş kaynağı metni
  const getOrderSourceText = (source: OrderDetail['orderSource']) => {
    const sources = {
      IN_STORE: 'Restoran İçi',
      PACKAGE: 'Paket Servis',
      ONLINE: 'Online Sipariş',
    };
    return sources[source];
  };

  // Ödeme yöntemi metni
  const getPaymentMethodText = (method: string) => {
    const methods = {
      CASH: 'Nakit',
      CREDIT_CARD: 'Kredi Kartı',
      MEAL_CARD: 'Yemek Kartı',
    };
    return methods[method as keyof typeof methods] || method;
  };

  // Ürünleri getir
  const fetchProducts = async () => {
    try {
      if (!order?.restaurantId) {
        console.error('Restaurant ID not found');
        return;
      }
      const response = await productsService.getProducts({ restaurantId: order.restaurantId });
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Ürünler yüklenirken hata oluştu:', error);
      setError('Ürünler yüklenirken bir hata oluştu');
    }
  };

  useEffect(() => {
    if (order?.restaurantId) {
      fetchProducts();
    }
  }, [order?.restaurantId]);

  // Sipariş detaylarını getir
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersService.getOrderById(Number(id));
      console.log('[OrderDetail] API Response:', response);

      if (response.success && response.data) {
        console.log('[OrderDetail] Raw Order Data:', response.data);
        
        // API yanıtını frontend tipine dönüştür
        const orderData: OrderDetail = {
          id: response.data.id,
          orderNumber: response.data.orderNumber,
          branchId: response.data.branchId,
          restaurantId: response.data.restaurantId,
          orderSource: response.data.orderSource,
          status: response.data.status,
          table: response.data.table,
          customer: response.data.customer,
          customerCount: response.data.customerCount,
          notes: response.data.notes || '',
          orderItems: Array.isArray(response.data.items) ? response.data.items.map((item: {
            id: number;
            productId: number;
            product: { id: number; name: string; price: number };
            quantity: number;
            notes?: string;
            totalPrice?: number;
            status: OrderStatus;
          }) => ({
            id: item.id,
            productId: item.productId,
            product: item.product,
            quantity: item.quantity,
            notes: item.notes || '',
            totalPrice: item.totalPrice || (item.quantity * item.product.price),
            status: item.status || OrderStatus.PENDING
          })) : [],
          totalAmount: response.data.totalAmount || 0,
          createdAt: response.data.orderTime || response.data.openingTime,
          payment: response.data.payment,
          type: response.data.orderSource === 'IN_STORE' ? 'DINE_IN' : 'TAKEAWAY',
          waiter: response.data.waiter
        };

        console.log('[OrderDetail] Processed Order Data:', orderData);
        setOrder(orderData);
      } else {
        throw new Error(typeof response.error === 'object' ? response.error.message : response.error || 'Sipariş detayları alınamadı');
      }
    } catch (error: any) {
      console.error('[OrderDetail] Hata:', error);
      setError(error.message || 'Sipariş detayları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Sipariş durumunu güncelle
  const handleStatusUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersService.updateOrderStatus(Number(id), newStatus);
      if (response.success) {
        await fetchOrderDetails();
        setStatusDialogOpen(false);
      } else {
        throw new Error(typeof response.error === 'object' ? response.error.message : response.error || 'Sipariş durumu güncellenemedi');
      }
    } catch (error: any) {
      console.error('Sipariş durumu güncellenirken hata oluştu:', error);
      setError(error.message || 'Sipariş durumu güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  // Ürün ekleme
  const handleAddItem = async () => {
    if (!selectedProduct) {
      toast.error('Lütfen bir ürün seçin');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      toast.error('Seçilen ürün bulunamadı');
      return;
    }

    try {
      setLoading(true);
      await ordersService.addOrderItems(Number(id), [{
        productId: selectedProduct,
        quantity: Number(quantity),
        notes: itemNotes || ''
      }]);
      
      // Siparişi yeniden yükle
      await fetchOrderDetails();
      setAddItemDialogOpen(false);
      setSelectedProduct(null);
      setQuantity(1);
      setItemNotes('');
      toast.success('Ürün başarıyla eklendi');
    } catch (error: any) {
      console.error('Ürün eklenirken hata:', error);
      toast.error(error.response?.data?.message || 'Ürün eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !order) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Sipariş bulunamadı
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100%', py: 3, bgcolor: 'rgb(249, 250, 251)' }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack 
            direction="row" 
            alignItems="center" 
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <BackButton />
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  color: 'rgb(33, 43, 54)',
                  fontSize: '1.5rem'
                }}
              >
                Sipariş Detayı #{order.orderNumber}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                startIcon={<PrintIcon />}
                variant="outlined"
                onClick={() => window.print()}
              >
                Yazdır
              </Button>
              <Button
                startIcon={<ReceiptIcon />}
                variant="outlined"
                onClick={() => window.print()}
              >
                Fiş
              </Button>
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                onClick={() => navigate(`/orders/${id}/edit`)}
              >
                Düzenle
              </Button>
            </Stack>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Sipariş Bilgileri */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Sipariş Durumu
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={getStatusText(order.status)}
                        color={getStatusColor(order.status) as any}
                      />
                      <Button
                        size="small"
                        onClick={() => {
                          setNewStatus(order.status);
                          setStatusDialogOpen(true);
                        }}
                      >
                        Durumu Güncelle
                      </Button>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Sipariş Tarihi
                    </Typography>
                    <Typography>
                      {order.createdAt ? format(new Date(order.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr }) : '-'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Sipariş Kaynağı
                    </Typography>
                    <Typography>{getOrderSourceText(order.orderSource)}</Typography>
                  </Box>

                  {order.orderSource === 'IN_STORE' ? (
                    <>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Masa
                        </Typography>
                        <Typography>Masa {order.table?.number}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Kişi Sayısı
                        </Typography>
                        <Typography>{order.customerCount} Kişi</Typography>
                      </Box>
                    </>
                  ) : (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Müşteri
                      </Typography>
                      <Typography>
                        {order.customer?.firstName} {order.customer?.lastName}
                      </Typography>
                      {order.customer?.phone && (
                        <Typography variant="body2" color="text.secondary">
                          {order.customer.phone}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {order.notes && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Sipariş Notu
                      </Typography>
                      <Typography>{order.notes}</Typography>
                    </Box>
                  )}

                  {order.waiter && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Garson
                      </Typography>
                      <Typography>
                        {order.waiter.firstName} {order.waiter.lastName}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* Ürünler ve Ödeme */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Ürünler
                  </Typography>
                </Stack>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ürün</TableCell>
                        <TableCell align="right">Adet</TableCell>
                        <TableCell align="right">Birim Fiyat</TableCell>
                        <TableCell align="right">Toplam</TableCell>
                        <TableCell align="right">Durum</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.orderItems && order.orderItems.length > 0 ? (
                        order.orderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product.name}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{item.product.price.toFixed(2)} ₺</TableCell>
                            <TableCell align="right">{(item.quantity * item.product.price).toFixed(2)} ₺</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={getStatusText(item.status)} 
                                color={getStatusColor(item.status)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            Henüz ürün eklenmedi
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Ara Toplam</Typography>
                    <Typography>
                      {order.totalAmount.toFixed(2)} ₺
                    </Typography>
                  </Stack>

                  {/* Ödeme Bilgileri */}
                  {order.payment ? (
                    <>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography>Ödeme Yöntemi</Typography>
                        <Typography>{getPaymentMethodText(order.payment.paymentMethod)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography>Ödeme Durumu</Typography>
                        <Chip
                          label={order.payment.status === 'COMPLETED' ? 'Ödendi' : 'Bekliyor'}
                          color={order.payment.status === 'COMPLETED' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Stack>
                    </>
                  ) : (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>Ödeme Durumu</Typography>
                      <Chip label="Ödeme Bekliyor" color="warning" size="small" />
                    </Stack>
                  )}

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6">Toplam</Typography>
                    <Typography variant="h6">
                      {order.totalAmount.toFixed(2)} ₺
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Durum Güncelleme Dialog */}
          <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
            <DialogTitle>Sipariş Durumunu Güncelle</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Yeni Durum</InputLabel>
                <Select
                  value={newStatus || 'PENDING'}
                  label="Yeni Durum"
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                >
                  <MenuItem value="PENDING">Beklemede</MenuItem>
                  <MenuItem value="PREPARING">Hazırlanıyor</MenuItem>
                  <MenuItem value="READY">Hazır</MenuItem>
                  <MenuItem value="DELIVERED">Teslim Edildi</MenuItem>
                  <MenuItem value="COMPLETED">Tamamlandı</MenuItem>
                  <MenuItem value="CANCELLED">İptal Edildi</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setStatusDialogOpen(false)}>İptal</Button>
              <Button onClick={handleStatusUpdate} variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Güncelle'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Ürün Ekleme Dialog */}
          <Dialog open={addItemDialogOpen} onClose={() => setAddItemDialogOpen(false)}>
            <DialogTitle>Ürün Ekle</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Ürün</InputLabel>
                <Select
                  value={selectedProduct || ''}
                  label="Ürün"
                  onChange={(e) => setSelectedProduct(Number(e.target.value))}
                >
                  {Array.isArray(products) && products.length > 0 ? (
                    products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name} - {product.price.toFixed(2)} ₺
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Ürün bulunamadı</MenuItem>
                  )}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Adet"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                sx={{ mt: 2 }}
                InputProps={{ inputProps: { min: 1 } }}
              />
              <TextField
                fullWidth
                label="Notlar"
                multiline
                rows={3}
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddItemDialogOpen(false)}>İptal</Button>
              <Button onClick={handleAddItem} variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Ekle'}
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </Container>
    </Box>
  );
};

export default OrderDetailPage;