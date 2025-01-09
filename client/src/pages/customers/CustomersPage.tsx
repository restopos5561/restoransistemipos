import React, { useState } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import CustomerList from '../../components/customers/CustomerList';
import customersService from '../../services/customers.service';
import Loading from '../../components/common/Loading/Loading';
import { CustomerListResponse } from '../../types/customer.types';
import { toast } from 'react-hot-toast';

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, refetch } = useQuery<CustomerListResponse>({
    queryKey: ['customers', page, limit, search],
    queryFn: async () => {
      const restaurantId = localStorage.getItem('restaurantId');
      console.log('Müşteri listesi yükleniyor...', { page, limit, search, restaurantId });
      
      if (!restaurantId) {
        console.error('Restaurant ID bulunamadı');
        throw new Error('Restaurant ID bulunamadı');
      }

      const params = {
        page,
        limit,
        search: search.trim(),
        restaurantId: Number(restaurantId)
      };
      console.log('API isteği parametreleri:', params);

      return await customersService.getCustomers(params);
    },
    refetchOnWindowFocus: false
  });

  console.log('Render - Mevcut data:', data);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRefresh = async () => {
    console.log('Liste yenileme başlatıldı');
    try {
      await refetch();
      console.log('Liste yenileme başarılı');
    } catch (error) {
      console.error('Liste yenileme hatası:', error);
      toast.error('Liste yenilenirken bir hata oluştu');
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/customers/new')}
          >
            Yeni Cari
          </Button>
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
                ),
              }}
            />
          </Box>

          {data?.data?.customers ? (
            <CustomerList
              customers={data.data.customers}
              total={data.data.total}
              page={page}
              limit={limit}
              onPageChange={handlePageChange}
              onRefresh={handleRefresh}
            />
          ) : (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Veri yüklenirken bir hata oluştu
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Container>
  );
};

export default CustomersPage; 