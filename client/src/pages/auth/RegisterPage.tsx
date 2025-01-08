import React from 'react';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, RegisterFormData } from '@/validations/auth.schema';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      navigate('/login');
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" gutterBottom align="center">
          Kayıt Ol
        </Typography>
        
        {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error instanceof Error ? error.message : 'Kayıt başarısız'}
            </Alert>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register('name')}
            margin="normal"
            fullWidth
            label="Ad Soyad"
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          
          <TextField
            {...register('email')}
            margin="normal"
            fullWidth
            label="Email"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          
          <TextField
            {...register('password')}
            margin="normal"
            fullWidth
            label="Şifre"
            type="password"
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={isLoading}
          >
            {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default RegisterPage; 