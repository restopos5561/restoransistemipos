import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import productsService from '../../services/products.service';
import { formatCurrency } from '../../utils/format';
import Loading from '../common/Loading/Loading';
import { ProductVariant, ProductVariantInput } from '../../types/product.types';

interface ProductVariantsProps {
  productId: number;
}

interface VariantFormData {
  name: string;
  value: string;
  priceAdjustment?: number;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({ productId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [formData, setFormData] = useState<VariantFormData>({
    name: '',
    value: '',
    priceAdjustment: 0,
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['product-variants', productId],
    queryFn: () => productsService.getProductVariants(productId),
  });

  const addMutation = useMutation({
    mutationFn: (data: ProductVariantInput) => productsService.addProductVariant(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
      toast.success('Varyant başarıyla eklendi');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Varyant eklenirken bir hata oluştu');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ variantId, data }: { variantId: number; data: ProductVariantInput }) =>
      productsService.updateProductVariant(productId, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
      toast.success('Varyant başarıyla güncellendi');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Varyant güncellenirken bir hata oluştu');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (variantId: number) => productsService.deleteProductVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', productId] });
      toast.success('Varyant başarıyla silindi');
    },
    onError: () => {
      toast.error('Varyant silinirken bir hata oluştu');
    },
  });

  const handleOpenDialog = (variant?: ProductVariant) => {
    if (variant) {
      setSelectedVariant(variant);
      setFormData({
        name: variant.name,
        value: variant.value,
        priceAdjustment: variant.priceAdjustment,
      });
    } else {
      setSelectedVariant(null);
      setFormData({
        name: '',
        value: '',
        priceAdjustment: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedVariant(null);
    setFormData({
      name: '',
      value: '',
      priceAdjustment: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVariant) {
      updateMutation.mutate({
        variantId: selectedVariant.id,
        data: formData,
      });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleDelete = (variantId: number) => {
    if (window.confirm('Bu varyantı silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(variantId);
    }
  };

  if (isLoading) return <Loading />;

  const variants = data?.data || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Varyantlar</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Varyant
        </Button>
      </Box>

      {variants.length === 0 ? (
        <Typography color="text.secondary" align="center">
          Henüz varyant eklenmemiş.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>İsim</TableCell>
                <TableCell>Değer</TableCell>
                <TableCell align="right">Fiyat Farkı</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {variants.map((variant: ProductVariant) => (
                <TableRow key={variant.id}>
                  <TableCell>{variant.name}</TableCell>
                  <TableCell>{variant.value}</TableCell>
                  <TableCell align="right">
                    {variant.priceAdjustment ? formatCurrency(variant.priceAdjustment) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(variant)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(variant.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        aria-labelledby="variant-dialog-title"
        disablePortal
        keepMounted={false}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle id="variant-dialog-title">
            {selectedVariant ? 'Varyant Düzenle' : 'Yeni Varyant'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Varyant Adı"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoFocus
              />
              <TextField
                fullWidth
                label="Değer"
                name="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
              />
              <TextField
                fullWidth
                type="number"
                label="Fiyat Farkı"
                name="priceAdjustment"
                value={formData.priceAdjustment}
                onChange={(e) =>
                  setFormData({ ...formData, priceAdjustment: parseFloat(e.target.value) || 0 })
                }
                inputProps={{ step: 0.01 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} tabIndex={0}>İptal</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={addMutation.isPending || updateMutation.isPending}
              tabIndex={0}
            >
              {addMutation.isPending || updateMutation.isPending
                ? 'Kaydediliyor...'
                : 'Kaydet'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ProductVariants; 