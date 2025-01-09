import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Container,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TablePagination,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import suppliersService from '../../services/suppliers.service';
import { useConfirm } from '../../hooks/useConfirm';
import Loading from '../../components/common/Loading/Loading';

const SuppliersPage: React.FC = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  // Tedarikçileri getir
  const { data, isLoading, error } = useQuery({
    queryKey: ['suppliers', { search, page: page + 1, limit }],
    queryFn: () => suppliersService.getSuppliers({ search, page: page + 1, limit }),
  });

  // Tedarikçi silme işlemi
  const handleDelete = async (id: number) => {
    try {
      const confirmed = await confirm({
        title: 'Tedarikçi Sil',
        message: 'Bu tedarikçiyi silmek istediğinizden emin misiniz?',
        confirmText: 'Sil',
        cancelText: 'İptal',
      });

      if (confirmed) {
        await suppliersService.deleteSupplier(id);
        toast.success('Tedarikçi başarıyla silindi');
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      }
    } catch (error: any) {
      toast.error(error.message || 'Tedarikçi silinirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Typography color="error">
            Tedarikçiler yüklenirken bir hata oluştu
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="h4">Tedarikçiler</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/suppliers/new')}
          >
            Yeni Tedarikçi
          </Button>
        </Stack>

        <Card>
          <Stack spacing={2} sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="Tedarikçi Ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ad</TableCell>
                    <TableCell>İletişim Kişisi</TableCell>
                    <TableCell>Telefon</TableCell>
                    <TableCell>E-posta</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <Button
                          color="inherit"
                          onClick={() => navigate(`/suppliers/${supplier.id}`)}
                          sx={{ p: 0, textAlign: 'left' }}
                        >
                          {supplier.name}
                        </Button>
                      </TableCell>
                      <TableCell>{supplier.contactName || '-'}</TableCell>
                      <TableCell>{supplier.phone || '-'}</TableCell>
                      <TableCell>{supplier.email || '-'}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Düzenle">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/suppliers/${supplier.id}/edit`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(supplier.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={data?.total || 0}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} / ${count}`
              }
              labelRowsPerPage="Sayfa başına satır:"
            />
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default SuppliersPage; 