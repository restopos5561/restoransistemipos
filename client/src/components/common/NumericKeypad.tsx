import React from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Backspace as BackspaceIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  label?: string;
  maxLength?: number;
  allowDecimal?: boolean;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({
  value,
  onChange,
  onEnter,
  label,
  maxLength = 10,
  allowDecimal = true
}) => {
  const theme = useTheme();

  const handleNumberClick = (num: string) => {
    if (value.length >= maxLength) return;

    // Eğer ilk karakter 0 ise ve decimal nokta yoksa, 0'ı kaldır
    if (value === '0' && num !== '.') {
      onChange(num);
      return;
    }

    // Decimal kontrolü
    if (num === '.' && (!allowDecimal || value.includes('.'))) {
      return;
    }

    onChange(value + num);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1) || '0');
  };

  const handleClear = () => {
    onChange('0');
  };

  const buttons = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '0', allowDecimal ? '.' : ''
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2
      }}
    >
      {/* Ekran */}
      <Box
        sx={{
          mb: 2,
          p: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          borderRadius: 1,
          textAlign: 'right'
        }}
      >
        {label && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {label}
          </Typography>
        )}
        <Typography variant="h4" component="div" sx={{ fontFamily: 'monospace' }}>
          {value}
        </Typography>
      </Box>

      {/* Tuş Takımı */}
      <Grid container spacing={1}>
        {buttons.map((btn, index) => (
          <Grid item xs={4} key={index}>
            {btn && (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleNumberClick(btn)}
                sx={{
                  height: 56,
                  fontSize: '1.25rem',
                  bgcolor: 'background.paper'
                }}
              >
                {btn}
              </Button>
            )}
          </Grid>
        ))}

        {/* Kontrol Tuşları */}
        <Grid item xs={4}>
          <IconButton
            color="error"
            onClick={handleClear}
            sx={{
              width: '100%',
              height: 56,
              border: 1,
              borderColor: 'divider'
            }}
          >
            <ClearIcon />
          </IconButton>
        </Grid>

        <Grid item xs={4}>
          <IconButton
            color="primary"
            onClick={handleBackspace}
            sx={{
              width: '100%',
              height: 56,
              border: 1,
              borderColor: 'divider'
            }}
          >
            <BackspaceIcon />
          </IconButton>
        </Grid>

        <Grid item xs={4}>
          <Button
            fullWidth
            variant="contained"
            onClick={onEnter}
            sx={{ height: 56 }}
          >
            Tamam
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default NumericKeypad; 