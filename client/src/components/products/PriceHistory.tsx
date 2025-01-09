import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import productsService from '../../services/products.service';
import { formatCurrency } from '../../utils/format';
import Loading from '../common/Loading/Loading';
import { PriceHistory as PriceHistoryType } from '../../types/product.types';

interface PriceHistoryProps {
  productId: number;
}

const PriceHistory: React.FC<PriceHistoryProps> = ({ productId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['product-price-history', productId],
    queryFn: () => productsService.getProductPriceHistory(productId),
  });

  if (isLoading) return <Loading />;

  const priceHistory = data?.data || [];

  if (priceHistory.length === 0) {
    return (
      <Typography color="text.secondary" align="center">
        Fiyat geçmişi bulunamadı.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Fiyat Geçmişi
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tarih</TableCell>
              <TableCell align="right">Eski Fiyat</TableCell>
              <TableCell align="right">Yeni Fiyat</TableCell>
              <TableCell align="right">Değişim</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {priceHistory.map((history: PriceHistoryType) => {
              const priceChange = history.newPrice - history.oldPrice;
              const changePercentage = (priceChange / history.oldPrice) * 100;

              return (
                <TableRow key={history.id}>
                  <TableCell>
                    {format(new Date(history.startDate), 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(history.oldPrice)}</TableCell>
                  <TableCell align="right">{formatCurrency(history.newPrice)}</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: priceChange > 0 ? 'success.main' : 'error.main',
                    }}
                  >
                    {priceChange > 0 ? '+' : ''}
                    {formatCurrency(priceChange)} ({changePercentage.toFixed(2)}%)
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PriceHistory; 