import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  IconButton,
  Avatar,
} from '@mui/material';
import { PhotoCamera, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import categoriesService from '../../services/categories.service';
import productsService from '../../services/products.service';
import Loading from '../../components/common/Loading/Loading';
import { compressImage } from '../../utils/imageUtils';

interface Category {
  id: number;
  name: string;
}

interface CategoryResponse {
  success: boolean;
  data: Category[];
}

const NewProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    preparationTime: '',
    stockTracking: false,
    stockQuantity: '',
    isActive: true,
    image: '',
    unit: '',
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<CategoryResponse>({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getCategories(),
  });

  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası seçin');
      return;
    }

    try {
      // Resmi optimize et
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
    setFormData(prev => ({ ...prev, image: '' }));
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
      };

      await productsService.createProduct(productData);
      toast.success('Ürün başarıyla oluşturuldu');
      navigate('/products');
    } catch (error: any) {
      console.error('Ürün oluşturma hatası:', error);
      setError(error.response?.data?.message || 'Ürün oluşturulurken bir hata oluştu');
      toast.error('Ürün oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (categoriesLoading) {
    return <Loading />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Yeni Ürün Ekle
        </Typography>

        <Card sx={{ p: 3, mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {imagePreview ? (
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        src={imagePreview}
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
                >
                  {categories?.data.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Fiyat"
                  name="price"
                  value={formData.price}
                  onChange={handleChange('price')}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Birim"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange('unit')}
                >
                  {["Adet", "Kg", "Gr", "Lt", "Ml", "Porsiyon"].map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </TextField>
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
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/products')}
                    disabled={loading}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Card>
      </Box>
    </Container>
  );
};

export default NewProductPage; 