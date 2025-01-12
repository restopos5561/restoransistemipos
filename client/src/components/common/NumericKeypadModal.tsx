import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Button,
  Grid,
  Typography,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Backspace as BackspaceIcon,
} from '@mui/icons-material';

interface NumericKeypadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title?: string;
  label?: string;
  initialValue?: string;
  maxLength?: number;
  allowDecimal?: boolean;
}

const NumericKeypadModal: React.FC<NumericKeypadModalProps> = ({
  open,
  onClose,
  onSubmit,
  title = 'Sayısal Giriş',
  label = 'Değer',
  initialValue = '0',
  maxLength = 10,
  allowDecimal = false,
}) => {
  const theme = useTheme();
  const [value, setValue] = useState(initialValue);

  // Modal açıldığında değeri sıfırla
  React.useEffect(() => {
    if (open) {
      setValue(initialValue);
    }
  }, [open, initialValue]);

  // Rakam ekle
  const handleAddDigit = (digit: string) => {
    if (value === '0' && digit !== '.') {
      setValue(digit);
    } else if (value.length < maxLength) {
      setValue(prev => prev + digit);
    }
  };

  // Son rakamı sil
  const handleBackspace = () => {
    setValue(prev => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  };

  // Tüm rakamları sil
  const handleClear = () => {
    setValue('0');
  };

  // Ondalık nokta ekle
  const handleDecimal = () => {
    if (!allowDecimal || value.includes('.')) return;
    setValue(prev => prev + '.');
  };

  // Değeri onayla
  const handleSubmit = () => {
    onSubmit(value);
    onClose();
  };

  // Tuş takımı butonları
  const renderButton = (content: React.ReactNode, onClick: () => void, disabled = false) => (
    <Button
      fullWidth
      variant="outlined"
      onClick={onClick}
      disabled={disabled}
      sx={{
        height: 64,
        fontSize: '1.5rem',
        borderColor: alpha(theme.palette.divider, 0.1),
        '&:hover': {
          borderColor: theme.palette.primary.main,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
        },
      }}
    >
      {content}
    </Button>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ width: '100%', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {label}
          </Typography>
          <Typography
            variant="h4"
            align="right"
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.background.default, 0.5),
              fontFamily: 'monospace',
            }}
          >
            {value}
          </Typography>
        </Box>

        <Grid container spacing={1}>
          {/* Rakamlar */}
          {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(digit => (
            <Grid item xs={4} key={digit}>
              {renderButton(digit, () => handleAddDigit(digit.toString()))}
            </Grid>
          ))}

          {/* Alt satır */}
          <Grid item xs={4}>
            {renderButton(
              '.',
              handleDecimal,
              !allowDecimal || value.includes('.')
            )}
          </Grid>
          <Grid item xs={4}>
            {renderButton('0', () => handleAddDigit('0'))}
          </Grid>
          <Grid item xs={4}>
            {renderButton(<BackspaceIcon />, handleBackspace)}
          </Grid>

          {/* İşlem butonları */}
          <Grid item xs={6}>
            {renderButton(
              <Typography color="error">Temizle</Typography>,
              handleClear
            )}
          </Grid>
          <Grid item xs={6}>
            {renderButton(
              <Typography color="primary">Onayla</Typography>,
              handleSubmit
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default NumericKeypadModal; 