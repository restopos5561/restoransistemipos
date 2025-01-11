import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  Box
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  LocalShipping as TruckIcon
} from '@mui/icons-material';
import { Stock } from '@/types/stock.types';
import { formatDate } from '@/lib/utils';

interface StockListProps {
  stocks: Stock[];
  onUpdateQuantity?: (stock: Stock) => void;
  onEdit?: (stock: Stock) => void;
  onManageSuppliers?: (stock: Stock) => void;
}

const StockList: React.FC<StockListProps> = ({ 
  stocks, 
  onUpdateQuantity, 
  onEdit,
  onManageSuppliers 
}) => {
  console.log('StockList stocks:', JSON.stringify(stocks, null, 2));

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ürün Adı</TableCell>
            <TableCell>Miktar</TableCell>
            <TableCell>Birim</TableCell>
            <TableCell>Alt Limit</TableCell>
            <TableCell>Tedarikçi</TableCell>
            <TableCell>Son Güncelleme</TableCell>
            <TableCell>Son Kullanma</TableCell>
            <TableCell align="right">İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stocks.map((stock) => (
            <TableRow key={stock.id}>
              <TableCell>{stock.product.name}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{stock.quantity}</span>
                  {stock.lowStockThreshold && stock.quantity <= stock.lowStockThreshold && (
                    <Chip label="Düşük Stok" color="error" size="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell>{stock.product.unit}</TableCell>
              <TableCell>{stock.lowStockThreshold || '-'}</TableCell>
              <TableCell>
                {stock.product.productSuppliers?.[0]?.supplier.name || '-'}
              </TableCell>
              <TableCell>{formatDate(stock.lastStockUpdate)}</TableCell>
              <TableCell>
                {stock.expirationDate ? formatDate(stock.expirationDate) : '-'}
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => onUpdateQuantity?.(stock)}
                    title="Stok Ekle/Çıkar"
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onEdit?.(stock)}
                    title="Düzenle"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onManageSuppliers?.(stock)}
                    title="Tedarikçileri Yönet"
                  >
                    <TruckIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StockList; 