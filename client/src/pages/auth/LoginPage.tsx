import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Link,
  FormControlLabel,
  Checkbox,
  Container,
  Paper,
  Stack,
  InputAdornment,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, LoginFormData } from '@/validations/auth.schema';
import { BranchSelectionDialog } from '@/components/auth/BranchSelectionDialog';
import Logo from '@/components/common/Logo/index';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';

interface Branch {
  id: number;
  name: string;
}

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const { login, isLoading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [loginCredentials, setLoginCredentials] = useState<LoginFormData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      const response = await login(data);
      
      if (typeof response.error === 'string' && 
          response.error === 'MULTIPLE_ACTIVE_BRANCHES' && 
          response.data?.branches) {
        setAvailableBranches(response.data.branches);
        setLoginCredentials(data);
        setShowBranchDialog(true);
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err instanceof Error ? err.message : 'Giriş işlemi başarısız oldu');
    }
  };

  const handleBranchSelect = async (branchId: number) => {
    if (!loginCredentials) return;

    try {
      setLoginError(null);
      const credentials = {
        email: loginCredentials.email,
        password: loginCredentials.password,
        rememberMe: loginCredentials.rememberMe,
        branchId: branchId
      };

      const response = await login(credentials);

      if (response.data?.accessToken && response.data?.refreshToken) {
        setShowBranchDialog(false);
        return;
      }

      if (response.error === 'MULTIPLE_ACTIVE_BRANCHES') {
        setLoginError('Bu şube seçimi geçersiz. Lütfen farklı bir şube seçin.');
      } else {
        setLoginError(response.error || 'Şube seçimi başarısız oldu');
      }
    } catch (err) {
      console.error('Branch selection error:', err);
      setLoginError(err instanceof Error ? err.message : 'Şube seçimi başarısız oldu');
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.background.default,
        py: { xs: 3, sm: 4, md: 0 }
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            bgcolor: 'background.paper',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Stack spacing={4} alignItems="center">
            {/* Logo */}
            <Box
              sx={{
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                mb: 2
              }}
            >
              <Logo sx={{ width: 40, height: 40 }} />
            </Box>

            {/* Başlık */}
            <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
              <Typography variant="h4" fontWeight={600} textAlign="center">
                Hoş Geldiniz
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                Devam etmek için giriş yapın
              </Typography>
            </Stack>

            {/* Hata Mesajı */}
            {loginError && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {loginError}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
              <Stack spacing={3} sx={{ width: '100%' }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="E-posta"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      label="Şifre"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: theme.palette.text.secondary }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleTogglePassword} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            sx={{
                              color: theme.palette.primary.main,
                              '&.Mui-checked': {
                                color: theme.palette.primary.main,
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" color="text.secondary">
                            Beni hatırla
                          </Typography>
                        }
                      />
                    )}
                  />

                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    color="primary"
                    sx={{ textDecoration: 'none' }}
                  >
                    Şifremi unuttum
                  </Link>
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                  }}
                >
                  {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>

      {/* Şube Seçim Dialog'u */}
      <BranchSelectionDialog
        open={showBranchDialog}
        onClose={() => setShowBranchDialog(false)}
        branches={availableBranches}
        onSelect={handleBranchSelect}
      />
    </Box>
  );
};

export default LoginPage; 