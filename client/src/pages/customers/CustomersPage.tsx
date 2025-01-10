import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import CustomerList from '../../components/customers/CustomerList';
import customersService from '../../services/customers.service';
import Loading from '../../components/common/Loading/Loading';
import { Customer } from '../../types/customer.types';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

interface CustomerData {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // User değiştiğinde restaurantId'yi kontrol et
  useEffect(() => {
    if (user?.restaurantId) {
      localStorage.setItem('restaurantId', user.restaurantId.toString());
      console.debug('[Cariler] RestaurantID güncellendi:', user.restaurantId);
    }
  }, [user]);

  const queryOptions: UseQueryOptions<CustomerData, Error> = {
    queryKey: ['customers', page, limit, search],
    queryFn: async () => {
      console.debug('[Cariler] Veri yükleniyor...', { page, limit, search });
      
      const restaurantId = user?.restaurantId || localStorage.getItem('restaurantId');
      if (!restaurantId) {
        console.error('[Cariler] RestaurantID bulunamadı');
        throw new Error('Restoran bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      }

      try {
        const response = await customersService.getCustomers({
          page,
          limit,
          search: search.trim(),
          restaurantId: Number(restaurantId)
        });

        console.debug('[Cariler] Veri yüklendi:', {
          success: response.success,
          total: response.data?.total,
          count: response.data?.customers?.length
        });

        if (!response.success) {
          throw new Error(response.error || 'Veriler alınamadı');
        }

        return response.data;
      } catch (err: any) {
        console.error('[Cariler] Veri yükleme hatası:', err);
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  };

  const { data, isLoading, error, refetch } = useQuery<CustomerData, Error>(queryOptions);

  // Veri ve yükleme durumu kontrolü
  const customers = data?.customers || [];
  const total = data?.total || 0;
  const isError = error instanceof Error;
  const errorMessage = isError ? error.message : 'Bir hata oluştu';

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    console.debug('[Cariler] Sayfa değişti:', newPage);
    setPage(newPage);
  };

  const handleRefresh = async () => {
    console.debug('[Cariler] Liste yenileniyor...');
    try {
      await refetch();
      toast.success('Liste güncellendi');
    } catch (err: any) {
      console.error('[Cariler] Yenileme hatası:', err);
      toast.error(err.message || 'Liste yenilenirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Cariler</Typography>
          <Box>
            <Button
              variant="outlined"
              onClick={handleRefresh}
              sx={{ mr: 1 }}
            >
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/customers/new')}
            >
              Yeni Cari
            </Button>
          </Box>
        </Box>

        <Card sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Cari Ara..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {isError ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography color="error">
                {errorMessage}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleRefresh}
                sx={{ mt: 2 }}
              >
                Tekrar Dene
              </Button>
            </Box>
          ) : customers.length > 0 ? (
            <CustomerList
              customers={customers}
              total={total}
              page={page}
              limit={limit}
              onPageChange={handlePageChange}
              onRefresh={handleRefresh}
            />
          ) : (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {search ? 'Arama kriterine uygun cari bulunamadı' : 'Henüz cari eklenmemiş'}
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Container>
  );
};

export default CustomersPage; 