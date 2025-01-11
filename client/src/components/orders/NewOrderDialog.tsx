import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Box,
  Autocomplete,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { OrderSource } from '../../types/enums';
import { useAuth } from '../../hooks/useAuth';
import ordersService from '../../services/orders.service';
import tablesService from '../../services/tables.service';
import productsService from '../../services/products.service';
import customersService from '../../services/customers.service';
import { toast } from 'react-hot-toast';
import { User } from '../../types/auth.types';
import { Customer } from '../../types/customer.types';
import branchService from '../../services/branch.service';
import { TableStatus, UpdateTableStatusInput } from '../../types/table.types';

interface NewOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

interface OrderItem {
  productId: number;
  quantity: number;
  notes?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Table {
  id: number;
  tableNumber: string;
  status: string;
}

const NewOrderDialog: React.FC<NewOrderDialogProps> = ({ open, onClose, onOrderCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSource, setOrderSource] = useState<OrderSource>(OrderSource.IN_STORE);
  const [tableId, setTableId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerCount, setCustomerCount] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const userInfo = user as User | undefined;
  if (!userInfo?.branchId || !userInfo?.restaurantId) {
    return null;
  }

  // Fetch necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, productsResponse, tablesResponse] = await Promise.all([
          branchService.getCustomers(userInfo.restaurantId, userInfo.branchId),
          productsService.getProducts({ restaurantId: userInfo.restaurantId }),
          branchService.getTables(userInfo.branchId, userInfo.restaurantId)
        ]);

        if (customersResponse.success) {
          setCustomers(customersResponse.data);
        }

        if (productsResponse.success) {
          setProducts(productsResponse.data.products);
        }

        if (tablesResponse.success) {
          setTables(tablesResponse.data.tables);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Veriler yüklenirken bir hata oluştu');
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, user]);

  const handleAddItem = () => {
    setItems([...items, { productId: 0, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    const updatedItem = { ...newItems[index], [field]: value };
    if (field === 'productId') {
      updatedItem.productId = Number(value);
    } else if (field === 'quantity') {
      updatedItem.quantity = Math.max(1, Number(value));
    } else {
      updatedItem[field] = value;
    }
    newItems[index] = updatedItem as OrderItem;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.branchId) {
        setError('Şube bilgisi bulunamadı.');
        return;
      }

      if (items.length === 0) {
        setError('Lütfen en az bir ürün ekleyin.');
        return;
      }

      const orderData = {
        restaurantId: Number(user.restaurantId),
        branchId: Number(user.branchId),
        orderSource,
        tableId: orderSource === OrderSource.IN_STORE ? tableId : null,
        customerId: orderSource !== OrderSource.IN_STORE ? customerId : null,
        customerCount: orderSource === OrderSource.IN_STORE ? Number(customerCount) : 1,
        notes,
        items: items.map(item => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          notes: item.notes || ''
        }))
      };

      console.log('🔵 [NewOrderDialog] Sipariş oluşturma isteği:', {
        orderData,
        orderSource,
        tableId,
        customerId
      });

      const orderResponse = await ordersService.createOrder(orderData);
      
      console.log('✅ [NewOrderDialog] Sipariş başarıyla oluşturuldu:', {
        response: orderResponse
      });

      // Masa durumunu güncelle
      if (orderSource === OrderSource.IN_STORE && tableId) {
        console.log('🔵 [NewOrderDialog] Masa durumu güncelleniyor:', {
          tableId,
          newStatus: TableStatus.OCCUPIED
        });

        const tableResponse = await tablesService.updateTableStatus(tableId, { status: TableStatus.OCCUPIED });
        
        console.log('✅ [NewOrderDialog] Masa durumu güncellendi:', {
          response: tableResponse
        });
      }

      onOrderCreated?.();
      onClose();
      toast.success('Sipariş başarıyla oluşturuldu');
    } catch (error: any) {
      console.error('❌ [NewOrderDialog] Hata:', {
        error,
        response: error.response?.data,
        message: error.message,
        orderSource,
        tableId,
        customerId
      });
      setError(error.response?.data?.message || 'Sipariş oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Yeni Sipariş</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Sipariş Kaynağı</InputLabel>
              <Select
                value={orderSource}
                onChange={(e) => setOrderSource(e.target.value as OrderSource)}
                label="Sipariş Kaynağı"
              >
                <MenuItem value={OrderSource.IN_STORE}>Restoran İçi</MenuItem>
                <MenuItem value={OrderSource.PACKAGE}>Paket Servis</MenuItem>
                <MenuItem value={OrderSource.ONLINE}>Online Sipariş</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {orderSource === OrderSource.IN_STORE && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Masa</InputLabel>
                <Select
                  value={tableId || ''}
                  onChange={(e) => setTableId(Number(e.target.value))}
                  label="Masa"
                >
                  {tables.map((table) => (
                    <MenuItem key={table.id} value={table.id}>
                      Masa {table.tableNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={customers}
              getOptionLabel={(customer) => customer.name || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Müşteri"
                  error={customers.length === 0}
                  helperText={customers.length === 0 ? 'Müşteri listesi yüklenemedi' : ''}
                />
              )}
              onChange={(_, newValue) => setCustomerId(newValue?.id ? Number(newValue.id) : null)}
              renderOption={(props, customer) => {
                const { key, ...otherProps } = props;
                return (
                  <li key={customer.id} {...otherProps}>
                    <div>
                      <Typography variant="body1">{customer.name}</Typography>
                      {customer.phoneNumber && (
                        <Typography variant="body2" color="textSecondary">
                          {customer.phoneNumber}
                        </Typography>
                      )}
                    </div>
                  </li>
                );
              }}
              fullWidth
              noOptionsText="Müşteri bulunamadı"
              loading={loading}
              loadingText="Yükleniyor..."
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Kişi Sayısı"
              value={customerCount}
              onChange={(e) => setCustomerCount(Math.max(1, parseInt(e.target.value) || 1))}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notlar"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Ürünler
            </Typography>
            {items.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                <FormControl fullWidth>
                  <InputLabel>Ürün</InputLabel>
                  <Select
                    value={item.productId || ''}
                    onChange={(e) => handleItemChange(index, 'productId', Number(e.target.value))}
                    label="Ürün"
                  >
                    <MenuItem value={0}>Seçiniz</MenuItem>
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  type="number"
                  label="Adet"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ width: 100 }}
                />
                <TextField
                  label="Not"
                  value={item.notes || ''}
                  onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length === 1}
                >
                  <RemoveIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Ürün Ekle
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Oluştur'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewOrderDialog; 