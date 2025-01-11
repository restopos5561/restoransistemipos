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
  DialogContentText,
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
  onUpdate?: () => void;
}

const ManageSuppliersDialog: React.FC<ManageSuppliersDialogProps> = ({
  open,
  onClose,
  stock,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [productSuppliers, setProductSuppliers] = useState<any[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [supplierProductCode, setSupplierProductCode] = useState<string>('');
  const [lastPurchasePrice, setLastPurchasePrice] = useState<string>('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Tüm tedarikçileri ve ürün tedarikçilerini yükle
  const loadAllData = async () => {
    if (!stock) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Her iki isteği paralel olarak yap
      const [suppliersResponse, productSuppliersResponse] = await Promise.all([
        suppliersService.getSuppliers(),
        suppliersService.getSuppliersByProduct(stock.productId)
      ]);
      
      console.log('ManageSuppliersDialog loadAllData:', {
        suppliersResponse,
        productSuppliersResponse
      });
      
      setSuppliers(suppliersResponse.suppliers || []);
      setProductSuppliers(productSuppliersResponse || []);
      
    } catch (err) {
      setError('Tedarikçiler yüklenirken bir hata oluştu');
      console.error('Veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  // Modal açıldığında verileri yükle
  useEffect(() => {
    if (open && stock) {
      loadAllData();
    }
  }, [open, stock]);

  const handleAddSupplier = async () => {
    if (!stock || !selectedSupplierId) return;

    try {
      setLoading(true);
      setError(null);

      // Önce mevcut ilişkiyi kontrol et
      const alreadyExists = productSuppliers.some(
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
      
      // Verileri yeniden yükle
      await loadAllData();
      onUpdate?.();

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

      await suppliersService.removeProduct(stock.productId, supplierId);
      enqueueSnackbar('Tedarikçi başarıyla kaldırıldı', { variant: 'success' });
      
      // Verileri yeniden yükle
      await loadAllData();
      onUpdate?.();

    } catch (err) {
      setError('Tedarikçi kaldırılırken bir hata oluştu');
      console.error('Tedarikçi kaldırma hatası:', err);
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setSupplierToDelete(null);
    }
  };

  const handleDeleteClick = (supplierId: number) => {
    setSupplierToDelete(supplierId);
    setDeleteConfirmOpen(true);
  };

  if (!stock) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Tedarikçi Yönetimi - {stock?.product.name}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
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
                {productSuppliers.length > 0 ? (
                  productSuppliers.map((ps) => (
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
                          onClick={() => handleDeleteClick(ps.supplierId)}
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

      {/* Silme Onay Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setSupplierToDelete(null);
        }}
      >
        <DialogTitle>Tedarikçiyi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu tedarikçiyi ürünün tedarikçi listesinden kaldırmak istediğinize emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setSupplierToDelete(null);
            }}
          >
            İptal
          </Button>
          <Button
            onClick={() => supplierToDelete && handleRemoveSupplier(supplierToDelete)}
            color="error"
            disabled={loading}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageSuppliersDialog; 