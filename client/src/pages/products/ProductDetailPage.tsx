import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  Container,
  Grid,
  Typography,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import productsService from '../../services/products.service';
import { formatCurrency } from '../../utils/format';
import Loading from '../../components/common/Loading/Loading';
import { ProductResponse } from '../../types/product.types';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery<ProductResponse>({
    queryKey: ['product', id],
    queryFn: () => productsService.getProductById(Number(id)),
    enabled: !!id,
  });

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
        <Typography variant="h4" gutterBottom>
          Ürün Detayı
        </Typography>

        <Grid container spacing={3}>
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
              {/* Buraya ek bilgiler eklenebilir */}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProductDetailPage; 