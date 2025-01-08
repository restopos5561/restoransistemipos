import React from 'react';
import { Grid } from '@mui/material';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import StatCard from '../common/StatCard';

interface TableStatsProps {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
}

const TableStats: React.FC<TableStatsProps> = ({
  totalTables,
  availableTables,
  occupiedTables,
  reservedTables,
}) => {
  return (
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
          title="Boş Masa"
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
          icon={<EventBusyIcon />}
          color="#ed6c02"
        />
      </Grid>
    </Grid>
  );
};

export default TableStats; 