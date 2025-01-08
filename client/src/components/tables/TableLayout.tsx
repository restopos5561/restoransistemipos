import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Chip,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { Table as TableType, TableStatus } from '../../types/table.types';

interface TableLayoutProps {
  tables: TableType[];
  isEditing?: boolean;
  onTableClick?: (table: TableType) => void;
  onTableMove?: (tableId: number, position: { x: number; y: number }) => void;
  onEditClick?: () => void;
  onSaveClick?: () => void;
}

const LayoutContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '600px',
  position: 'relative',
  backgroundColor: alpha(theme.palette.background.default, 0.7),
  backgroundImage: `linear-gradient(${theme.palette.divider} 1px, transparent 1px),
    linear-gradient(90deg, ${theme.palette.divider} 1px, transparent 1px)`,
  backgroundSize: '20px 20px',
  overflow: 'hidden',
  cursor: 'default',
}));

const TableItem = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isDragging' && prop !== 'status',
})<{ isDragging?: boolean; status: TableStatus }>(({ theme, isDragging, status }) => ({
  position: 'absolute',
  width: '80px',
  height: '80px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: isDragging ? 'grabbing' : 'grab',
  transition: 'transform 0.2s, box-shadow 0.2s',
  backgroundColor: theme.palette.background.paper,
  borderLeft: `6px solid ${
    status === TableStatus.IDLE
      ? theme.palette.success.main
      : status === TableStatus.OCCUPIED
      ? theme.palette.error.main
      : theme.palette.warning.main
  }`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const TableLayout: React.FC<TableLayoutProps> = ({
  tables,
  isEditing = false,
  onTableClick,
  onTableMove,
  onEditClick,
  onSaveClick,
}) => {
  const [draggedTable, setDraggedTable] = useState<{
    id: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    currentX?: number;
    currentY?: number;
  } | null>(null);

  const handleMouseDown = (
    e: React.MouseEvent,
    table: TableType,
    currentX: number,
    currentY: number
  ) => {
    if (!isEditing) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDraggedTable({
      id: table.id,
      startX: currentX,
      startY: currentY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedTable || !isEditing) return;

    const container = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - container.left - draggedTable.offsetX;
    const y = e.clientY - container.top - draggedTable.offsetY;

    // Izgara hizalaması (20px'lik ızgara)
    const snappedX = Math.round(x / 20) * 20;
    const snappedY = Math.round(y / 20) * 20;

    // Sınırlar içinde tut
    const finalX = Math.max(0, Math.min(snappedX, container.width - 80));
    const finalY = Math.max(0, Math.min(snappedY, container.height - 80));

    setDraggedTable(prev => ({
      ...prev!,
      currentX: finalX,
      currentY: finalY,
    }));
  };

  const handleMouseUp = () => {
    if (draggedTable && draggedTable.currentX !== undefined && draggedTable.currentY !== undefined) {
      // Sadece konum değiştiyse güncelle
      if (draggedTable.currentX !== draggedTable.startX || draggedTable.currentY !== draggedTable.startY) {
        onTableMove?.(draggedTable.id, {
          x: draggedTable.currentX,
          y: draggedTable.currentY,
        });
      }
    }
    setDraggedTable(null);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">Masa Yerleşim Planı</Typography>
        {isEditing ? (
          <IconButton color="primary" onClick={onSaveClick}>
            <SaveIcon />
          </IconButton>
        ) : (
          <IconButton color="primary" onClick={onEditClick}>
            <EditIcon />
          </IconButton>
        )}
      </Stack>

      <LayoutContainer
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {tables.map((table) => (
          <TableItem
            key={table.id}
            status={table.status}
            style={{
              left: draggedTable?.id === table.id 
                ? draggedTable.currentX ?? table.positionX ?? 0 
                : table.positionX ?? 0,
              top: draggedTable?.id === table.id 
                ? draggedTable.currentY ?? table.positionY ?? 0 
                : table.positionY ?? 0,
            }}
            onMouseDown={(e) =>
              handleMouseDown(e, table, table.positionX || 0, table.positionY || 0)
            }
            onClick={() => !isEditing && onTableClick?.(table)}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {table.tableNumber}
            </Typography>
            <Chip
              size="small"
              label={`${table.capacity || '-'} Kişilik`}
              sx={{ mt: 0.5 }}
            />
            {table.activeOrders && table.activeOrders.length > 0 && (
              <Tooltip title={`${table.activeOrders.length} Aktif Sipariş`}>
                <RestaurantIcon
                  color="action"
                  fontSize="small"
                  sx={{ mt: 0.5 }}
                />
              </Tooltip>
            )}
          </TableItem>
        ))}
      </LayoutContainer>
    </Box>
  );
};

export default TableLayout; 