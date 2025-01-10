import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Stock, StockCountInput } from '@/types/stock.types';
import { useAuth } from '@/hooks/useAuth';
import { useSnackbar } from 'notistack';

interface StockCountDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StockCountInput) => Promise<any>;
  stocks: Stock[];
  currentBranchId: number;
  fetchStocks: () => void;
}

const StockCountDialog: React.FC<StockCountDialogProps> = ({
  open,
  onClose,
  onSubmit,
  stocks,
  currentBranchId,
  fetchStocks,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countedStocks, setCountedStocks] = useState<Record<number, string>>({});
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleQuantityChange = (stockId: number, value: string) => {
    setCountedStocks(prev => ({
      ...prev,
      [stockId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const products = Object.entries(countedStocks).map(([stockId, quantity]) => {
        const stock = stocks.find(s => s.id === Number(stockId));
        if (!stock) throw new Error('Stok bulunamadı');

        const countedQuantity = Number(quantity);
        if (isNaN(countedQuantity) || countedQuantity < 0) {
          throw new Error(`${stock.product.name} için geçerli bir miktar girin`);
        }

        return {
          productId: stock.productId,
          countedQuantity,
          countedStockId: stock.id,
        };
      });

      if (products.length === 0) {
        throw new Error('En az bir ürün için sayım yapmalısınız');
      }

      const data = {
        branchId: currentBranchId,
        countedBy: user!.id,
        countedDate: new Date().toISOString(),
        products,
      };

      console.log('Sayım gönderiliyor:', data);
      const result = await onSubmit(data);
      console.log('API yanıtı:', result);

      if (!result || !result.success || !result.data) {
        throw new Error('Sayım raporu alınamadı');
      }

      console.log('Rapor verisi:', result.data);
      
      // API yanıtını kontrol et
      if (!Array.isArray(result.data.details)) {
        throw new Error('Rapor detayları alınamadı');
      }

      // State güncellemelerini sıralı yapıyoruz
      await Promise.all([
        new Promise<void>(resolve => {
          setReportData(result.data);
          resolve();
        }),
        new Promise<void>(resolve => {
          setShowReport(true);
          resolve();
        })
      ]);

      // Sadece başarı mesajı göster
      enqueueSnackbar('Stok sayımı başarıyla kaydedildi', { variant: 'success' });
    } catch (err) {
      console.error('Sayım hatası:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Önce stokları güncelle
      fetchStocks();
      
      // Sonra state'leri temizle
      setCountedStocks({});
      setError(null);
      setShowReport(false);
      setReportData(null);
      
      // En son dialog'u kapat
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={loading || showReport}
    >
      {showReport && reportData ? (
        <>
          <DialogTitle>Sayım Raporu</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Toplam {reportData.totalItems} ürün sayıldı
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {reportData.itemsWithDifference} üründe fark tespit edildi
              </Typography>
              {reportData.totalPositiveDifference > 0 && (
                <Typography variant="body2" color="success.main" gutterBottom>
                  Toplam {reportData.totalPositiveDifference} adet fazla
                </Typography>
              )}
              {reportData.totalNegativeDifference > 0 && (
                <Typography variant="body2" color="error.main" gutterBottom>
                  Toplam {reportData.totalNegativeDifference} adet eksik
                </Typography>
              )}
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ürün</TableCell>
                    <TableCell align="right">Sistem</TableCell>
                    <TableCell align="right">Sayım</TableCell>
                    <TableCell align="right">Fark</TableCell>
                    <TableCell>Birim</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.details.map((item: any, index: number) => (
                    <TableRow key={`stock-count-${index}`}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="right">{item.systemQuantity}</TableCell>
                      <TableCell align="right">{item.countedQuantity}</TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          color: item.difference > 0 
                            ? 'success.main' 
                            : item.difference < 0 
                            ? 'error.main' 
                            : 'text.primary'
                        }}
                      >
                        {item.difference > 0 ? '+' : ''}{item.difference}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Kapat</Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle>Stok Sayımı</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Lütfen her ürün için sayım sonucunda bulunan miktarı girin.
              Boş bırakılan ürünler sayıma dahil edilmeyecektir.
            </Typography>

            <form id="stockCountForm" onSubmit={handleSubmit}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ürün Adı</TableCell>
                      <TableCell>Mevcut Miktar</TableCell>
                      <TableCell>Birim</TableCell>
                      <TableCell>Sayım Miktarı</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stocks.map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell>{stock.product.name}</TableCell>
                        <TableCell>{stock.quantity}</TableCell>
                        <TableCell>{stock.product.unit}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={countedStocks[stock.id] || ''}
                            onChange={(e) => handleQuantityChange(stock.id, e.target.value)}
                            inputProps={{ min: 0, step: 0.01 }}
                            placeholder="Sayım miktarı"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>
              İptal
            </Button>
            <Button 
              form="stockCountForm"
              type="submit"
              variant="contained" 
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sayımı Kaydet'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default StockCountDialog; 