import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  fullWidth?: boolean;
  loading?: boolean;
}

const StyledButton = styled(MuiButton)(({ theme }) => ({
  padding: '8px 16px',
  fontWeight: 500,
  '&.MuiButton-containedPrimary': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  '&.MuiButton-containedSecondary': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[500],
  },
}));

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  loading = false,
  disabled,
  ...props
}) => {
  const muiVariant = variant === 'primary' || variant === 'secondary' ? 'contained' : variant;

  return (
    <StyledButton
      variant={muiVariant}
      color={variant === 'primary' ? 'primary' : 'secondary'}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Yükleniyor...' : children}
    </StyledButton>
  );
};

export default Button; 