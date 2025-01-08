import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonProps, alpha, styled } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const StyledButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  left: 16,
  top: 80,
  minWidth: 'unset',
  borderRadius: '50%',
  width: 48,
  height: 48,
  padding: 0,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: 'rgba(145, 158, 171, 0.16) 0px 8px 16px 0px',
  zIndex: 1000,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  [theme.breakpoints.up('sm')]: {
    position: 'static',
    borderRadius: 8,
    width: 'auto',
    height: 'auto',
    padding: '6px 16px',
    boxShadow: 'none',
    '& .MuiButton-startIcon': {
      marginRight: 8,
    },
  },
}));

interface BackButtonProps extends Omit<ButtonProps, 'onClick'> {
  to?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to, children, ...props }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <StyledButton
      startIcon={<ArrowBackIcon />}
      onClick={handleClick}
      {...props}
    >
      {children || 'Geri'}
    </StyledButton>
  );
};

export default BackButton; 