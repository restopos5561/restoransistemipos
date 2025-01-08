import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Divider,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Services
import ordersService from '../../services/orders.service';
import paymentService from '../../services/payment.service';

// Types
interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: {
    id: string;
    product: {
      name: string;
      price: number;
    };
    quantity: number;
    totalPrice: number;
    notes?: string;
  }[];
  payment?: {
    id: string;
    amount: number;
    paymentMethod: 'CASH' | 'CREDIT_CARD' | 'MEAL_CARD';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    createdAt: string;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'CASH' | 'CREDIT_CARD' | 'MEAL_CARD';
  icon?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', name: 'Nakit', type: 'CASH' },
  { id: 'credit_card', name: 'Kredi Kartı', type: 'CREDIT_CARD' },
  { id: 'meal_card', name: 'Yemek Kartı', type: 'MEAL_CARD' },
];

const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  
  // Ödeme formu state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod['type']>('CASH');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [changeAmount, setChangeAmount] = useState<number>(0);
  
  // Kredi kartı dialog
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');

  // Sipariş detaylarını getir
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await ordersService.getOrderById(id!);
        setOrder(data);
        
        // Varsayılan ödeme tutarını ayarla
        setReceivedAmount(data.totalAmount.toString());
      } catch (error) {
        console.error('Sipariş detayları yüklenirken hata oluştu:', error);
        setError('Sipariş detayları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  // Para üstü hesapla
  useEffect(() => {
    if (selectedMethod === 'CASH' && order) {
      const received = parseFloat(receivedAmount) || 0;
      setChangeAmount(Math.max(0, received - order.totalAmount));
    } else {
      setChangeAmount(0);
    }
  }, [receivedAmount, selectedMethod, order]);

  // Ödeme yöntemi değiştiğinde
  const handleMethodChange = (method: PaymentMethod['type']) => {
    setSelectedMethod(method);
    if (method === 'CASH') {
      setReceivedAmount(order?.totalAmount.toString() || '');
    } else {
      setReceivedAmount('');
      setChangeAmount(0);
    }
  };

  // Kredi kartı ile ödeme
  const handleCardPayment = async () => {
    try {
      setProcessing(true);
      
      if (!profile?.branchId) {
        setError('Şube bilgisi bulunamadı.');
        return;
      }

      // Kart bilgilerini doğrula
      if (!cardNumber || !expiryDate || !cvv) {
        setError('Lütfen tüm kart bilgilerini girin.');
        return;
      }

      // Ödeme işlemini gerçekleştir
      await paymentService.processCardPayment({
        orderId: id!,
        branchId: profile.branchId.toString(),
        amount: order!.totalAmount,
        cardNumber,
        expiryDate,
        cvv
      });

      // Başarılı ödeme sonrası
      setCardDialogOpen(false);
      navigate(`/orders/${id}`);
    } catch (error) {
      console.error('Kredi kartı ödemesi sırasında hata oluştu:', error);
      setError('Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setProcessing(false);
    }
  };

  // Nakit ödeme
  const handleCashPayment = async () => {
    try {
      setProcessing(true);
      
      if (!profile?.branchId) {
        setError('Şube bilgisi bulunamadı.');
        return;
      }

      const received = parseFloat(receivedAmount);
      if (isNaN(received) || received < order!.totalAmount) {
        setError('Geçersiz ödeme tutarı.');
        return;
      }

      await paymentService.processCashPayment({
        orderId: id!,
        branchId: profile.branchId.toString(),
        amount: order!.totalAmount,
        receivedAmount: received,
        changeAmount
      });

      navigate(`/orders/${id}`);
    } catch (error) {
      console.error('Nakit ödeme sırasında hata oluştu:', error);
      setError('Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setProcessing(false);
    }
  };

  // Yemek kartı ile ödeme
  const handleMealCardPayment = async () => {
    try {
      setProcessing(true);
      
      if (!profile?.branchId) {
        setError('Şube bilgisi bulunamadı.');
        return;
      }

      await paymentService.processMealCardPayment({
        orderId: id!,
        branchId: profile.branchId.toString(),
        amount: order!.totalAmount
      });

      navigate(`/orders/${id}`);
    } catch (error) {
      console.error('Yemek kartı ödemesi sırasında hata oluştu:', error);
      setError('Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setProcessing(false);
    }
  };

  // Ödeme işlemini başlat
  const handlePayment = async () => {
    switch (selectedMethod) {
      case 'CREDIT_CARD':
        setCardDialogOpen(true);
        break;
      case 'CASH':
        await handleCashPayment();
        break;
      case 'MEAL_CARD':
        await handleMealCardPayment();
        break;
    }
  };

  if (loading || !order) {
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
          Ödeme - Sipariş #{order.orderNumber}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => navigate(`/orders/${id}`)}
          >
            İptal
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReceiptIcon />}
            onClick={() => {/* Fiş yazdırma */}}
          >
            Fiş
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Sipariş Detayları */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sipariş Detayları
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ürün</TableCell>
                    <TableCell align="right">Adet</TableCell>
                    <TableCell align="right">Birim Fiyat</TableCell>
                    <TableCell align="right">Toplam</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">Toplam Tutar</Typography>
                <Typography variant="h6">{order.totalAmount.toFixed(2)} ₺</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* Ödeme Formu */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ödeme
            </Typography>

            <Stack spacing={3}>
              {/* Ödeme Yöntemi Seçimi */}
              <FormControl>
                <Typography variant="subtitle2" gutterBottom>
                  Ödeme Yöntemi
                </Typography>
                <RadioGroup
                  value={selectedMethod}
                  onChange={(e) => handleMethodChange(e.target.value as PaymentMethod['type'])}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <FormControlLabel
                      key={method.id}
                      value={method.type}
                      control={<Radio />}
                      label={method.name}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              {/* Nakit Ödeme Formu */}
              {selectedMethod === 'CASH' && (
                <Stack spacing={2}>
                  <TextField
                    label="Alınan Tutar"
                    type="number"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    InputProps={{
                      endAdornment: <Typography>₺</Typography>
                    }}
                  />
                  {changeAmount > 0 && (
                    <Alert severity="info">
                      Para Üstü: {changeAmount.toFixed(2)} ₺
                    </Alert>
                  )}
                </Stack>
              )}

              <Button
                variant="contained"
                size="large"
                startIcon={<PaymentIcon />}
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? <CircularProgress size={24} /> : 'Ödemeyi Tamamla'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Kredi Kartı Dialog */}
      <Dialog open={cardDialogOpen} onClose={() => setCardDialogOpen(false)}>
        <DialogTitle>Kredi Kartı ile Ödeme</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2, minWidth: 400 }}>
            <TextField
              label="Kart Numarası"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              inputProps={{ maxLength: 16 }}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Son Kullanma Tarihi"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                inputProps={{ maxLength: 5 }}
              />
              <TextField
                label="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                inputProps={{ maxLength: 3 }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCardDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleCardPayment}
            variant="contained"
            disabled={processing}
          >
            {processing ? <CircularProgress size={24} /> : 'Öde'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentPage; 