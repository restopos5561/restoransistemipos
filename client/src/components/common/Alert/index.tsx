import React from 'react';
import {
  Alert as MuiAlert,
  AlertProps as MuiAlertProps,
  AlertTitle,
  Collapse,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface AlertProps extends Omit<MuiAlertProps, 'variant'> {
  title?: string;
  show?: boolean;
  onClose?: () => void;
}

const StyledAlert = styled(MuiAlert)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  '& .MuiAlert-message': {
    padding: theme.spacing(1, 0),
  },
  '& .MuiAlert-icon': {
    padding: theme.spacing(1, 0),
  },
}));

const Alert: React.FC<AlertProps> = ({
  children,
  title,
  show = true,
  onClose,
  severity = 'info',
  ...props
}) => {
  return (
    <Collapse in={show}>
      <StyledAlert
        severity={severity}
        onClose={onClose}
        variant="outlined"
        {...props}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {children}
      </StyledAlert>
    </Collapse>
  );
};

export default Alert; 