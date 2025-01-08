import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface LoaderProps {
  size?: number;
  text?: string;
  fullScreen?: boolean;
}

const LoaderWrapper = styled(Box)<{ fullScreen?: boolean }>(
  ({ theme, fullScreen }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: theme.zIndex.modal,
    }),
  })
);

const Loader: React.FC<LoaderProps> = ({
  size = 40,
  text = 'Yükleniyor...',
  fullScreen = false,
}) => {
  return (
    <LoaderWrapper fullScreen={fullScreen}>
      <CircularProgress size={size} />
      {text && (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mt: 2 }}
        >
          {text}
        </Typography>
      )}
    </LoaderWrapper>
  );
};

export default Loader; 