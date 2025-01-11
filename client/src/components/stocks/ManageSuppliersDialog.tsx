import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Stock } from '@/types/stock.types';
import { Supplier } from '@/types/supplier.types';
import suppliersService from '@/services/suppliers.service';
import { useSnackbar } from 'notistack';

interface ManageSuppliersDialogProps {
  open: boolean;
  onClose: () => void;
  stock: Stock | null;
}

const ManageSuppliersDialog: React.FC<ManageSuppliersDialogProps> = ({
  open,
  onClose,
  stock,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [supplierProductCode, setSupplierProductCode] = useState<string>('');
  const [lastPurchasePrice, setLastPurchasePrice] = useState<string>('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open && stock) {
      loadSuppliers();
      reloadSuppliers();
    }
  }, [open, stock]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Mevcut ürün tedarikçileri:', stock?.product.suppliers);
      const response = await suppliersService.getSuppliers();
      console.log('Backend tedarikçi yanıtı:', response);
      setSuppliers(response.suppliers || []);
    } catch (err) {
      setError('Tedarikçiler yüklenirken bir hata oluştu');
      console.error('Tedarikçi yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const reloadSuppliers = async () => {
    if (!stock) return;
    
    try {
      const productSuppliers = await suppliersService.getSuppliersByProduct(stock.productId);
      console.log('Ürünün tedarikçileri:', productSuppliers);
      
      // Stock nesnesini güncelle
      if (stock.product) {
        stock.product.suppliers = productSuppliers;
      }
      
    } catch (err) {
      console.error('Ürün tedarikçileri yüklenirken hata:', err);
      setError('Tedarikçiler yüklenirken bir hata oluştu');
    }
  };

  const handleAddSupplier = async () => {
    if (!stock || !selectedSupplierId) return;

    try {
      setLoading(true);
      setError(null);

      // Önce mevcut ilişkiyi kontrol et
      const existingSuppliers = stock.product.suppliers || [];
      const alreadyExists = existingSuppliers.some(
        ps => ps.supplierId === Number(selectedSupplierId)
      );

      if (alreadyExists) {
        setError('Bu tedarikçi zaten eklenmiş');
        return;
      }

      await suppliersService.addProduct(Number(selectedSupplierId), {
        productId: stock.productId,
        supplierProductCode,
        lastPurchasePrice: lastPurchasePrice ? Number(lastPurchasePrice) : undefined,
      });

      enqueueSnackbar('Tedarikçi başarıyla eklendi', { variant: 'success' });
      
      // Form'u temizle
      setSelectedSupplierId('');
      setSupplierProductCode('');
      setLastPurchasePrice('');
      
      // Tedarikçi listelerini yenile
      await Promise.all([
        loadSuppliers(),
        reloadSuppliers()
      ]);

    } catch (err) {
      setError('Tedarikçi eklenirken bir hata oluştu');
      console.error('Tedarikçi ekleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSupplier = async (supplierId: number) => {
    if (!stock) return;

    try {
      setLoading(true);
      setError(null);

      // TODO: Implement remove supplier functionality
      // await suppliersService.removeProduct(supplierId, stock.productId);

      enqueueSnackbar('Tedarikçi başarıyla kaldırıldı', { variant: 'success' });
      loadSuppliers();
    } catch (err) {
      setError('Tedarikçi kaldırılırken bir hata oluştu');
      console.error('Tedarikçi kaldırma hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!stock) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Tedarikçi Yönetimi - {stock.product.name}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Yeni Tedarikçi Ekle
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <FormControl fullWidth>
              <InputLabel>Tedarikçi</InputLabel>
              <Select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                label="Tedarikçi"
              >
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Tedarikçi Ürün Kodu"
              value={supplierProductCode}
              onChange={(e) => setSupplierProductCode(e.target.value)}
            />
            <TextField
              label="Son Alış Fiyatı"
              type="number"
              value={lastPurchasePrice}
              onChange={(e) => setLastPurchasePrice(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSupplier}
              disabled={loading || !selectedSupplierId}
            >
              Ekle
            </Button>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom>
          Mevcut Tedarikçiler
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tedarikçi Adı</TableCell>
                <TableCell>Ürün Kodu</TableCell>
                <TableCell align="right">Son Alış Fiyatı</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stock?.product.suppliers && stock.product.suppliers.length > 0 ? (
                stock.product.suppliers.map((ps) => (
                  <TableRow key={ps.supplierId}>
                    <TableCell>{ps.supplier.name}</TableCell>
                    <TableCell>{ps.supplierProductCode || '-'}</TableCell>
                    <TableCell align="right">
                      {ps.lastPurchasePrice ? `₺${ps.lastPurchasePrice}` : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveSupplier(ps.supplierId)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Henüz tedarikçi eklenmemiş
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageSuppliersDialog; 