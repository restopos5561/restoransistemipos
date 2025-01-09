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
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import customersService from '../../services/customers.service';
import Loading from '../../components/common/Loading/Loading';

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersService.getCustomerById(Number(id)),
    enabled: !!id,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-orders', id],
    queryFn: () => customersService.getCustomerOrders(Number(id)),
    enabled: !!id,
  });

  if (isLoading || ordersLoading) {
    return <Loading />;
  }

  if (!customer) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Typography>Cari bulunamadı</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Cari Detayı</Typography>
          <IconButton
            color="primary"
            onClick={() => navigate(`/customers/${id}/edit`)}
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
                    Ad Soyad
                  </Typography>
                  <Typography>{customer.name}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    E-posta
                  </Typography>
                  <Typography>{customer.email || '-'}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Telefon
                  </Typography>
                  <Typography>{customer.phoneNumber || '-'}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Adres
                  </Typography>
                  <Typography>{customer.address || '-'}</Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sipariş Geçmişi
              </Typography>
              <Divider sx={{ my: 2 }} />

              {orders && orders.length > 0 ? (
                <Stack spacing={2}>
                  {orders.map((order: any) => (
                    <Box
                      key={order.id}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2">
                          Sipariş #{order.id}
                        </Typography>
                        <Typography variant="subtitle2">
                          {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                        </Typography>
                      </Box>
                      <Typography color="text.secondary">
                        Toplam: {order.total?.toFixed(2)} ₺
                      </Typography>
                      <Button
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        Detayları Gör
                      </Button>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary" align="center">
                  Henüz sipariş bulunmuyor
                </Typography>
              )}
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/customers')}
          >
            Geri Dön
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CustomerDetailPage; 