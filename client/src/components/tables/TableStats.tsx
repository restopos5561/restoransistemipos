import React from 'react';
import { Grid, Paper, Typography, Stack, Box } from '@mui/material';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import StorefrontIcon from '@mui/icons-material/Storefront';

interface TableStatsProps {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
  selectedBranch?: {
    id: number;
    name: string;
  };
}

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Paper sx={{ p: 2 }}>
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography color="text.secondary" variant="body2">
          {title}
        </Typography>
        <Box sx={{ color }}>{icon}</Box>
      </Stack>
      <Typography variant="h4">{value}</Typography>
    </Stack>
  </Paper>
);

const TableStats: React.FC<TableStatsProps> = ({
  totalTables,
  availableTables,
  occupiedTables,
  reservedTables,
  selectedBranch,
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      {selectedBranch && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <StorefrontIcon color="primary" />
          <Typography variant="h6" color="primary">
            {selectedBranch.name}
          </Typography>
        </Stack>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Masa"
            value={totalTables}
            icon={<TableRestaurantIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Müsait Masa"
            value={availableTables}
            icon={<CheckCircleIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Dolu Masa"
            value={occupiedTables}
            icon={<DoNotDisturbIcon />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rezerve Masa"
            value={reservedTables}
            icon={<EventSeatIcon />}
            color="#ed6c02"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TableStats; 