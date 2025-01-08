import React from 'react';
import { Grid, useTheme } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import PendingIcon from '@mui/icons-material/Pending';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { StatCard } from '../common';

interface BarStatsProps {
  stats: {
    averagePreparationTime: number;
    pendingCount: number;
    preparingCount: number;
    completedToday: number;
  };
}

const BarStats: React.FC<BarStatsProps> = ({ stats }) => {
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
          icon={<LocalBarIcon />}
          color={theme.palette.info.main}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Bugün Tamamlanan"
          value={stats.completedToday}
          icon={<CheckCircleIcon />}
          color={theme.palette.success.main}
        />
      </Grid>
    </Grid>
  );
};

export default BarStats; 