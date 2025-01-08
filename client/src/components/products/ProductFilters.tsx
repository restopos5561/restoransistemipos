import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import categoriesService from '../../services/categories.service';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
}

interface CategoryResponse {
  success: boolean;
  data: Category[];
}

interface FilterValues {
  search: string;
  categoryId: string;
  isActive: string;
}

const ProductFilters: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    categoryId: '',
    isActive: 'all',
  });

  const { data: categories } = useQuery<CategoryResponse>({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getCategories(),
  });

  const handleFilterChange = (field: keyof FilterValues) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleClearSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: '',
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      isActive: 'all',
    });
  };

  return (
    <Card sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4} md={3}>
          <TextField
            fullWidth
            placeholder="Ürün Ara..."
            value={filters.search}
            onChange={handleFilterChange('search')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <TextField
            select
            fullWidth
            label="Kategori"
            value={filters.categoryId}
            onChange={handleFilterChange('categoryId')}
          >
            <MenuItem value="">Tümü</MenuItem>
            {categories?.data.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <TextField
            select
            fullWidth
            label="Durum"
            value={filters.isActive}
            onChange={handleFilterChange('isActive')}
          >
            <MenuItem value="all">Tümü</MenuItem>
            <MenuItem value="true">Aktif</MenuItem>
            <MenuItem value="false">Pasif</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleClearFilters}
            startIcon={<ClearIcon />}
          >
            Filtreleri Temizle
          </Button>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/products/new')}
          >
            Yeni Ürün
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ProductFilters; 