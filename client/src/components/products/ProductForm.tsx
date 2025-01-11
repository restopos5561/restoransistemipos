import React, { useState } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Box,
  Alert,
  IconButton,
  Avatar,
  FormControl,
  FormLabel,
  Input,
  Select,
  InputAdornment,
} from '@mui/material';
import { PhotoCamera, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import categoriesService from '../../services/categories.service';
import productsService from '../../services/products.service';
import Loading from '../common/Loading/Loading';
import { Product } from '../../types/product.types';
import { compressImage } from '../../utils/imageUtils';

interface FormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  preparationTime: string;
  stockTracking: boolean;
  stockQuantity: string;
  isActive: boolean;
  image: string | null;
  unit: string;
  taxRate: string;
}

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);

  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    categoryId: initialData?.categoryId?.toString() || '',
    preparationTime: initialData?.preparationTime?.toString() || '',
    stockTracking: initialData?.stockTracking || false,
    stockQuantity: initialData?.stocks?.[0]?.quantity?.toString() || '',
    isActive: initialData?.isActive ?? true,
    image: initialData?.image || null,
    unit: initialData?.unit || '',
    taxRate: initialData?.taxRate?.toString() || '',
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const restaurantId = localStorage.getItem('restaurantId');
        console.log('ProductForm - Fetching categories with restaurantId:', restaurantId);
        const result = await categoriesService.getCategories({
          restaurantId: Number(restaurantId)
        });
        console.log('ProductForm - Categories result:', result);
        if (!result || !Array.isArray(result)) {
          console.error('ProductForm - Invalid categories response:', result);
          return [];
        }
        return result;
      } catch (error) {
        console.error('ProductForm - Error fetching categories:', error);
        return [];
      }
    }
  });

  const handleChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value =
      event.target.type === 'checkbox'
        ? (event.target as HTMLInputElement).checked
        : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64String = await compressImage(file);
      setImagePreview(base64String);
      setFormData(prev => ({ ...prev, image: base64String }));
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      toast.error('Resim yüklenirken bir hata oluştu');
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: null }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : undefined,
        stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : undefined,
        taxRate: formData.taxRate ? parseFloat(formData.taxRate) : undefined,
      };

      await onSubmit(productData);
    } catch (error: any) {
      console.error('Form gönderim hatası:', error);
      setError(error.response?.data?.message || 'Bir hata oluştu');
      toast.error('İşlem sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const units = ["Adet", "Kg", "Gr", "Lt", "Ml", "Porsiyon"];

  if (categoriesLoading) {
    return <Loading />;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {imagePreview ? (
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={imagePreview?.startsWith('data:') ? imagePreview : `http://localhost:3002${imagePreview}`}
                  alt="Ürün resmi"
                  sx={{ width: 100, height: 100 }}
                  variant="rounded"
                />
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <input
                  accept="image/*"
                  type="file"
                  id="image-upload"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload">
                  <IconButton component="span" color="primary">
                    <PhotoCamera />
                  </IconButton>
                </label>
              </Box>
            )}
            <Box>
              <Button
                component="label"
                htmlFor="image-upload"
                variant="outlined"
                startIcon={<PhotoCamera />}
              >
                {imagePreview ? 'Resmi Değiştir' : 'Resim Yükle'}
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Ürün Adı"
            name="name"
            value={formData.name}
            onChange={handleChange('name')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            required
            label="Kategori"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange('categoryId')}
            disabled={categoriesLoading}
          >
            <MenuItem value="">Seçiniz</MenuItem>
            {categories?.map((category: { id: number; name: string }) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            )) || []}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            required
            label="Birim"
            name="unit"
            value={formData.unit}
            onChange={handleChange('unit')}
          >
            {units.map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            label="Fiyat"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange('price')}
            InputProps={{
              startAdornment: <InputAdornment position="start">₺</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Vergi Oranı (%)"
            name="taxRate"
            type="number"
            value={formData.taxRate}
            onChange={handleChange('taxRate')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Hazırlama Süresi (dakika)"
            name="preparationTime"
            value={formData.preparationTime}
            onChange={handleChange('preparationTime')}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Açıklama"
            name="description"
            value={formData.description}
            onChange={handleChange('description')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.stockTracking}
                onChange={handleChange('stockTracking')}
                name="stockTracking"
              />
            }
            label="Stok Takibi"
          />
        </Grid>

        {formData.stockTracking && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Stok Miktarı"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange('stockQuantity')}
              inputProps={{ min: 0 }}
            />
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleChange('isActive')}
                name="isActive"
              />
            }
            label="Aktif"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel} variant="outlined">
              İptal
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {initialData ? 'Güncelle' : 'Oluştur'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProductForm; 