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
import customersService from '../../services/customers.service';
import Loading from '../../components/common/Loading/Loading';
import { toast } from 'react-hot-toast';

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  address: string | null;
  restaurantId: number;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
}

const EditCustomerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phoneNumber: '',
    address: ''
  });

  // Müşteri verilerini çek
  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) throw new Error('ID bulunamadı');
      const response = await customersService.getCustomerById(Number(id));
      if (!response) throw new Error('Müşteri bulunamadı');
      
      // Form verilerini güncelle
      const customerData = response as Customer;
      setFormData({
        name: customerData.name,
        email: customerData.email || '',
        phoneNumber: customerData.phoneNumber || '',
        address: customerData.address || ''
      });
      
      return customerData;
    },
    enabled: !!id
  });

  const handleChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      if (!id) throw new Error('ID bulunamadı');
      
      console.log('Form gönderiliyor:', formData);

      if (!formData.name?.trim()) {
        throw new Error('İsim alanı zorunludur');
      }

      await customersService.updateCustomer(Number(id), formData);
      
      toast.success('Cari başarıyla güncellendi');
      navigate('/customers');
    } catch (error: any) {
      console.error('Form gönderme hatası:', error);
      setError(error.message || 'Cari güncellenirken bir hata oluştu');
      toast.error(error.message || 'Cari güncellenirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!customer) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Typography color="error">Cari bulunamadı</Typography>
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
                  error={!formData.name.trim()}
                  helperText={!formData.name.trim() && 'Ad Soyad zorunludur'}
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Adres"
                  name="address"
                  value={formData.address}
                  onChange={handleChange('address')}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/customers')}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!formData.name.trim()}
                >
                  Kaydet
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>
      </Box>
    </Container>
  );
};

export default EditCustomerPage; 