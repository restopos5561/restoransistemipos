import React from 'react';
import { Paper, Box, Typography, useTheme, alpha } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: color ? alpha(color, 0.1) : 'background.paper',
        border: 1,
        borderColor: color ? alpha(color, 0.2) : theme.palette.divider,
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1,
          display: 'flex',
          bgcolor: color ? alpha(color, 0.2) : alpha(theme.palette.primary.main, 0.1),
          color: color || theme.palette.primary.main,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatCard; 