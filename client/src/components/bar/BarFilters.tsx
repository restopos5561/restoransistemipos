import React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { OrderStatus } from '../../types/enums';
import { BarOrdersFilters } from '../../types/bar.types';
import SearchBar from '../common/SearchBar/SearchBar';

interface BarFiltersProps {
  filters: BarOrdersFilters;
  onFilterChange: (newFilters: Partial<BarOrdersFilters>) => void;
}

const BarFilters: React.FC<BarFiltersProps> = ({ filters, onFilterChange }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: `0 0 2px ${alpha(theme.palette.divider, 0.2)}, 0 12px 24px -4px ${alpha(
          theme.palette.divider,
          0.12
        )}`,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* Arama */}
        <Grid item xs={12} md={4}>
          <SearchBar
            value={filters.search || ''}
            onChange={(value) => onFilterChange({ search: value })}
            placeholder="Sipariş no, masa no veya müşteri adı ile ara..."
          />
        </Grid>

        {/* Durum Filtresi */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Durum</InputLabel>
            <Select
              value={filters.status ? filters.status.join(',') : ''}
              label="Durum"
              onChange={(e) => {
                const value = e.target.value;
                onFilterChange({
                  status: value ? (value as string).split(',') as OrderStatus[] : undefined,
                });
              }}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.divider, 0.2),
                },
              }}
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value={OrderStatus.PENDING}>Bekleyen</MenuItem>
              <MenuItem value={OrderStatus.PREPARING}>Hazırlanıyor</MenuItem>
              <MenuItem value={OrderStatus.READY}>Hazır</MenuItem>
              <MenuItem value={`${OrderStatus.PENDING},${OrderStatus.PREPARING}`}>
                Aktif Siparişler
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Öncelik Filtresi */}
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Öncelik</InputLabel>
            <Select
              value={filters.priority === undefined ? '' : filters.priority.toString()}
              label="Öncelik"
              onChange={(e) => {
                const value = e.target.value;
                onFilterChange({
                  priority: value === '' ? undefined : value === 'true',
                });
              }}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.divider, 0.2),
                },
              }}
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="true">Öncelikli</MenuItem>
              <MenuItem value="false">Normal</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Başlangıç Tarihi */}
        <Grid item xs={12} md={2}>
          <DatePicker
            label="Başlangıç Tarihi"
            value={filters.startDate ? new Date(filters.startDate) : null}
            onChange={(date) =>
              onFilterChange({
                startDate: date ? date.toISOString() : undefined,
              })
            }
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                sx: {
                  bgcolor: 'white',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.divider, 0.2),
                  },
                },
              },
            }}
          />
        </Grid>

        {/* Bitiş Tarihi */}
        <Grid item xs={12} md={2}>
          <DatePicker
            label="Bitiş Tarihi"
            value={filters.endDate ? new Date(filters.endDate) : null}
            onChange={(date) =>
              onFilterChange({
                endDate: date ? date.toISOString() : undefined,
              })
            }
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                sx: {
                  bgcolor: 'white',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.divider, 0.2),
                  },
                },
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BarFilters; 