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
import { toast } from 'react-hot-toast';
import suppliersService from '../../services/suppliers.service';
import { CreateSupplierInput } from '../../types/supplier.types';

const NewSupplierPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateSupplierInput>({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    restaurantId: Number(localStorage.getItem('restaurantId')) || 0
  });

  const handleChange = (field: keyof CreateSupplierInput) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Form validasyonu
    if (!formData.name?.trim()) {
      setError('Tedarikçi adı zorunludur');
      return;
    }

    setLoading(true);

    try {
      const supplierData = {
        ...formData,
        name: formData.name.trim(),
        contactName: formData.contactName?.trim(),
        phone: formData.phone?.trim(),
        email: formData.email?.trim(),
      };

      await suppliersService.createSupplier(supplierData);
      toast.success('Tedarikçi başarıyla oluşturuldu');
      navigate('/suppliers');
    } catch (error: any) {
      console.error('Tedarikçi oluşturma hatası:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message ||
                          'Tedarikçi oluşturulurken bir hata oluştu';
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
          Yeni Tedarikçi Ekle
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
                  label="Tedarikçi Adı"
                  name="name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!formData.name.trim()}
                  helperText={!formData.name.trim() && 'Tedarikçi adı zorunludur'}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="İletişim Kişisi"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange('contactName')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange('phone')}
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

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/suppliers')}
                    disabled={loading}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !formData.name.trim()}
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

export default NewSupplierPage; 