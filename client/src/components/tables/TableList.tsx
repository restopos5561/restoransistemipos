import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  Tooltip,
  Pagination,
  Box,
  Typography,
  Chip,
  Badge,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import InfoIcon from '@mui/icons-material/Info';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ReceiptIcon from '@mui/icons-material/Receipt';

import { Table as TableType, TableStatus } from '../../types/table.types';

interface TableListProps {
  tables: TableType[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEditClick: (table: TableType) => void;
  onTransferClick: (table: TableType) => void;
  onMergeClick: (table: TableType) => void;
  onDeleteClick: (table: TableType) => void;
  onDetailClick: (table: TableType) => void;
  onOrdersClick: (table: TableType) => void;
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

const TableList: React.FC<TableListProps> = ({
  tables,
  totalPages,
  currentPage,
  onPageChange,
  onEditClick,
  onTransferClick,
  onMergeClick,
  onDeleteClick,
  onDetailClick,
  onOrdersClick,
}) => {
  if (!tables.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography color="text.secondary">
          Gösterilecek masa bulunamadı
        </Typography>
      </Box>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Masa No</TableCell>
              <TableCell>Kapasite</TableCell>
              <TableCell>Konum</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Aktif Siparişler</TableCell>
              <TableCell>Şube</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tables.map((table) => (
              <TableRow 
                key={table.id}
                sx={{
                  backgroundColor: table.status === TableStatus.OCCUPIED ? 
                    'rgba(211, 47, 47, 0.04)' : 'inherit'
                }}
              >
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {table.tableNumber}
                    {table.activeOrders && table.activeOrders.length > 0 && (
                      <Badge 
                        badgeContent={table.activeOrders.length} 
                        color="error"
                        sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem' } }}
                      >
                        <RestaurantIcon color="action" fontSize="small" />
                      </Badge>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>{table.capacity}</TableCell>
                <TableCell>{table.location || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(table.status)}
                    color={getStatusColor(table.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {table.activeOrders && table.activeOrders.length > 0 ? (
                    <Stack spacing={1}>
                      {table.activeOrders.map((order) => (
                        <Chip
                          key={order.id}
                          size="small"
                          label={`${order.orderNumber} (${order.status})`}
                          color={
                            order.status === 'READY' ? 'success' :
                            order.status === 'PREPARING' ? 'warning' : 'default'
                          }
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aktif sipariş yok
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {table.branch?.name || '-'}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Detaylar">
                      <IconButton
                        size="small"
                        onClick={() => onDetailClick(table)}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Adisyonlar">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => onOrdersClick(table)}
                          disabled={!table.activeOrders || table.activeOrders.length === 0}
                        >
                          <ReceiptIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Düzenle">
                      <IconButton
                        size="small"
                        onClick={() => onEditClick(table)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Transfer Et">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => onTransferClick(table)}
                          disabled={table.status === TableStatus.IDLE}
                        >
                          <CompareArrowsIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Birleştir">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => onMergeClick(table)}
                          disabled={table.status === TableStatus.IDLE}
                        >
                          <CallMergeIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Sil">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => onDeleteClick(table)}
                          disabled={table.status !== TableStatus.IDLE}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
          />
        </Box>
      )}
    </Paper>
  );
};

export default TableList; 