import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import ProductList from '../../components/products/ProductList';
import ProductFilters from '../../components/products/ProductFilters';
import { useLoadingStore } from '../../store/loading/loadingStore';
import Loading from '../../components/common/Loading/Loading';

const ProductsPage: React.FC = () => {
  const isLoading = useLoadingStore((state) => state.isLoading);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Ürünler
        </Typography>

        <ProductFilters />
        
        {isLoading ? (
          <Loading />
        ) : (
          <ProductList />
        )}
      </Box>
    </Container>
  );
};

export default ProductsPage; 