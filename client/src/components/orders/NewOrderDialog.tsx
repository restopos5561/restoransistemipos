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
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { OrderSource } from '../../types/enums';
import { useAuth } from '../../hooks/useAuth';
import ordersService from '../../services/orders.service';
import { tablesService } from '../../services/tables.service';
import productsService from '../../services/products.service';
import customersService from '../../services/customers.service';
import { toast } from 'react-hot-toast';
import { User } from '../../types/auth.types';
import { Customer } from '../../types/customer.types';

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
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderSource, setOrderSource] = useState<OrderSource>(OrderSource.IN_STORE);
  const [tableId, setTableId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerCount, setCustomerCount] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ productId: 0, quantity: 1 }]);
  
  // Data lists
  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch necessary data
  useEffect(() => {
    const fetchData = async () => {
      const userProfile = profile as User | undefined;
      if (!userProfile?.branchId || !userProfile?.restaurantId) {
        toast.error('Şube veya restoran bilgisi bulunamadı');
        return;
      }

      try {
        setLoadingData(true);
        const [tablesRes, productsRes, customersRes] = await Promise.all([
          tablesService.getTables({ 
            branchId: userProfile.branchId,
            restaurantId: userProfile.restaurantId 
          }),
          productsService.getProducts({ 
            branchId: userProfile.branchId,
            restaurantId: userProfile.restaurantId 
          }),
          customersService.getCustomers({
            branchId: userProfile.branchId,
            restaurantId: userProfile.restaurantId,
            page: 1,
            limit: 10
          })
        ]);

        console.log('Backend yanıtları:', {
          tables: tablesRes,
          products: productsRes,
          customers: customersRes
        });

        // Müşteri verilerini kontrol et ve set et
        if (customersRes?.success && customersRes?.data?.customers) {
          console.log('Müşteriler yükleniyor:', customersRes.data.customers);
          setCustomers(customersRes.data.customers);
        } else {
          console.error('Müşteri verisi bulunamadı:', customersRes);
          setCustomers([]);
        }

        // Masa verilerini kontrol et ve set et
        if (tablesRes?.success && tablesRes?.data?.tables) {
          console.log('Masalar yükleniyor:', tablesRes.data.tables);
          setTables(tablesRes.data.tables);
        } else {
          console.error('Masa verisi bulunamadı:', tablesRes);
          setTables([]);
        }

        // Ürün verilerini kontrol et ve set et
        if (productsRes?.success && productsRes?.data?.products) {
          console.log('Ürünler yükleniyor:', productsRes.data.products);
          setProducts(productsRes.data.products);
        } else {
          console.error('Ürün verisi bulunamadı:', productsRes);
          setProducts([]);
        }

        // Veri kontrolü
        const hasErrors = !customersRes?.success || !customersRes?.data?.customers || 
                         !tablesRes?.success || !tablesRes?.data?.tables || 
                         !productsRes?.success || !productsRes?.data?.products;

        if (hasErrors) {
          toast.error('Bazı veriler yüklenemedi, lütfen sayfayı yenileyin');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoadingData(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, profile]);

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
      const userProfile = profile as User | undefined;
      if (!userProfile?.branchId || !userProfile?.restaurantId) {
        toast.error('Şube veya restoran bilgisi bulunamadı');
        return;
      }

      // Debug için items'ları kontrol et
      console.log('Ham items:', items);

      // Validate items - productId kontrolünü düzeltelim
      const validItems = items.filter(item => {
        console.log('Item kontrol:', item);
        return item.productId && item.productId > 0 && item.quantity > 0;
      });

      console.log('Geçerli items:', validItems);

      if (validItems.length === 0) {
        toast.error('En az bir ürün eklemelisiniz ve ürün seçimi yapmalısınız');
        return;
      }

      // Validate table selection for in-store orders
      if (orderSource === OrderSource.IN_STORE && !tableId) {
        toast.error('Lütfen bir masa seçin');
        return;
      }

      setLoading(true);

      // Zorunlu alanları kontrol et
      if (!orderSource) {
        toast.error('Sipariş kaynağı seçilmedi');
        return;
      }

      const orderData = {
        branchId: Number(userProfile.branchId),
        restaurantId: Number(userProfile.restaurantId),
        orderSource,
        tableId: orderSource === OrderSource.IN_STORE ? Number(tableId) : null,
        customerId: customerId ? Number(customerId) : null,
        customerCount: Number(customerCount),
        notes: notes.trim() || '',
        items: validItems.map(item => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          notes: item.notes?.trim() || ''
        }))
      };

      console.log('Gönderilen sipariş verisi:', JSON.stringify(orderData, null, 2));
      const response = await ordersService.createOrder(orderData);

      if (response.success) {
        toast.success('Sipariş başarıyla oluşturuldu');
        onOrderCreated();
        onClose();
      } else {
        throw new Error(response.error || 'Sipariş oluşturulamadı');
      }
    } catch (error: any) {
      console.error('Sipariş oluşturma hatası:', error);
      console.error('Hata detayı:', error.response?.data);
      const errorMessage = error.response?.data?.error?.details || error.message || 'Sipariş oluşturulurken bir hata oluştu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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
              onChange={(_, newValue) => setCustomerId(newValue?.id || null)}
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
              loading={loadingData}
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