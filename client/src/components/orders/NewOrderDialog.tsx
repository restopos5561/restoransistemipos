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

interface NewOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

interface OrderItem {
  productId: number;
  quantity: number;
  notes?: string | undefined;
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

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
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
            restaurantId: userProfile.restaurantId
          })
        ]);

        if (tablesRes.success) setTables(tablesRes.data.tables || []);
        if (productsRes.success) setProducts(productsRes.data.products || []);
        if (customersRes.success) setCustomers(customersRes.data.customers || []);

        console.log('Fetched data:', {
          tables: tablesRes.data,
          products: productsRes.data,
          customers: customersRes.data
        });
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
        toast.error('Şube bilgisi bulunamadı');
        return;
      }

      // Validate items
      const validItems = items.filter(item => item.productId !== 0 && item.quantity > 0);
      if (validItems.length === 0) {
        toast.error('En az bir ürün eklemelisiniz');
        return;
      }

      // Validate table selection for in-store orders
      if (orderSource === OrderSource.IN_STORE && !tableId) {
        toast.error('Lütfen bir masa seçin');
        return;
      }

      setLoading(true);

      const orderData = {
        branchId: Number(userProfile.branchId),
        restaurantId: Number(userProfile.restaurantId),
        orderSource,
        tableId: orderSource === OrderSource.IN_STORE ? Number(tableId) : null,
        customerId: customerId ? Number(customerId) : null,
        customerCount: Number(customerCount),
        notes: notes.trim(),
        items: validItems.map(item => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          notes: item.notes?.trim() || ''
        }))
      };

      console.log('Sending order data:', orderData);
      const response = await ordersService.createOrder(orderData);

      if (response.success) {
        toast.success('Sipariş başarıyla oluşturuldu');
        onOrderCreated();
        onClose();
      } else {
        throw new Error(response.error || 'Sipariş oluşturulamadı');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
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
            <Autocomplete<Customer>
              options={customers}
              getOptionLabel={(customer) => customer ? `${customer.firstName} ${customer.lastName}` : ''}
              onChange={(_, value) => setCustomerId(value?.id || null)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Müşteri" 
                  error={!customers.length}
                  helperText={!customers.length ? 'Müşteri listesi yüklenemedi' : ''}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  {option.firstName} {option.lastName}
                </li>
              )}
              fullWidth
              noOptionsText="Müşteri bulunamadı"
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