import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Container, TextField, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await authService.forgotPassword(data.email);

      if (response.success) {
        setSuccessMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
      } else {
        setErrorMessage(response.error || 'Bir hata oluştu.');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Şifremi Unuttum
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {errorMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-posta Adresi"
            autoComplete="email"
            autoFocus
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={isLoading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/login')}
            disabled={isLoading}
          >
            Giriş Sayfasına Dön
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 