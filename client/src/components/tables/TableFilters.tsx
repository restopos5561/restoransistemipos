import React from 'react';
import {
  Paper,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { TableStatus, TableFilters } from '../../types/table.types';

interface TableFiltersProps {
  filters: TableFilters;
  onFilterChange: (filters: Partial<TableFilters>) => void;
}

const TableFiltersComponent: React.FC<TableFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleStatusChange = (event: SelectChangeEvent<TableStatus | ''>) => {
    onFilterChange({ status: event.target.value as TableStatus || undefined });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: event.target.value || undefined });
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ location: event.target.value || undefined });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Ara"
          size="small"
          value={filters.search || ''}
          onChange={handleSearchChange}
          placeholder="Masa no ile ara..."
        />

        <TextField
          label="Konum"
          size="small"
          value={filters.location || ''}
          onChange={handleLocationChange}
          placeholder="Konum ile ara..."
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="status-select-label">Durum</InputLabel>
          <Select
            labelId="status-select-label"
            value={filters.status || ''}
            label="Durum"
            onChange={handleStatusChange}
          >
            <MenuItem value="">
              <em>Hepsi</em>
            </MenuItem>
            <MenuItem value={TableStatus.IDLE}>Boş</MenuItem>
            <MenuItem value={TableStatus.OCCUPIED}>Dolu</MenuItem>
            <MenuItem value={TableStatus.RESERVED}>Rezerve</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );
};

export default TableFiltersComponent; 