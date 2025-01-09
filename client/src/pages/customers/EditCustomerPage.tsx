import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import customersService from '../../services/customers.service';
import { CustomerUpdateInput } from '../../types/customer.types';
import Loading from '../../components/common/Loading/Loading';

const EditCustomerPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersService.getCustomerById(Number(id)),
    enabled: !!id,
  });

  const [formData, setFormData] = useState<CustomerUpdateInput>({
    name: customer?.name || '',
    email: customer?.email || '',
    phoneNumber: customer?.phoneNumber || '',
    address: customer?.address || '',
  });

  React.useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phoneNumber: customer.phoneNumber || '',
        address: customer.address || '',
      });
    }
  }, [customer]);

  const handleChange = (field: keyof CustomerUpdateInput) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;

    setError(null);
    setLoading(true);

    try {
      await customersService.updateCustomer(Number(id), formData);
      toast.success('Cari başarıyla güncellendi');
      navigate(`/customers/${id}`);
    } catch (error: any) {
      console.error('Cari güncelleme hatası:', error);
      setError(error.response?.data?.message || 'Cari güncellenirken bir hata oluştu');
      toast.error('Cari güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
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
        <Typography variant="h4" gutterBottom>
          Cari Düzenle
        </Typography>

        <Card sx={{ p: 3, mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Ad Soyad"
                  name="name"
                  value={formData.name}
                  onChange={handleChange('name')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="E-posta"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange('phoneNumber')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Adres"
                  name="address"
                  value={formData.address}
                  onChange={handleChange('address')}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/customers/${id}`)}
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

export default EditCustomerPage; 