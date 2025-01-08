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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CallMergeIcon from '@mui/icons-material/CallMerge';

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
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tables.map((table) => (
              <TableRow key={table.id}>
                <TableCell>{table.tableNumber}</TableCell>
                <TableCell>{table.capacity}</TableCell>
                <TableCell>{table.location || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(table.status)}
                    color={getStatusColor(table.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
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