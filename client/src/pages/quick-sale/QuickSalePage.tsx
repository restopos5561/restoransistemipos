import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
  alpha,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  LocalOffer as DiscountIcon,
  Receipt as ReceiptIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  QrCodeScanner as BarcodeIcon,
  Clear as ClearIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import quickSaleService from '@/services/quick.sale.service';
import CustomerSelectModal from '@/components/customers/CustomerSelectModal';
import NumericKeypadModal from '@/components/common/NumericKeypadModal';
import { Customer } from '@/types/customer.types';
import CategorySelector from '@/components/quick-sale/CategorySelector';
import { toast } from 'react-hot-toast';

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
}

type KeypadMode = 'quantity' | 'price' | 'barcode';

const QuickSalePage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [keypadMode, setKeypadMode] = useState<KeypadMode>('quantity');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [discountedTotal, setDiscountedTotal] = useState<number>(0);

  // Toplam tutarı hesapla
  const total = cart.reduce((sum, item) => sum + item.total, 0);

  // Popüler ürünleri getir
  const { data: popularProducts } = useQuery({
    queryKey: ['popular-products', user?.branchId, selectedCategoryId, showPopularOnly],
    queryFn: () => quickSaleService.getPopularProducts(
      Number(user?.branchId),
      selectedCategoryId,
      showPopularOnly
    ),
    enabled: !!user?.branchId,
  });

  // Sepete ürün ekle
  const addToCart = (product: any) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        total: product.price
      }];
    });
  };

  // Sepetten ürün çıkar
  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Ürün miktarını güncelle
  const updateQuantity = (productId: number, change: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.price
        };
      }
      return item;
    }));
  };

  // Müşteri seçim modalını aç
  const handleOpenCustomerModal = () => {
    setIsCustomerModalOpen(true);
  };

  // Müşteri seçim modalını kapat
  const handleCloseCustomerModal = () => {
    setIsCustomerModalOpen(false);
  };

  // Müşteri seç
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  // Seçili müşteriyi temizle
  const handleClearCustomer = () => {
    setSelectedCustomer(null);
  };

  // Sayısal tuş takımını aç
  const handleOpenKeypad = (mode: KeypadMode, itemId?: number) => {
    setKeypadMode(mode);
    setSelectedItemId(itemId || null);
    setIsKeypadOpen(true);
  };

  // Sayısal tuş takımını kapat
  const handleCloseKeypad = () => {
    setIsKeypadOpen(false);
    setSelectedItemId(null);
  };

  // Sayısal tuş takımı değerini işle
  const handleKeypadSubmit = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    switch (keypadMode) {
      case 'quantity':
        if (selectedItemId) {
          setCart(prev => prev.map(item => {
            if (item.id === selectedItemId) {
              return {
                ...item,
                quantity: numValue,
                total: numValue * item.price
              };
            }
            return item;
          }));
        }
        break;

      case 'price':
        if (selectedItemId) {
          setCart(prev => prev.map(item => {
            if (item.id === selectedItemId) {
              return {
                ...item,
                price: numValue,
                total: item.quantity * numValue
              };
            }
            return item;
          }));
        }
        break;

      case 'barcode':
        // Barkod okuyucu işlemleri buraya gelecek
        break;
    }

    handleCloseKeypad();
  };

  // İndirim hesaplama
  const calculateDiscount = () => {
    const value = parseFloat(discountValue) || 0;
    if (discountType === 'PERCENTAGE') {
      return total * (value / 100);
    }
    return value;
  };

  // İndirim uygulama
  const handleApplyDiscount = () => {
    const discountAmount = calculateDiscount();
    setDiscountedTotal(total - discountAmount);
    setIsDiscountModalOpen(false);
  };

  // İndirim modalını sıfırlama
  const handleCloseDiscountModal = () => {
    setIsDiscountModalOpen(false);
    setDiscountType('PERCENTAGE');
    setDiscountValue('');
  };

  // Ödeme işlemi
  const handlePayment = async () => {
    if (!user?.branchId || !user?.restaurantId) {
      toast.error('Kullanıcı bilgileri eksik');
      return;
    }

    try {
      const finalAmount = discountedTotal > 0 ? discountedTotal : total;
      
      const response = await quickSaleService.processQuickSale({
        branchId: user.branchId,
        restaurantId: user.restaurantId,
        customerId: selectedCustomer?.id,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          note: item.notes
        })),
        paymentMethod: 'CASH',
        paymentAmount: finalAmount,
        ...(discountedTotal > 0 && {
          discount: {
            type: discountType,
            value: parseFloat(discountValue)
          }
        })
      });

      if (response.success) {
        toast.success('Satış başarıyla tamamlandı');
        // Sepeti temizle
        setCart([]);
        setDiscountedTotal(0);
        setDiscountValue('');
        setDiscountType('PERCENTAGE');
      }
    } catch (error) {
      console.error('Satış işlemi sırasında hata:', error);
      toast.error('Satış işlemi sırasında bir hata oluştu');
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Üst Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: theme.shadows[2]
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Ürün Ara veya Barkod Okut"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleOpenKeypad('barcode')}>
                    <BarcodeIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ maxWidth: 400 }}
          />
          {selectedCustomer ? (
            <Chip
              icon={<PersonIcon />}
              label={selectedCustomer.name}
              onDelete={handleClearCustomer}
              color="primary"
              variant="outlined"
            />
          ) : (
            <Button
              variant="contained"
              startIcon={<PersonIcon />}
              onClick={handleOpenCustomerModal}
              sx={{ minWidth: 130 }}
            >
              Müşteri Seç
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<DiscountIcon />}
            sx={{ minWidth: 130 }}
          >
            İndirim
          </Button>
        </Stack>
      </Paper>

      {/* Ana İçerik */}
      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* Sol Panel - Ürün Listesi */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: theme.shadows[2],
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Kategori Seçici */}
            <CategorySelector
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />

            {/* Kategoriler ve Ürünler */}
            <Box sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showPopularOnly}
                      onChange={(e) => setShowPopularOnly(e.target.checked)}
                    />
                  }
                  label="Sadece Popüler Ürünler"
                />
              </Stack>
              <Grid container spacing={1}>
                {popularProducts?.map((product: any) => (
                  <Grid item xs={6} sm={4} md={3} key={product.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: '0.3s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                      onClick={() => addToCart(product)}
                    >
                      <Typography variant="subtitle2" noWrap>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.price.toFixed(2)} ₺
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Sağ Panel - Sepet ve Ödeme */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: theme.shadows[2],
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Sepet Başlığı */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CartIcon color="primary" />
                <Typography variant="h6">Sepet</Typography>
                {selectedCustomer && (
                  <Chip
                    size="small"
                    label={selectedCustomer.name}
                    onDelete={handleClearCustomer}
                  />
                )}
              </Stack>
            </Box>

            {/* Sepet İçeriği */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              {cart.map((item) => (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 1,
                    mb: 1,
                    bgcolor: alpha(theme.palette.background.default, 0.5)
                  }}
                >
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="subtitle2">{item.name}</Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography
                          variant="body2"
                          sx={{ 
                            minWidth: 20, 
                            textAlign: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                              color: theme.palette.primary.main
                            }
                          }}
                          onClick={() => handleOpenKeypad('quantity', item.id)}
                        >
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="body2"
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              color: theme.palette.primary.main
                            }
                          }}
                          onClick={() => handleOpenKeypad('price', item.id)}
                        >
                          {item.total.toFixed(2)} ₺
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenKeypad('price', item.id)}
                        >
                          <CalculateIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Box>

            {/* Toplam ve Ödeme */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">Ara Toplam</Typography>
                  <Typography variant="h6">{total.toFixed(2)} ₺</Typography>
                </Stack>

                {discountedTotal > 0 && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" color="error">İndirimli Toplam</Typography>
                    <Typography variant="h6" color="error">{discountedTotal.toFixed(2)} ₺</Typography>
                  </Stack>
                )}

                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DiscountIcon />}
                    onClick={() => setIsDiscountModalOpen(true)}
                    disabled={cart.length === 0}
                  >
                    İndirim Uygula
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ReceiptIcon />}
                    disabled={cart.length === 0}
                    onClick={handlePayment}
                  >
                    Ödeme Al
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Müşteri Seçim Modalı */}
      <CustomerSelectModal
        open={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        onSelect={handleSelectCustomer}
        selectedCustomerId={selectedCustomer?.id}
      />

      {/* Sayısal Tuş Takımı Modalı */}
      <NumericKeypadModal
        open={isKeypadOpen}
        onClose={handleCloseKeypad}
        onSubmit={handleKeypadSubmit}
        title={
          keypadMode === 'quantity' ? 'Miktar Gir' :
          keypadMode === 'price' ? 'Fiyat Gir' :
          'Barkod Gir'
        }
        label={
          keypadMode === 'quantity' ? 'Ürün Miktarı' :
          keypadMode === 'price' ? 'Ürün Fiyatı' :
          'Barkod'
        }
        initialValue={
          keypadMode === 'quantity' && selectedItemId
            ? cart.find(item => item.id === selectedItemId)?.quantity.toString() || '0'
            : keypadMode === 'price' && selectedItemId
            ? cart.find(item => item.id === selectedItemId)?.price.toString() || '0'
            : '0'
        }
        maxLength={keypadMode === 'barcode' ? 13 : 10}
        allowDecimal={keypadMode === 'price'}
      />

      {/* İndirim Modal */}
      <Dialog open={isDiscountModalOpen} onClose={handleCloseDiscountModal}>
        <DialogTitle>İndirim Uygula</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2, minWidth: 300 }}>
            <FormControl fullWidth>
              <InputLabel>İndirim Türü</InputLabel>
              <Select
                value={discountType}
                label="İndirim Türü"
                onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'AMOUNT')}
              >
                <MenuItem value="PERCENTAGE">Yüzde (%)</MenuItem>
                <MenuItem value="AMOUNT">Tutar (₺)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={discountType === 'PERCENTAGE' ? 'İndirim Yüzdesi' : 'İndirim Tutarı'}
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              InputProps={{
                endAdornment: <Typography>{discountType === 'PERCENTAGE' ? '%' : '₺'}</Typography>
              }}
            />

            {discountValue && (
              <Typography variant="body2" color="text.secondary">
                İndirim Tutarı: {calculateDiscount().toFixed(2)} ₺
                <br />
                İndirimli Toplam: {(total - calculateDiscount()).toFixed(2)} ₺
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDiscountModal}>İptal</Button>
          <Button 
            onClick={handleApplyDiscount}
            variant="contained"
            disabled={!discountValue || parseFloat(discountValue) <= 0}
          >
            Uygula
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuickSalePage; 