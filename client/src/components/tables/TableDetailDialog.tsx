import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Grid,
  Chip,
  Stack,
  Divider,
  Box,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Table as TableType, TableStatus, Order } from '../../types/table.types';

interface TableDetailDialogProps {
  open: boolean;
  onClose: () => void;
  table?: TableType;
}

const getStatusColor = (status: TableStatus) => {
  switch (status) {
    case TableStatus.IDLE:
      return 'success';
    case TableStatus.OCCUPIED:
      return 'error';
    case TableStatus.RESERVED:
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusText = (status: TableStatus) => {
  switch (status) {
    case TableStatus.IDLE:
      return 'Boş';
    case TableStatus.OCCUPIED:
      return 'Dolu';
    case TableStatus.RESERVED:
      return 'Rezerve';
    default:
      return 'Bilinmiyor';
  }
};

const getOrderStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'READY':
      return 'success';
    case 'PREPARING':
      return 'warning';
    case 'PENDING':
      return 'info';
    default:
      return 'default';
  }
};

const getOrderStatusText = (status: Order['status']) => {
  switch (status) {
    case 'READY':
      return 'Hazır';
    case 'PREPARING':
      return 'Hazırlanıyor';
    case 'PENDING':
      return 'Beklemede';
    case 'COMPLETED':
      return 'Tamamlandı';
    case 'CANCELLED':
      return 'İptal Edildi';
    default:
      return 'Bilinmiyor';
  }
};

const TableDetailDialog: React.FC<TableDetailDialogProps> = ({
  open,
  onClose,
  table,
}) => {
  if (!table) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Masa Detayları</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h4">{table.tableNumber}</Typography>
              <Chip
                label={getStatusText(table.status)}
                color={getStatusColor(table.status) as any}
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary" variant="body2">
              Kapasite
            </Typography>
            <Typography variant="body1">
              {table.capacity || 'Belirtilmemiş'}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary" variant="body2">
              Konum
            </Typography>
            <Typography variant="body1">
              {table.location || 'Belirtilmemiş'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography color="text.secondary" variant="body2">
              Şube
            </Typography>
            <Typography variant="body1">
              {table.branch?.name || 'Belirtilmemiş'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              Durum Bilgisi
            </Typography>
            <Box sx={{ mt: 1 }}>
              {table.status === TableStatus.OCCUPIED && (
                <Typography color="error">
                  • Masa şu anda dolu ve aktif siparişler mevcut
                </Typography>
              )}
              {table.status === TableStatus.RESERVED && (
                <Typography color="warning.main">
                  • Masa rezerve edilmiş durumda
                </Typography>
              )}
              {table.status === TableStatus.IDLE && (
                <Typography color="success.main">
                  • Masa müsait durumda
                </Typography>
              )}
            </Box>
          </Grid>

          {table.activeOrders && table.activeOrders.length > 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Aktif Siparişler
              </Typography>
              <Stack spacing={1}>
                {table.activeOrders.map((order) => (
                  <Paper key={order.id} variant="outlined" sx={{ p: 1.5 }}>
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="subtitle2">
                          {order.orderNumber}
                        </Typography>
                        <Chip
                          size="small"
                          label={getOrderStatusText(order.status)}
                          color={getOrderStatusColor(order.status)}
                        />
                      </Stack>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" color="text.secondary">
                          Toplam Tutar
                        </Typography>
                        <Typography variant="body2">
                          {order.totalAmount.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(order.createdAt).toLocaleString('tr-TR')}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default TableDetailDialog; 