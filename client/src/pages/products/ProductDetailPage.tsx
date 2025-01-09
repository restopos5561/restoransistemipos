import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  Container,
  Grid,
  Typography,
  Divider,
  Chip,
  Stack,
  Button,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import productsService from '../../services/products.service';
import { formatCurrency } from '../../utils/format';
import Loading from '../../components/common/Loading/Loading';
import { ProductResponse } from '../../types/product.types';
import ProductForm from '../../components/products/ProductForm';
import PriceHistory from '../../components/products/PriceHistory';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<ProductResponse>({
    queryKey: ['product', id],
    queryFn: () => productsService.getProductById(Number(id)),
    enabled: !!id,
  });

  const handleSubmit = async (formData: any) => {
    try {
      await productsService.updateProduct(Number(id), formData);
      toast.success('Ürün başarıyla güncellendi');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    } catch (error) {
      toast.error('Ürün güncellenirken bir hata oluştu');
      throw error;
    }
  };

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <Typography color="error" align="center">
        Ürün yüklenirken bir hata oluştu.
      </Typography>
    );
  }

  const product = data?.data;

  if (!product) {
    return (
      <Typography color="error" align="center">
        Ürün bulunamadı.
      </Typography>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Ürün Detayı
          </Typography>
          {!isEditing && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Düzenle
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {isEditing ? (
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <ProductForm
                  initialData={product}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsEditing(false)}
                />
              </Card>
            </Grid>
          ) : (
            <>
              <Grid item xs={12} md={8}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    {product.name}
                  </Typography>

                  {product.description && (
                    <>
                      <Typography variant="subtitle1" color="text.secondary" paragraph>
                        {product.description}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                    </>
                  )}

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Kategori
                      </Typography>
                      <Typography>{product.category?.name || '-'}</Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Fiyat
                      </Typography>
                      <Typography>{formatCurrency(product.price)}</Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Stok Durumu
                      </Typography>
                      <Typography>
                        {product.stockTracking
                          ? `${product.stocks?.[0]?.quantity || 0} adet`
                          : 'Stok Takibi Yapılmıyor'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Hazırlama Süresi
                      </Typography>
                      <Typography>
                        {product.preparationTime
                          ? `${product.preparationTime} dakika`
                          : 'Belirtilmemiş'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Durum
                      </Typography>
                      <Chip
                        label={product.isActive ? 'Aktif' : 'Pasif'}
                        color={product.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  </Stack>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                  <Card sx={{ p: 3 }}>
                    <PriceHistory productId={product.id} />
                  </Card>
                </Stack>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default ProductDetailPage; 