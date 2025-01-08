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
  Grid,
} from '@mui/material';
import { TableStatus, TableFilters } from '../../types/table.types';
import { useQuery } from '@tanstack/react-query';
import branchService from '../../services/branch.service';

interface TableFiltersProps {
  filters: TableFilters;
  onFilterChange: (filters: Partial<TableFilters>) => void;
}

const TableFiltersComponent: React.FC<TableFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  // Şubeleri getir
  const { data: branchData } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getCurrentBranch(),
  });

  const handleStatusChange = (event: SelectChangeEvent<TableStatus | ''>) => {
    onFilterChange({ status: event.target.value as TableStatus || undefined });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: event.target.value || undefined });
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ location: event.target.value || undefined });
  };

  const handleCapacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value ? parseInt(event.target.value, 10) : undefined;
    onFilterChange({ capacity: value });
  };

  const handleBranchChange = (event: SelectChangeEvent<number | ''>) => {
    onFilterChange({ branchId: event.target.value as number || undefined });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Ara"
              size="small"
              value={filters.search || ''}
              onChange={handleSearchChange}
              placeholder="Masa no ile ara..."
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="branch-select-label">Şube</InputLabel>
              <Select
                labelId="branch-select-label"
                value={filters.branchId || ''}
                label="Şube"
                onChange={handleBranchChange}
              >
                <MenuItem value="">
                  <em>Tüm Şubeler</em>
                </MenuItem>
                {branchData?.data?.branches?.map((branch: any) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Konum"
              size="small"
              value={filters.location || ''}
              onChange={handleLocationChange}
              placeholder="Konum ile ara..."
            />

            <TextField
              label="Min. Kapasite"
              type="number"
              size="small"
              value={filters.capacity || ''}
              onChange={handleCapacityChange}
              placeholder="Minimum kapasite..."
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TableFiltersComponent; 