import React, { useState, useEffect } from 'react';
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
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Services
import ordersService from '../../services/orders.service';
import branchService from '../../services/branch.service';

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: {
    id: string;
    name: string;
  };
}

interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  notes?: string;
  totalPrice: number;
}

interface Table {
  id: string;
  number: string;
  status: 'EMPTY' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const NewOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [orderSource, setOrderSource] = useState<'IN_STORE' | 'PACKAGE' | 'ONLINE'>('IN_STORE');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerCount, setCustomerCount] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  
  // Data lists
  const [tables, setTables] = useState<Table[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);
  
  // Selected product form
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [itemNotes, setItemNotes] = useState<string>('');

  // Toplam tutar hesaplama
  const totalAmount = selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0);

  // Verileri yükle
  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.restaurantId) {
        setError('Restaurant bilgisi bulunamadı');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const [tables, customers, products] = await Promise.all([
          branchService.getTables(profile.restaurantId),
          branchService.getCustomers(profile.restaurantId),
          branchService.getProducts(profile.restaurantId)
        ]);

        setTables(tables.data);
        setCustomers(customers.data);
        setProducts(products.data);
      } catch (error) {
        console.error('Veriler yüklenirken hata oluştu:', error);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.restaurantId]);

  // Ürün ekleme
  const handleAddProduct = () => {
    if (!selectedProduct) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const newItem: OrderItem = {
      productId: product.id,
      product,
      quantity,
      notes: itemNotes,
      totalPrice: product.price * quantity
    };

    setSelectedProducts([...selectedProducts, newItem]);
    
    // Form alanlarını sıfırla
    setSelectedProduct('');
    setQuantity(1);
    setItemNotes('');
  };

  // Ürün silme
  const handleRemoveProduct = (index: number) => {
    const newProducts = [...selectedProducts];
    newProducts.splice(index, 1);
    setSelectedProducts(newProducts);
  };

  // Sipariş oluşturma
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!profile?.branchId) {
        setError('Şube bilgisi bulunamadı.');
        return;
      }

      if (selectedProducts.length === 0) {
        setError('Lütfen en az bir ürün ekleyin.');
        return;
      }

      const orderData = {
        branchId: profile.branchId.toString(),
        orderSource,
        tableId: orderSource === 'IN_STORE' ? selectedTable : undefined,
        customerId: orderSource !== 'IN_STORE' ? selectedCustomer : undefined,
        customerCount: orderSource === 'IN_STORE' ? customerCount : undefined,
        notes,
        items: selectedProducts.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes
        }))
      };

      await ordersService.createOrder(orderData);
      navigate('/orders');
    } catch (error) {
      console.error('Sipariş oluşturulurken hata oluştu:', error);
      setError('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !products.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Yeni Sipariş
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sipariş Detayları */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sipariş Detayları
            </Typography>
            
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Sipariş Kaynağı</InputLabel>
                <Select
                  value={orderSource}
                  label="Sipariş Kaynağı"
                  onChange={(e) => setOrderSource(e.target.value as any)}
                >
                  <MenuItem value="IN_STORE">Restoran İçi</MenuItem>
                  <MenuItem value="PACKAGE">Paket Servis</MenuItem>
                  <MenuItem value="ONLINE">Online Sipariş</MenuItem>
                </Select>
              </FormControl>

              {orderSource === 'IN_STORE' ? (
                <>
                  <FormControl fullWidth>
                    <InputLabel>Masa</InputLabel>
                    <Select
                      value={selectedTable}
                      label="Masa"
                      onChange={(e) => setSelectedTable(e.target.value)}
                    >
                      {tables.map((table) => (
                        <MenuItem
                          key={table.id}
                          value={table.id}
                          disabled={table.status !== 'EMPTY'}
                        >
                          Masa {table.number}
                          {table.status !== 'EMPTY' && ' (Dolu)'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Kişi Sayısı"
                    type="number"
                    value={customerCount}
                    onChange={(e) => setCustomerCount(Math.max(1, parseInt(e.target.value)))}
                    inputProps={{ min: 1 }}
                  />
                </>
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Müşteri</InputLabel>
                  <Select
                    value={selectedCustomer}
                    label="Müşteri"
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                label="Sipariş Notu"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Ürün Ekleme */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ürünler
            </Typography>

            <Stack direction="row" spacing={2} mb={2}>
              <FormControl fullWidth>
                <InputLabel>Ürün</InputLabel>
                <Select
                  value={selectedProduct}
                  label="Ürün"
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} - {product.price.toFixed(2)} ₺
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Adet"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                inputProps={{ min: 1 }}
                sx={{ width: 100 }}
              />

              <Button
                variant="contained"
                onClick={handleAddProduct}
                disabled={!selectedProduct}
              >
                Ekle
              </Button>
            </Stack>

            <TextField
              fullWidth
              label="Ürün Notu"
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ürün</TableCell>
                    <TableCell align="right">Adet</TableCell>
                    <TableCell align="right">Birim Fiyat</TableCell>
                    <TableCell align="right">Toplam</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedProducts.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {item.product.name}
                        {item.notes && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Not: {item.notes}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{item.product.price.toFixed(2)} ₺</TableCell>
                      <TableCell align="right">{item.totalPrice.toFixed(2)} ₺</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveProduct(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {selectedProducts.length === 0 && (
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

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">
                Toplam Tutar: {totalAmount.toFixed(2)} ₺
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
                disabled={loading || selectedProducts.length === 0}
              >
                {loading ? <CircularProgress size={24} /> : 'Siparişi Oluştur'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NewOrderPage; 