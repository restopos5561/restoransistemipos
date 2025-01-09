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
import suppliersService from '../../services/suppliers.service';
import Loading from '../../components/common/Loading/Loading';
import { toast } from 'react-hot-toast';
import { Supplier, UpdateSupplierInput } from '../../types/supplier.types';

interface FormData extends UpdateSupplierInput {
  name: string;
  contactName: string;
  phone: string;
  email: string;
}

const EditSupplierPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    contactName: '',
    phone: '',
    email: ''
  });

  // Tedarikçi verilerini çek
  const { data: supplier, isLoading } = useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      if (!id) throw new Error('ID bulunamadı');
      const response = await suppliersService.getSupplierById(Number(id));
      if (!response) throw new Error('Tedarikçi bulunamadı');
      
      // Form verilerini güncelle
      const supplierData = response as Supplier;
      setFormData({
        name: supplierData.name,
        contactName: supplierData.contactName || '',
        phone: supplierData.phone || '',
        email: supplierData.email || ''
      });
      
      return supplierData;
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
      setLoading(true);
      
      console.log('Form gönderiliyor:', formData);

      if (!formData.name?.trim()) {
        throw new Error('Tedarikçi adı zorunludur');
      }

      const updateData: UpdateSupplierInput = {
        name: formData.name.trim(),
        contactName: formData.contactName?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        email: formData.email?.trim() || undefined
      };

      await suppliersService.updateSupplier(Number(id), updateData);
      
      toast.success('Tedarikçi başarıyla güncellendi');
      navigate('/suppliers');
    } catch (error: any) {
      console.error('Form gönderme hatası:', error);
      setError(error.message || 'Tedarikçi güncellenirken bir hata oluştu');
      toast.error(error.message || 'Tedarikçi güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!supplier) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Typography color="error">Tedarikçi bulunamadı</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tedarikçi Düzenle
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

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
              </Grid>
            </Grid>
          </form>
        </Card>
      </Box>
    </Container>
  );
};

export default EditSupplierPage; 