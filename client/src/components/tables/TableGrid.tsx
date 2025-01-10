import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Stack,
  IconButton,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
  Chip,
  alpha,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import InfoIcon from '@mui/icons-material/Info';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import ReceiptIcon from '@mui/icons-material/Receipt';

import { Table as TableType, TableStatus } from '../../types/table.types';

interface TableGridProps {
  tables: TableType[];
  onEditClick: (table: TableType) => void;
  onTransferClick: (table: TableType) => void;
  onMergeClick: (table: TableType) => void;
  onDeleteClick: (table: TableType) => void;
  onDetailClick: (table: TableType) => void;
  onStatusChange: (table: TableType, newStatus: TableStatus) => void;
  onOrdersClick: (table: TableType) => void;
}

const getStatusColor = (status: TableStatus) => {
  switch (status) {
    case TableStatus.IDLE:
      return '#2e7d32';
    case TableStatus.OCCUPIED:
      return '#d32f2f';
    case TableStatus.RESERVED:
      return '#ed6c02';
    default:
      return '#757575';
  }
};

const getStatusIcon = (status: TableStatus): React.ReactElement => {
  switch (status) {
    case TableStatus.IDLE:
      return <CheckCircleIcon />;
    case TableStatus.OCCUPIED:
      return <DoNotDisturbIcon />;
    case TableStatus.RESERVED:
      return <EventSeatIcon />;
    default:
      return <CheckCircleIcon />;
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

const TableCard: React.FC<{
  table: TableType;
  onEditClick: (table: TableType) => void;
  onTransferClick: (table: TableType) => void;
  onMergeClick: (table: TableType) => void;
  onDeleteClick: (table: TableType) => void;
  onDetailClick: (table: TableType) => void;
  onStatusChange: (table: TableType, newStatus: TableStatus) => void;
  onOrdersClick: (table: TableType) => void;
}> = ({
  table,
  onEditClick,
  onTransferClick,
  onMergeClick,
  onDeleteClick,
  onDetailClick,
  onStatusChange,
  onOrdersClick,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [statusAnchorEl, setStatusAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusClose = () => {
    setStatusAnchorEl(null);
  };

  return (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        borderLeft: 6,
        borderColor: getStatusColor(table.status),
      }}
    >
      {/* Üst Kısım */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">{table.tableNumber}</Typography>
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
        <IconButton size="small" onClick={handleMenuClick}>
          <MoreVertIcon />
        </IconButton>
      </Stack>

      {/* Orta Kısım */}
      <Box sx={{ flexGrow: 1, mt: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Kapasite:
            </Typography>
            <Typography>{table.capacity || '-'}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Konum:
            </Typography>
            <Typography>{table.location || '-'}</Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Alt Kısım */}
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Chip
            icon={getStatusIcon(table.status)}
            label={getStatusText(table.status)}
            size="small"
            onClick={handleStatusClick}
            sx={{ 
              backgroundColor: alpha(getStatusColor(table.status), 0.1),
              color: getStatusColor(table.status),
              '& .MuiChip-icon': {
                color: 'inherit'
              }
            }}
          />
          <Stack direction="row" spacing={1}>
            <IconButton 
              size="small" 
              onClick={() => onOrdersClick(table)}
              disabled={!table.activeOrders || table.activeOrders.length === 0}
            >
              <ReceiptIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDetailClick(table)}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {/* Hızlı Durum Değiştirme Butonları */}
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="Boş">
            <span>
              <IconButton
                size="small"
                onClick={() => onStatusChange(table, TableStatus.IDLE)}
                disabled={table.status === TableStatus.IDLE}
                sx={{
                  color: '#2e7d32',
                  bgcolor: table.status === TableStatus.IDLE ? alpha('#2e7d32', 0.1) : 'transparent',
                  '&:hover': {
                    bgcolor: alpha('#2e7d32', 0.1),
                  },
                }}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Dolu">
            <span>
              <IconButton
                size="small"
                onClick={() => onStatusChange(table, TableStatus.OCCUPIED)}
                disabled={table.status === TableStatus.OCCUPIED}
                sx={{
                  color: '#d32f2f',
                  bgcolor: table.status === TableStatus.OCCUPIED ? alpha('#d32f2f', 0.1) : 'transparent',
                  '&:hover': {
                    bgcolor: alpha('#d32f2f', 0.1),
                  },
                }}
              >
                <DoNotDisturbIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Rezerve">
            <span>
              <IconButton
                size="small"
                onClick={() => onStatusChange(table, TableStatus.RESERVED)}
                disabled={table.status === TableStatus.RESERVED}
                sx={{
                  color: '#ed6c02',
                  bgcolor: table.status === TableStatus.RESERVED ? alpha('#ed6c02', 0.1) : 'transparent',
                  '&:hover': {
                    bgcolor: alpha('#ed6c02', 0.1),
                  },
                }}
              >
                <EventSeatIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {/* İşlem Menüsü */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { handleClose(); onDetailClick(table); }}>
          <InfoIcon fontSize="small" sx={{ mr: 1 }} /> Detaylar
        </MenuItem>
        <MenuItem 
          onClick={() => { handleClose(); onOrdersClick(table); }}
          disabled={!table.activeOrders || table.activeOrders.length === 0}
        >
          <ReceiptIcon fontSize="small" sx={{ mr: 1 }} /> Adisyonlar
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); onEditClick(table); }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Düzenle
        </MenuItem>
        <MenuItem 
          onClick={() => { handleClose(); onTransferClick(table); }}
          disabled={table.status === TableStatus.IDLE}
        >
          <CompareArrowsIcon fontSize="small" sx={{ mr: 1 }} /> Transfer Et
        </MenuItem>
        <MenuItem 
          onClick={() => { handleClose(); onMergeClick(table); }}
          disabled={table.status === TableStatus.IDLE}
        >
          <CallMergeIcon fontSize="small" sx={{ mr: 1 }} /> Birleştir
        </MenuItem>
        <MenuItem 
          onClick={() => { handleClose(); onDeleteClick(table); }}
          disabled={table.status !== TableStatus.IDLE}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Sil
        </MenuItem>
      </Menu>

      {/* Durum Menüsü */}
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={handleStatusClose}
      >
        {Object.values(TableStatus).map((status) => (
          <MenuItem
            key={status}
            onClick={() => {
              handleStatusClose();
              onStatusChange(table, status);
            }}
            selected={table.status === status}
          >
            {getStatusIcon(status)}
            <Typography sx={{ ml: 1 }}>{getStatusText(status)}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
};

const TableGrid: React.FC<TableGridProps> = ({
  tables,
  onEditClick,
  onTransferClick,
  onMergeClick,
  onDeleteClick,
  onDetailClick,
  onStatusChange,
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
    <Grid container spacing={2}>
      {tables.map((table) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={table.id}>
          <TableCard
            table={table}
            onEditClick={onEditClick}
            onTransferClick={onTransferClick}
            onMergeClick={onMergeClick}
            onDeleteClick={onDeleteClick}
            onDetailClick={onDetailClick}
            onStatusChange={onStatusChange}
            onOrdersClick={onOrdersClick}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default TableGrid; 