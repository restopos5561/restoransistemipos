import React from 'react';
import {
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

interface ModalProps extends Omit<DialogProps, 'title'> {
  title?: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
  fullScreen?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius,
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.grey[200]}`,
}));

const Modal: React.FC<ModalProps> = ({
  children,
  title,
  footer,
  onClose,
  fullScreen = false,
  maxWidth = 'sm',
  ...props
}) => {
  return (
    <StyledDialog
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={maxWidth}
      {...props}
    >
      {title && (
        <StyledDialogTitle>
          {typeof title === 'string' ? (
            <Typography variant="h6">{title}</Typography>
          ) : (
            title
          )}
          {onClose && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              size="small"
              sx={{ ml: 2 }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </StyledDialogTitle>
      )}
      <StyledDialogContent>{children}</StyledDialogContent>
      {footer && <StyledDialogActions>{footer}</StyledDialogActions>}
    </StyledDialog>
  );
};

export default Modal; 