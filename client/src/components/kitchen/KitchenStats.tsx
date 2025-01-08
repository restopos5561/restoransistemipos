import React from 'react';
import { Grid, Paper, Typography, Box, useTheme, alpha } from '@mui/material';
import { 
  Timer as TimerIcon,
  PendingActions as PendingIcon,
  LocalDining as PreparingIcon,
  CheckCircle as CompletedIcon 
} from '@mui/icons-material';
import { OrderStats } from '../../types/kitchen.types';

interface KitchenStatsProps {
  stats: OrderStats;
}

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2,
        height: '100%',
        bgcolor: alpha(color, 0.1),
        border: `1px solid ${alpha(color, 0.2)}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box 
          sx={{ 
            p: 1, 
            borderRadius: 1, 
            bgcolor: alpha(color, 0.2),
            display: 'flex',
            mr: 1
          }}
        >
          {React.cloneElement(icon as React.ReactElement, { sx: { color } })}
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ color }}>
        {value}
      </Typography>
    </Paper>
  );
};

const KitchenStats: React.FC<KitchenStatsProps> = ({ stats }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Ortalama Hazırlama"
          value={`${Math.round(stats.averagePreparationTime)} dk`}
          icon={<TimerIcon />}
          color={theme.palette.primary.main}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Bekleyen"
          value={stats.pendingCount}
          icon={<PendingIcon />}
          color={theme.palette.warning.main}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Hazırlanan"
          value={stats.preparingCount}
          icon={<PreparingIcon />}
          color={theme.palette.info.main}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Bugün Tamamlanan"
          value={stats.completedToday}
          icon={<CompletedIcon />}
          color={theme.palette.success.main}
        />
      </Grid>
    </Grid>
  );
};

export default KitchenStats; 