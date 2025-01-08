import React, { useState } from 'react';
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
  TextField,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import { Table as TableType, TableStatus, Order, TableHistory } from '../../types/table.types';

interface TableDetailDialogProps {
  open: boolean;
  onClose: () => void;
  table?: TableType;
  onUpdateNotes?: (tableId: number, notes: string) => void;
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

const getActionIcon = (action: TableHistory['action']) => {
  switch (action) {
    case 'STATUS_CHANGE':
      return <HistoryIcon color="primary" />;
    case 'ORDER_ADDED':
      return <AddCircleIcon color="success" />;
    case 'ORDER_COMPLETED':
      return <CheckCircleIcon color="success" />;
    case 'TRANSFER':
      return <SwapHorizIcon color="info" />;
    case 'MERGE':
      return <CallMergeIcon color="warning" />;
    default:
      return <HistoryIcon />;
  }
};

const getActionText = (history: TableHistory) => {
  switch (history.action) {
    case 'STATUS_CHANGE':
      return `Durum değiştirildi: ${getStatusText(history.status)}`;
    case 'ORDER_ADDED':
      return 'Yeni sipariş eklendi';
    case 'ORDER_COMPLETED':
      return 'Sipariş tamamlandı';
    case 'TRANSFER':
      return 'Masa transferi yapıldı';
    case 'MERGE':
      return 'Masa birleştirme işlemi yapıldı';
    default:
      return history.description;
  }
};

const TableDetailDialog: React.FC<TableDetailDialogProps> = ({
  open,
  onClose,
  table,
  onUpdateNotes,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  React.useEffect(() => {
    if (table) {
      setNotes(table.notes || '');
    }
  }, [table]);

  const handleSaveNotes = () => {
    if (table && onUpdateNotes) {
      onUpdateNotes(table.id, notes);
      setIsEditingNotes(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
        <Stack spacing={2}>
          {/* Üst Bilgiler */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4">{table.tableNumber}</Typography>
            <Chip
              label={getStatusText(table.status)}
              color={getStatusColor(table.status) as any}
            />
          </Stack>

          <Divider />

          {/* Sekmeler */}
          <Box>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Detaylar" />
              <Tab label="Geçmiş" />
            </Tabs>
          </Box>

          {/* Detaylar Sekmesi */}
          {activeTab === 0 && (
            <Grid container spacing={2}>
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

              {/* Notlar */}
              <Grid item xs={12}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary" variant="body2">
                    Masa Notları
                  </Typography>
                  {!isEditingNotes ? (
                    <IconButton size="small" onClick={() => setIsEditingNotes(true)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <Button
                      size="small"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveNotes}
                    >
                      Kaydet
                    </Button>
                  )}
                </Stack>
                {isEditingNotes ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Masa ile ilgili notları buraya girebilirsiniz..."
                    size="small"
                    margin="dense"
                  />
                ) : (
                  <Typography variant="body2" sx={{ mt: 1, minHeight: '3em' }}>
                    {table.notes || 'Not eklenmemiş'}
                  </Typography>
                )}
              </Grid>

              {/* Aktif Siparişler */}
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
          )}

          {/* Geçmiş Sekmesi */}
          {activeTab === 1 && (
            <List>
              {table.history && table.history.length > 0 ? (
                table.history.map((history) => (
                  <ListItem
                    key={history.id}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemIcon>
                      {getActionIcon(history.action)}
                    </ListItemIcon>
                    <ListItemText
                      primary={getActionText(history)}
                      secondary={
                        <Stack direction="column" spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(history.createdAt).toLocaleString('tr-TR')}
                          </Typography>
                          {history.createdBy && (
                            <Typography variant="caption" color="text.secondary">
                              İşlemi yapan: {history.createdBy.name}
                            </Typography>
                          )}
                          {history.description && (
                            <Typography variant="caption">
                              {history.description}
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography color="text.secondary" align="center">
                        Geçmiş bilgisi bulunamadı
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default TableDetailDialog; 