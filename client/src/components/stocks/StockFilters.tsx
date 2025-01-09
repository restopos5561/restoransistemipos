import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { StockFilters as StockFiltersType } from '@/types/stock.types';
import { useDebounce } from '@/hooks/useDebounce';

interface StockFiltersProps {
  filters: StockFiltersType;
  onFiltersChange: (filters: StockFiltersType) => void;
}

const StockFilters: React.FC<StockFiltersProps> = ({ filters, onFiltersChange }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({
        ...filters,
        search: debouncedSearch,
        page: 1,
      });
    }
  }, [debouncedSearch]);

  const handleChange = (field: keyof StockFiltersType, value: any) => {
    if (field === 'search') {
      setSearchTerm(value);
    } else {
      onFiltersChange({
        ...filters,
        [field]: value,
      });
    }
  };

  return (
    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TextField
        label="Ürün Ara"
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => handleChange('search', e.target.value)}
        sx={{ minWidth: 200 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={filters.lowStock || false}
            onChange={(e) => handleChange('lowStock', e.target.checked)}
          />
        }
        label="Sadece Düşük Stok"
      />
    </Box>
  );
};

export default StockFilters; 