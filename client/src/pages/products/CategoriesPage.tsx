import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import categoriesService from '../../services/categories.service';
import { useConfirm } from '../../hooks/useConfirm';
import { toast } from 'react-toastify';
import { useLoadingStore } from '../../store/loading/loadingStore';

interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const confirm = useConfirm();
  const setLoading = useLoadingStore((state) => state.setLoading);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message || 'Kategoriler yüklenirken bir hata oluştu');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpen = (category?: any) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        isActive: category.isActive,
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: '',
        description: '',
        isActive: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (selectedCategory) {
        await categoriesService.updateCategory(selectedCategory.id, formData);
        toast.success('Kategori başarıyla güncellendi');
      } else {
        await categoriesService.createCategory(formData);
        toast.success('Kategori başarıyla oluşturuldu');
      }
      handleClose();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const productCount = category._count?.products ?? 0;
    if (productCount > 0) {
      toast.error('Bu kategoride ürünler var. Önce ürünleri silmelisiniz.');
      return;
    }

    try {
      const confirmed = await confirm({
        title: 'Kategori Silinecek',
        message: 'Bu kategoriyi silmek istediğinizden emin misiniz?',
        confirmText: 'Evet, Sil',
        cancelText: 'İptal',
      });

      if (confirmed) {
        setLoading(true);
        const result = await categoriesService.deleteCategory(category.id);
        if (result) {
          toast.success('Kategori başarıyla silindi');
          await fetchCategories();
        }
      }
    } catch (error: any) {
      console.error('Silme hatası:', error);
      toast.error(error.message || 'Kategori silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Kategori Yönetimi
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Yeni Kategori
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kategori Adı</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>Ürün Sayısı</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description || '-'}</TableCell>
                <TableCell>{category._count?.products || 0}</TableCell>
                <TableCell>{category.isActive ? 'Aktif' : 'Pasif'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(category)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(category)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Kategori Adı"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Aktif"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedCategory ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
      <confirm.ConfirmationDialog />
    </Container>
  );
};

export default CategoriesPage; 