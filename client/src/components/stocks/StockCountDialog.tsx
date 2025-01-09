import React, { useState, useEffect } from 'react';
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

interface StockCountDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StockCountInput) => void;
  stocks: Stock[];
  currentBranchId: number;
}

const StockCountDialog: React.FC<StockCountDialogProps> = ({
  open,
  onClose,
  onSubmit,
  stocks,
  currentBranchId,
}) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countedStocks, setCountedStocks] = useState<Record<number, string>>({});

  useEffect(() => {
    if (open) {
      setCountedStocks({});
      setError(null);
    }
  }, [open]);

  const handleQuantityChange = (stockId: number, value: string) => {
    setCountedStocks((prev) => ({
      ...prev,
      [stockId]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!profile?.id) {
      setError('Oturum bilgisi bulunamadı');
      return;
    }

    if (!currentBranchId) {
      setError('Şube bilgisi bulunamadı');
      return;
    }

    const products = Object.entries(countedStocks).map(([stockId, quantity]) => {
      const stock = stocks.find((s) => s.id === Number(stockId));
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
      setError('En az bir ürün için sayım yapmalısınız');
      return;
    }

    try {
      const stockCountData: StockCountInput = {
        branchId: currentBranchId,
        countedBy: profile.id,
        countedDate: new Date().toISOString(),
        products,
      };

      onSubmit(stockCountData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Stok Sayımı</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Lütfen her ürün için sayım sonucunda bulunan miktarı girin.
                Boş bırakılan ürünler sayıma dahil edilmeyecektir.
              </Typography>

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
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Sayımı Kaydet
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StockCountDialog; 