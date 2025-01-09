import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { toast } from 'react-toastify';
import customersService from '../../services/customers.service';
import { CustomerCreateInput } from '../../types/customer.types';

const NewCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CustomerCreateInput>({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    restaurantId: Number(localStorage.getItem('restaurantId')) || 0
  });

  const handleChange = (field: keyof CustomerCreateInput) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Form validasyonu
    if (!formData.name?.trim()) {
      setError('Ad Soyad alanı zorunludur');
      return;
    }

    setLoading(true);

    try {
      const customerData = {
        ...formData,
        name: formData.name.trim(),
      };

      await customersService.createCustomer(customerData);
      toast.success('Cari başarıyla oluşturuldu');
      navigate('/customers');
    } catch (error: any) {
      console.error('Cari oluşturma hatası:', error);
      const errorMessage = error.response?.data?.error?.details || 
                          error.response?.data?.message || 
                          error.message ||
                          'Cari oluşturulurken bir hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Yeni Cari Ekle
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
                    onClick={() => navigate('/customers')}
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

export default NewCustomerPage; 