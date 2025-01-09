import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  Box,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import useConfirm from '../../hooks/useConfirm';
import customersService from '../../services/customers.service';
import { Customer } from '../../types/customer.types';

interface CustomerListProps {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  total,
  page,
  limit,
  onPageChange,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const confirmDialog = useConfirm();

  console.log('CustomerList render:', { customers, total, page, limit });

  if (!Array.isArray(customers)) {
    console.error('Geçersiz customers verisi:', customers);
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography color="error">
          Müşteri verisi geçersiz format
        </Typography>
      </Box>
    );
  }

  if (customers.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Henüz cari bulunmuyor
        </Typography>
      </Box>
    );
  }

  const handleDelete = async (id: number) => {
    try {
      console.log('Silme butonu tıklandı - ID:', id);
      
      const confirmed = await confirmDialog({
        title: 'Cari Silme',
        message: 'Bu cariyi silmek istediğinize emin misiniz?',
        confirmText: 'Sil',
        cancelText: 'İptal'
      });
      
      if (!confirmed) {
        console.log('Silme işlemi kullanıcı tarafından iptal edildi');
        return;
      }

      console.log('Silme isteği gönderiliyor...');
      const result = await customersService.deleteCustomer(id);
      console.log('Silme işlemi sonucu:', result);
      
      if (result) {
        toast.success('Cari başarıyla silindi');
        console.log('Liste yenileniyor...');
        await onRefresh();
        console.log('Liste yenilendi');
      } else {
        throw new Error('Silme işlemi başarısız oldu');
      }
    } catch (error: any) {
      console.error('Silme hatası:', error);
      toast.error(error.message || 'Cari silinirken bir hata oluştu');
      
      // Hata durumunda listeyi yenile (isteğe bağlı)
      try {
        await onRefresh();
      } catch (refreshError) {
        console.error('Liste yenileme hatası:', refreshError);
      }
    }
  };

  console.log('Rendering customers:', customers);

  return (
    <>
      <confirmDialog.ConfirmationDialog />
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad Soyad</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Adres</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email || '-'}</TableCell>
                <TableCell>{customer.phoneNumber || '-'}</TableCell>
                <TableCell>{customer.address || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/customers/${customer.id}/edit`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      console.log('Silme butonu tıklandı - ID:', customer.id);
                      handleDelete(customer.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={limit}
        rowsPerPageOptions={[limit]}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
    </>
  );
};

export default CustomerList; 