import React, { useCallback } from 'react';
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
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import { TableStatus, TableFilters } from '../../types/table.types';

interface TableFiltersProps {
  filters: TableFilters;
  onFilterChange: (filters: Partial<TableFilters>) => void;
}

const TableFiltersComponent: React.FC<TableFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  // Debounce edilmiş arama fonksiyonu
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onFilterChange({ search: value || undefined });
    }, 300),
    [onFilterChange]
  );

  const handleStatusChange = (event: SelectChangeEvent<TableStatus | ''>) => {
    onFilterChange({ status: event.target.value as TableStatus || undefined });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ location: event.target.value || undefined });
  };

  const handleCapacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value ? parseInt(event.target.value, 10) : undefined;
    onFilterChange({ capacity: value });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Hızlı Arama"
              size="small"
              defaultValue={filters.search || ''}
              onChange={handleSearchChange}
              placeholder="Masa no, konum, kapasite ile ara..."
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
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