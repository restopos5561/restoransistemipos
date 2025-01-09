import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Description as DescriptionIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import stockService from '@/services/stock.service';
import { Stock } from '@/types/stock.types';
import { formatDate } from '@/lib/utils';
import { useSnackbar } from 'notistack';

const StocksPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalStock: 0,
    lowStock: 0,
    expiringStock: 0,
  });
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await stockService.getStocks();
      setStocks(response.data.stocks);

      // İstatistikleri hesapla
      const lowStockCount = response.data.stocks.filter(
        (stock) => stock.lowStockThreshold && stock.quantity <= stock.lowStockThreshold
      ).length;

      const expiringStockResponse = await stockService.getExpiringStock(30);
      
      setStats({
        totalStock: response.data.total,
        lowStock: lowStockCount,
        expiringStock: expiringStockResponse.data.total,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stoklar yüklenirken bir hata oluştu';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleUpdateQuantity = (stock: Stock) => {
    // TODO: Implement quantity update dialog
    console.log('Update quantity:', stock);
  };

  const handleEdit = (stock: Stock) => {
    // TODO: Implement edit dialog
    console.log('Edit stock:', stock);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>Stok Yönetimi</Typography>
            <Typography variant="body1" color="text.secondary">
              Stok durumunuzu görüntüleyin ve yönetin.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<SwapHorizIcon />}
              onClick={() => console.log('Transfer')}
            >
              Transfer
            </Button>
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon />}
              onClick={() => console.log('Sayım')}
            >
              Sayım
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => console.log('Yeni')}
            >
              Yeni Stok
            </Button>
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">Toplam Stok</Typography>
              <Typography variant="h4">{stats.totalStock}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">Düşük Stok</Typography>
              <Typography variant="h4" color="error.main">{stats.lowStock}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">S.K.T. Yaklaşan</Typography>
              <Typography variant="h4" color="warning.main">{stats.expiringStock}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Stock List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ürün Adı</TableCell>
              <TableCell>Miktar</TableCell>
              <TableCell>Birim</TableCell>
              <TableCell>Alt Limit</TableCell>
              <TableCell>Son Güncelleme</TableCell>
              <TableCell>Son Kullanma</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocks.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell>{stock.product.name}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{stock.quantity}</span>
                    {stock.lowStockThreshold && stock.quantity <= stock.lowStockThreshold && (
                      <Chip
                        label="Düşük Stok"
                        color="error"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>{stock.product.unit}</TableCell>
                <TableCell>{stock.lowStockThreshold || '-'}</TableCell>
                <TableCell>{formatDate(stock.lastStockUpdate)}</TableCell>
                <TableCell>
                  {stock.expirationDate ? formatDate(stock.expirationDate) : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleUpdateQuantity(stock)}
                    title="Stok Ekle/Çıkar"
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(stock)}
                    title="Düzenle"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StocksPage; 