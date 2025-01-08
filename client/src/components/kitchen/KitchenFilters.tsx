import React from 'react';
import {
  Stack,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Box,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { KitchenOrdersFilters } from '../../types/kitchen.types';

interface KitchenFiltersProps {
  filters: KitchenOrdersFilters;
  onFilterChange: (filters: KitchenOrdersFilters) => void;
}

const KitchenFilters: React.FC<KitchenFiltersProps> = ({ filters, onFilterChange }) => {
  const theme = useTheme();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: event.target.value });
  };

  const handlePriorityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, priority: event.target.checked });
  };

  const handleStartDateChange = (date: Date | null) => {
    onFilterChange({ ...filters, startDate: date?.toISOString() });
  };

  const handleEndDateChange = (date: Date | null) => {
    onFilterChange({ ...filters, endDate: date?.toISOString() });
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Sipariş veya masa ara..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
          sx={{ flex: 1 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={filters.priority || false}
              onChange={handlePriorityChange}
              color="warning"
            />
          }
          label="Sadece Öncelikli"
        />
      </Box>
      
      <Stack direction="row" spacing={2}>
        <DatePicker
          label="Başlangıç Tarihi"
          value={filters.startDate ? new Date(filters.startDate) : null}
          onChange={handleStartDateChange}
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="Bitiş Tarihi"
          value={filters.endDate ? new Date(filters.endDate) : null}
          onChange={handleEndDateChange}
          slotProps={{ textField: { size: 'small' } }}
        />
      </Stack>
    </Stack>
  );
};

export default KitchenFilters; 