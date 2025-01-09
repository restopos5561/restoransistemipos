import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Typography,
  Avatar,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import productsService from '../../services/products.service';
import { useConfirm } from '../../hooks/useConfirm';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/format';
import { Product, ProductListResponse } from '../../types/product.types';

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const confirm = useConfirm();

  const { data, error, refetch } = useQuery<ProductListResponse>({
    queryKey: ['products', page, rowsPerPage],
    queryFn: () => productsService.getProducts({ page: page + 1, limit: rowsPerPage }),
  });

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Ürün Silme',
      message: 'Bu ürünü silmek istediğinizden emin misiniz?',
      confirmText: 'Sil',
      cancelText: 'İptal',
    });

    if (confirmed) {
      try {
        await productsService.deleteProduct(id);
        toast.success('Ürün başarıyla silindi');
        refetch();
      } catch (error) {
        toast.error('Ürün silinirken bir hata oluştu');
      }
    }
  };

  if (error) {
    return <Typography color="error">Ürünler yüklenirken bir hata oluştu.</Typography>;
  }

  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Resim</TableCell>
              <TableCell>Ürün Adı</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell align="right">Fiyat</TableCell>
              <TableCell align="right">Stok</TableCell>
              <TableCell align="center">Durum</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data.products.map((product: Product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Avatar
                    src={product.image ? `http://localhost:3002${product.image}` : undefined}
                    alt={product.name}
                    variant="rounded"
                    sx={{ width: 40, height: 40 }}
                  >
                    {!product.image && product.name.charAt(0)}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography
                    component="a"
                    href={`/products/${product.id}`}
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      },
                    }}
                  >
                    {product.name}
                  </Typography>
                </TableCell>
                <TableCell>{product.category?.name || '-'}</TableCell>
                <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                <TableCell align="right">
                  {product.stockTracking
                    ? product.stocks?.[0]?.quantity || 0
                    : 'Takip Edilmiyor'}
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    sx={{
                      color: product.isActive ? 'success.main' : 'error.main',
                    }}
                  >
                    {product.isActive ? 'Aktif' : 'Pasif'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Düzenle">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sil">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(product.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data?.data.total || 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Sayfa başına satır:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
    </Card>
  );
};

export default ProductList; 