import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { OrderStatus, OrderSource, PaymentStatus } from '../../types/enums';

// Services
import ordersService from '../../services/orders.service';
import branchService from '../../services/branch.service';
import productsService from '../../services/products.service';

// Types
interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  category?: {
    id: number;
    name: string;
  };
}

interface OrderItem {
  id?: number;
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
}

interface Table {
  id: number;
  tableNumber: string;
  status: 'EMPTY' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  capacity?: number;
  location?: string | null;
  branchId: number;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface FormState {
  orderSource: OrderSource;
  tableId: number | null;
  customerId: number | null;
  customerCount: number;
  notes: string;
  priority: boolean;
  discountAmount: number;
  discountType: string | null;
  paymentStatus: PaymentStatus;
  itemCount: number;
}

interface OrderDetail {
  id: number;
  orderNumber: string;
  branchId: number;
  restaurantId: number;
  orderSource: OrderSource;
  status: OrderStatus;
  table?: {
    id: number;
    number: string;
  };
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  customerCount?: number;
  notes: string;
  items: Array<{
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
  priority?: boolean;
  discountAmount: number;
  discountType: string | null;
  paymentStatus: PaymentStatus;
}

const EditOrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isProfileLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  
  // Helper functions
  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      'PENDING': 'Beklemede',
      'PREPARING': 'Hazırlanıyor',
      'READY': 'Hazır',
      'DELIVERED': 'Teslim Edildi',
      'COMPLETED': 'Tamamlandı',
      'CANCELLED': 'İptal Edildi',
      'ITEM_ISSUE': 'Ürün Sorunu',
      'PARTIALLY_PAID': 'Kısmi Ödeme'
    };
    return texts[status] || status;
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const colors: Record<string, any> = {
      'PENDING': 'warning',
      'PREPARING': 'info',
      'READY': 'success',
      'DELIVERED': 'primary',
      'COMPLETED': 'secondary',
      'CANCELLED': 'error',
      'ITEM_ISSUE': 'error',
      'PARTIALLY_PAID': 'warning'
    };
    return colors[status] || 'default';
  };

  // Form state
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [formData, setFormData] = useState<FormState>({
    orderSource: OrderSource.IN_STORE,
    tableId: null,
    customerId: null,
    customerCount: 1,
    notes: '',
    priority: false,
    discountAmount: 0,
    discountType: null,
    paymentStatus: PaymentStatus.PENDING,
    itemCount: 0,
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  // Data lists
  const [tables, setTables] = useState<Table[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Add item dialog
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [itemNotes, setItemNotes] = useState<string>('');

  // Toplam tutar hesaplama
  const totalAmount = orderItems.reduce((sum, item) => {
    const itemTotal = item.quantity * item.product.price;
    return sum + (isNaN(itemTotal) ? 0 : itemTotal);
  }, 0);

  // Profil ve auth kontrolü
  useEffect(() => {
    console.log('Auth State:', {
      user,
      isProfileLoading,
      restaurantId: user?.restaurantId,
      branchId: user?.branchId
    });

    if (!isProfileLoading && !user) {
      console.error('Profil bulunamadı, login sayfasına yönlendiriliyor');
      navigate('/login');
    }
  }, [user, isProfileLoading, navigate]);

  // Verileri yükle
  useEffect(() => {
    let isActive = true;
    const fetchData = async () => {
      try {
        if (!id || isProfileLoading || !user?.restaurantId || !user?.branchId) {
          return;
        }

        setLoading(true);
        setError(null);

        const orderId = parseInt(id);
        const restaurantId = user.restaurantId;
        const branchId = user.branchId;

        console.log('[EditOrderPage] Veriler yükleniyor:', {
          orderId,
          restaurantId,
          branchId
        });

        // First fetch order details
        const orderResponse = await ordersService.getOrderById(orderId);
        if (!orderResponse.success || !orderResponse.data) {
          throw new Error('Sipariş bulunamadı');
        }

        const orderData = orderResponse.data as OrderDetail;

        // Tamamlanmış siparişleri düzenlemeyi engelle
        if (orderData.status === 'DELIVERED' || orderData.status === 'COMPLETED') {
          setError('Tamamlanmış siparişler düzenlenemez');
          return;
        }

        // Then fetch related data
        try {
          const [tablesResponse, customersResponse, productsResponse] = await Promise.all([
            branchService.getTables(branchId, restaurantId),
            branchService.getCustomers(restaurantId, branchId),
            branchService.getProducts(restaurantId, { branchId })
          ]);

          console.log('[EditOrderPage] Masalar yüklendi:', {
            success: tablesResponse.success,
            count: tablesResponse.data?.tables?.length || 0
          });

          if (isActive) {
            if (tablesResponse.success && tablesResponse.data) {
              setTables(tablesResponse.data.tables || []);
            } else {
              console.error('[EditOrderPage] Masa listesi alınamadı:', tablesResponse);
              toast.error('Masa listesi yüklenirken hata oluştu');
            }

            if (!tablesResponse.success || !customersResponse.success || !productsResponse.success) {
              throw new Error('Veriler alınamadı');
            }

            const customers = customersResponse.data || [];
            const products = productsResponse.data?.products || [];

            console.log('Products response:', productsResponse);
            console.log('Parsed products:', products);

            setCustomers(customers);
            setProducts(products);

            // Validate table ID exists in tables array
            const tableExists = orderData.table?.id ? Array.isArray(tables) && tables.some((t: Table) => t.id === orderData.table?.id) : false;
            const customerExists = orderData.customer?.id ? Array.isArray(customers) && customers.some((c: Customer) => c.id === orderData.customer?.id) : false;

            // Form state'ini doldur
            const formState: FormState = {
              orderSource: orderData.orderSource || OrderSource.IN_STORE,
              tableId: tableExists ? orderData.table?.id || null : null,
              customerId: customerExists ? orderData.customer?.id || null : null,
              customerCount: orderData.customerCount || 1,
              notes: orderData.notes || '',
              priority: Boolean(orderData.priority),
              discountAmount: orderData.discountAmount || 0,
              discountType: orderData.discountType || null,
              paymentStatus: orderData.paymentStatus || PaymentStatus.PENDING,
              itemCount: orderData.items?.length || 0,
            };

            setOrder(orderData);
            setFormData(formState);

            // Sipariş kalemlerini map'le
            const mappedItems = orderData.items?.map(item => ({
              id: item.id,
              productId: item.product.id,
              product: {
                id: item.product.id,
                name: item.product.name,
                price: Number(item.product.price)
              },
              quantity: Number(item.quantity),
              notes: item.notes || '',
              totalPrice: Number(item.quantity) * Number(item.product.price),
              status: item.status
            })) || [];

            setOrderItems(mappedItems);

          }
        } catch (error) {
          console.error('[EditOrderPage] Veri yükleme hatası:', error);
          toast.error('Veriler yüklenirken hata oluştu');
          setError('Veriler yüklenirken hata oluştu');
        }
      } catch (error) {
        console.error('[EditOrderPage] Sipariş yükleme hatası:', error);
        toast.error('Sipariş yüklenirken hata oluştu');
        setError('Sipariş yüklenirken hata oluştu');
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
  }, [id, user, isProfileLoading]);

  // Ürün ekleme
  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error('Lütfen bir ürün seçin');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      toast.error('Seçilen ürün bulunamadı');
      return;
    }

    const newItem: OrderItem = {
      productId: product.id,
      product: {
        id: product.id,
        name: product.name,
        price: Number(product.price)
      },
      quantity: Number(quantity),
      notes: itemNotes || '',
      totalPrice: Number(quantity) * Number(product.price),
      status: OrderStatus.PENDING
    };

    setOrderItems(prevItems => [...prevItems, newItem]);
    setAddItemDialogOpen(false);
    setSelectedProduct(null);
    setQuantity(1);
    setItemNotes('');
  };

  // Ürün silme
  const handleRemoveItem = (index: number) => {
    setOrderItems(prevItems => {
      const newItems = [...prevItems];
      newItems.splice(index, 1);
      return newItems;
    });
  };

  // Sipariş güncelleme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.branchId) {
      toast.error('Şube bilgisi bulunamadı');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Lütfen en az bir ürün ekleyin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!order) {
        throw new Error('Sipariş bilgileri bulunamadı');
      }

      if (order.status === 'DELIVERED' || order.status === 'COMPLETED') {
        throw new Error('Tamamlanmış siparişler güncellenemez');
      }

      const orderData = {
        branchId: user.branchId,
        orderSource: formData.orderSource,
        tableId: formData.tableId,
        customerId: formData.customerId,
        customerCount: formData.customerCount,
        notes: formData.notes,
        priority: formData.priority,
        discountAmount: formData.discountAmount,
        discountType: formData.discountType,
        paymentStatus: formData.paymentStatus,
        items: orderItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes || '',
        }))
      };

      console.log('Gönderilen sipariş verisi:', orderData);

      const response = await ordersService.updateOrder(parseInt(id!), orderData);
      
      if (!response.success) {
        throw new Error(response.message || 'Sipariş güncellenirken bir hata oluştu');
      }

      toast.success('Sipariş başarıyla güncellendi');
      navigate('/orders');
    } catch (error: any) {
      console.error('Sipariş güncellenirken hata:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Sipariş güncellenirken bir hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add status update handler
  const handleStatusUpdate = async () => {
    try {
      console.warn('🔥 [EditOrderPage] Durum güncelleme başladı:', {
        orderId: order?.id,
        currentStatus: order?.status,
        newStatus,
        orderData: order
      });
      
      setLoading(true);
      await ordersService.updateOrderStatus(Number(order!.id), newStatus);
      
      console.warn('🔥 [EditOrderPage] Durum güncelleme başarılı');
      
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      setShowStatusDialog(false);
      toast.success('Sipariş durumu güncellendi');
    } catch (error: any) {
      console.error('🔥 [EditOrderPage] Durum güncelleme hatası:', {
        error,
        response: error.response?.data,
        orderId: order?.id,
        currentStatus: order?.status,
        newStatus
      });
      toast.error(error.response?.data?.message || error.message || 'Sipariş durumu güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Loading durumu
  if (isProfileLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/orders')}
        >
          Siparişlere Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Sipariş Detayı #{order?.orderNumber}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => navigate('/orders')}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={orderItems.length === 0}
          >
            Kaydet
          </Button>
        </Stack>
      </Stack>

      {/* Sipariş Durumu Kartı */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="subtitle1" sx={{ minWidth: 120 }}>
            Sipariş Durumu:
          </Typography>
          <Chip
            label={getStatusText(order?.status || 'PENDING')}
            color={getStatusColor(order?.status || 'PENDING')}
            sx={{ minWidth: 100 }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowStatusDialog(true)}
            startIcon={<EditIcon />}
          >
            Durumu Güncelle
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Sipariş Detayları */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sipariş Detayları
            </Typography>
            
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Sipariş Durumu</InputLabel>
                <Select
                  value={order?.status || ''}
                  label="Sipariş Durumu"
                  disabled
                >
                  <MenuItem value="PENDING">Beklemede</MenuItem>
                  <MenuItem value="PREPARING">Hazırlanıyor</MenuItem>
                  <MenuItem value="READY">Hazır</MenuItem>
                  <MenuItem value="DELIVERED">Teslim Edildi</MenuItem>
                  <MenuItem value="COMPLETED">Tamamlandı</MenuItem>
                  <MenuItem value="CANCELLED">İptal Edildi</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Sipariş Kaynağı</InputLabel>
                <Select
                  value={formData.orderSource}
                  label="Sipariş Kaynağı"
                  onChange={(e) => setFormData(prev => ({ ...prev, orderSource: e.target.value as any }))}
                >
                  <MenuItem value="IN_STORE">Restoran İçi</MenuItem>
                  <MenuItem value="PACKAGE">Paket Servis</MenuItem>
                  <MenuItem value="ONLINE">Online Sipariş</MenuItem>
                </Select>
              </FormControl>

              {formData.orderSource === 'IN_STORE' ? (
                <>
                  <FormControl fullWidth>
                    <InputLabel>Masa</InputLabel>
                    <Select
                      value={formData.tableId === null ? '' : formData.tableId}
                      label="Masa"
                      onChange={(e) => setFormData(prev => ({ ...prev, tableId: e.target.value === '' ? null : Number(e.target.value) }))}
                    >
                      <MenuItem value="">Seçiniz</MenuItem>
                      {Array.isArray(tables) && tables.map((table) => (
                        <MenuItem key={table.id} value={table.id}>
                          Masa {table.tableNumber}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Kişi Sayısı"
                    type="number"
                    value={formData.customerCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerCount: Math.max(1, parseInt(e.target.value) || 1) }))}
                    inputProps={{ min: 1 }}
                  />
                </>
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Müşteri</InputLabel>
                  <Select
                    value={formData.customerId === null ? '' : formData.customerId}
                    label="Müşteri"
                    onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value === '' ? null : Number(e.target.value) }))}
                  >
                    <MenuItem value="">Seçiniz</MenuItem>
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                fullWidth
                label="Notlar"
                multiline
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Ürünler */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Ürünler
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddItemDialogOpen(true)}
              >
                Ürün Ekle
              </Button>
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
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">₺{item.product.price.toFixed(2)}</TableCell>
                      <TableCell align="right">₺{item.totalPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={getStatusText(item.status)}
                          color={getStatusColor(item.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveItem(index)}
                          disabled={item.status !== 'PENDING'}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orderItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Henüz ürün eklenmemiş
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {orderItems.length > 0 && (
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Typography variant="h6">
                  Toplam: ₺{totalAmount.toFixed(2)}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

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
              {Array.isArray(products) && products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name} - {product.price.toFixed(2)} ₺
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Adet"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
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
          <Button 
            onClick={handleAddItem} 
            variant="contained" 
            disabled={loading || !selectedProduct}
          >
            {loading ? <CircularProgress size={24} /> : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onClose={() => setShowStatusDialog(false)}>
        <DialogTitle>Sipariş Durumunu Güncelle</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Yeni Durum</InputLabel>
            <Select
              value={newStatus}
              label="Yeni Durum"
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
            >
              <MenuItem value={OrderStatus.PENDING}>Beklemede</MenuItem>
              <MenuItem value={OrderStatus.PREPARING}>Hazırlanıyor</MenuItem>
              <MenuItem value={OrderStatus.READY}>Hazır</MenuItem>
              <MenuItem value={OrderStatus.DELIVERED}>Teslim Edildi</MenuItem>
              <MenuItem value={OrderStatus.COMPLETED}>Tamamlandı</MenuItem>
              <MenuItem value={OrderStatus.CANCELLED}>İptal Edildi</MenuItem>
              <MenuItem value={OrderStatus.ITEM_ISSUE}>Ürün Sorunu</MenuItem>
              <MenuItem value={OrderStatus.PARTIALLY_PAID}>Kısmi Ödeme</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)}>İptal</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditOrderPage; 