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
  CircularProgress,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Description as DescriptionIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import stockService from '@/services/stock.service';
import { Stock, UpdateStockQuantityInput, TransferStockInput, StockCountInput, StockFilters } from '@/types/stock.types';
import { formatDate } from '@/lib/utils';
import { useSnackbar } from 'notistack';
import UpdateStockDialog from '@/components/stocks/UpdateStockDialog';
import TransferStockDialog from '@/components/stocks/TransferStockDialog';
import StockCountDialog from '@/components/stocks/StockCountDialog';
import ManageSuppliersDialog from '@/components/stocks/ManageSuppliersDialog';
import StockFiltersComponent from '@/components/stocks/StockFilters';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { SOCKET_EVENTS } from '@/constants/socketEvents';
import { toast } from 'react-toastify';

const StocksPage = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [countDialogOpen, setCountDialogOpen] = useState(false);
  const [suppliersDialogOpen, setSuppliersDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [currentBranchId, setCurrentBranchId] = useState<number>(0);
  const [filters, setFilters] = useState<StockFilters>({
    branchId: 0,
    page: 1,
    limit: 10,
  });
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { on } = useSocket();

  useEffect(() => {
    const branchId = localStorage.getItem('branchId');
    console.log('localStorage branchId:', branchId);
    
    if (!branchId) {
      setError('Geçerli şube bilgisi bulunamadı. Lütfen şube seçin.');
      return;
    }

    const parsedBranchId = Number(branchId);
    if (isNaN(parsedBranchId) || parsedBranchId <= 0) {
      setError('Geçersiz şube bilgisi. Lütfen şube seçin.');
      return;
    }

    setCurrentBranchId(parsedBranchId);
    setFilters(prev => ({ ...prev, branchId: parsedBranchId }));
  }, []);

  const fetchStocks = async () => {
    try {
      if (!currentBranchId) {
        setError('Geçerli şube bilgisi bulunamadı');
        return;
      }

      setLoading(true);
      setError(null);
      const response = await stockService.getStocks(filters);
      console.log('StocksPage response:', JSON.stringify(response, null, 2));
      setStocks(response.data.stocks);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stoklar yüklenirken bir hata oluştu';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentBranchId) {
      fetchStocks();
    }
  }, [currentBranchId, filters]);

  const handleFiltersChange = (newFilters: StockFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handleUpdateQuantity = (stock: Stock) => {
    setSelectedStock(stock);
    setUpdateDialogOpen(true);
  };

  const handleTransferClick = (stock: Stock) => {
    setSelectedStock(stock);
    setTransferDialogOpen(true);
  };

  const handleManageSuppliers = (stock: Stock) => {
    setSelectedStock(stock);
    setSuppliersDialogOpen(true);
  };

  const handleUpdateStock = async (id: number, data: UpdateStockQuantityInput) => {
    try {
      await stockService.updateStockQuantity(id, data);
      enqueueSnackbar('Stok başarıyla güncellendi', { variant: 'success' });
      fetchStocks();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stok güncellenirken bir hata oluştu';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleTransferStock = async (data: TransferStockInput) => {
    try {
      await stockService.transferStock(data);
      enqueueSnackbar('Stok transferi başarıyla gerçekleşti', { variant: 'success' });
      fetchStocks();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stok transferi sırasında bir hata oluştu';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleStockCount = async (data: StockCountInput) => {
    try {
      const result = await stockService.countStock(data);
      
      if (!result?.success) {
        throw new Error('Sayım işlemi başarısız oldu');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stok sayımı sırasında bir hata oluştu';
      enqueueSnackbar(message, { variant: 'error' });
      throw err;
    }
  };

  // Socket event dinleyicileri
  useEffect(() => {
    if (!user?.branchId) return;

    // Stok miktarı değiştiğinde
    const handleStockQuantityChanged = (data: any) => {
      console.log('🔌 [Stock] Stok miktarı değişti:', data);
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      toast.info(`${data.productName} stok miktarı güncellendi`);
    };

    // Stok transferi olduğunda
    const handleStockTransfer = (data: any) => {
      console.log('🔌 [Stock] Stok transferi:', data);
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      
      const message = data.type === 'IN' 
        ? `${data.productName} ürününden ${data.quantity} adet transfer alındı`
        : `${data.productName} ürününden ${data.quantity} adet transfer gönderildi`;
      
      toast.info(message);
    };

    // Stok uyarısı geldiğinde
    const handleStockAlert = (data: any) => {
      console.log('🔌 [Stock] Stok uyarısı:', data);
      toast.warning(`${data.productName} stok seviyesi kritik: ${data.currentQuantity}`);
    };

    // Genel stok güncellemesi
    const handleStockUpdated = (data: any) => {
      console.log('🔌 [Stock] Stok güncellendi:', data);
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    };

    // Event dinleyicilerini ekle
    const unsubscribeQuantity = on(SOCKET_EVENTS.STOCK_QUANTITY_CHANGED, handleStockQuantityChanged);
    const unsubscribeTransfer = on(SOCKET_EVENTS.STOCK_TRANSFER, handleStockTransfer);
    const unsubscribeAlert = on(SOCKET_EVENTS.STOCK_ALERT, handleStockAlert);
    const unsubscribeUpdate = on(SOCKET_EVENTS.STOCK_UPDATED, handleStockUpdated);

    // Cleanup
    return () => {
      unsubscribeQuantity?.();
      unsubscribeTransfer?.();
      unsubscribeAlert?.();
      unsubscribeUpdate?.();
    };
  }, [on, queryClient, user?.branchId]);

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
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          '& .MuiButton-root': {
            transition: theme.transitions.create(['background-color', 'box-shadow']),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            }
          }
        }}>
          <Box>
            <Typography variant="h4" sx={{ mb: 1, color: theme.palette.text.primary, fontWeight: theme.typography.fontWeightBold }}>
              Stok Yönetimi
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              Stok durumunuzu görüntüleyin ve yönetin.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DescriptionIcon />}
              onClick={() => setCountDialogOpen(true)}
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

        <StockFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ürün Adı</TableCell>
              <TableCell>Miktar</TableCell>
              <TableCell>Birim</TableCell>
              <TableCell>Alt Limit</TableCell>
              <TableCell>Tedarikçi</TableCell>
              <TableCell>Son Güncelleme</TableCell>
              <TableCell>Son Kullanma</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocks.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell>{stock.product.name}</TableCell>
                <TableCell>
                  <Typography>
                    {stock.quantity}
                  </Typography>
                </TableCell>
                <TableCell>{stock.product?.unit || "-"}</TableCell>
                <TableCell>{stock.lowStockThreshold || '-'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {stock.product.productSuppliers?.map((ps) => (
                      <Chip 
                        key={ps.supplierId}
                        label={ps.supplier.name}
                        size="small"
                        variant={ps.isPrimary ? "filled" : "outlined"}
                        color={ps.isPrimary ? "primary" : "default"}
                      />
                    )) || '-'}
                  </Box>
                </TableCell>
                <TableCell>{formatDate(stock.lastStockUpdate)}</TableCell>
                <TableCell>
                  {stock.expirationDate ? (
                    formatDate(stock.expirationDate)
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleUpdateQuantity(stock)}
                    >
                      Güncelle
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SwapHorizIcon />}
                      onClick={() => handleTransferClick(stock)}
                    >
                      Transfer
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleManageSuppliers(stock)}
                    >
                      Tedarikçiler
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <UpdateStockDialog
        open={updateDialogOpen}
        onClose={() => {
          setUpdateDialogOpen(false);
          setSelectedStock(null);
        }}
        stock={selectedStock}
        onUpdate={handleUpdateStock}
      />

      <TransferStockDialog
        open={transferDialogOpen}
        onClose={() => {
          setTransferDialogOpen(false);
          setSelectedStock(null);
        }}
        onTransfer={handleTransferStock}
        currentBranchId={currentBranchId}
        productId={selectedStock?.productId || 0}
      />

      {countDialogOpen && (
        <StockCountDialog
          open={countDialogOpen}
          onClose={() => setCountDialogOpen(false)}
          onSubmit={handleStockCount}
          stocks={stocks}
          currentBranchId={currentBranchId}
          fetchStocks={fetchStocks}
        />
      )}

      <ManageSuppliersDialog
        open={suppliersDialogOpen}
        onClose={() => {
          setSuppliersDialogOpen(false);
          setSelectedStock(null);
        }}
        stock={selectedStock}
        onUpdate={fetchStocks}
      />
    </Box>
  );
};

export default StocksPage; 