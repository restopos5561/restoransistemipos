import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  Button,
  Divider,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import suppliersService from '../../services/suppliers.service';
import Loading from '../../components/common/Loading/Loading';

const SupplierDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Tedarikçi verilerini çek
  const { data: supplier, isLoading: supplierLoading } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => suppliersService.getSupplierById(Number(id)),
    enabled: !!id,
  });

  // Tedarikçinin ürünlerini çek
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['supplier-products', id],
    queryFn: () => suppliersService.getSupplierProducts(Number(id)),
    enabled: !!id,
  });

  if (supplierLoading || productsLoading) {
    return <Loading />;
  }

  if (!supplier) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Typography>Tedarikçi bulunamadı</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Tedarikçi Detayı</Typography>
          <IconButton
            color="primary"
            onClick={() => navigate(`/suppliers/${id}/edit`)}
          >
            <EditIcon />
          </IconButton>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Genel Bilgiler
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tedarikçi Adı
                  </Typography>
                  <Typography>{supplier.name}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    İletişim Kişisi
                  </Typography>
                  <Typography>{supplier.contactName || '-'}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Telefon
                  </Typography>
                  <Typography>{supplier.phone || '-'}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    E-posta
                  </Typography>
                  <Typography>{supplier.email || '-'}</Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tedarik Edilen Ürünler
              </Typography>
              <Divider sx={{ my: 2 }} />

              {products && products.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ürün Adı</TableCell>
                        <TableCell>Ürün Kodu</TableCell>
                        <TableCell align="right">Son Alış Fiyatı</TableCell>
                        <TableCell align="center">Birincil</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell>{item.supplierProductCode || '-'}</TableCell>
                          <TableCell align="right">
                            {item.lastPurchasePrice ? `${item.lastPurchasePrice.toFixed(2)} ₺` : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {item.isPrimary ? 'Evet' : 'Hayır'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" align="center">
                  Henüz ürün bulunmuyor
                </Typography>
              )}
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/suppliers')}
          >
            Geri Dön
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SupplierDetailPage; 