import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { RestaurantMenu } from '@mui/icons-material';

interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const Logo: React.FC<LogoProps> = ({ sx, ...other }) => {
  const logo = (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        width: 40,
        height: 40,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          bgcolor: 'primary.dark',
          transform: 'scale(1.1)',
        },
        ...sx
      }}
      {...other}
    >
      <RestaurantMenu sx={{ fontSize: 24 }} />
    </Box>
  );

  return logo;
};

export default Logo; 