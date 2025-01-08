import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Container, TextField, Typography, Alert } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth.service';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string().min(6, 'Şifre tekrarı en az 6 karakter olmalıdır'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setErrorMessage('Geçersiz şifre sıfırlama bağlantısı.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await authService.resetPassword(token, data.password);

      if (response.success) {
        setSuccessMessage('Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setErrorMessage(response.error || 'Bir hata oluştu.');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
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
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            Geçersiz şifre sıfırlama bağlantısı.
          </Alert>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Giriş Sayfasına Dön
          </Button>
        </Box>
      </Container>
    );
  }

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
          Yeni Şifre Belirleme
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
            label="Yeni Şifre"
            type="password"
            id="password"
            autoComplete="new-password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isLoading}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Yeni Şifre Tekrar"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            disabled={isLoading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'İşleniyor...' : 'Şifreyi Güncelle'}
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