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
  height: '700px',
  position: 'relative',
  backgroundColor: alpha(theme.palette.background.default, 0.7),
  backgroundImage: `linear-gradient(${theme.palette.divider} 1px, transparent 1px),
    linear-gradient(90deg, ${theme.palette.divider} 1px, transparent 1px)`,
  backgroundSize: '20px 20px',
  overflow: 'hidden',
  cursor: 'default',
  borderRadius: '16px',
  boxShadow: theme.shadows[2],
  userSelect: 'none',
}));

const TableItem = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isDragging' && prop !== 'status',
})<{ isDragging?: boolean; status: TableStatus }>(({ theme, isDragging, status }) => ({
  position: 'absolute',
  width: '100px',
  height: '100px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: isDragging ? 'grabbing' : 'grab',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '12px',
  borderLeft: `6px solid ${
    status === TableStatus.IDLE
      ? theme.palette.success.main
      : status === TableStatus.OCCUPIED
      ? theme.palette.error.main
      : theme.palette.warning.main
  }`,
  boxShadow: isDragging ? theme.shadows[8] : theme.shadows[2],
  userSelect: 'none',
  touchAction: 'none',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
  '& .MuiTypography-subtitle1': {
    fontWeight: 600,
    color: theme.palette.text.primary,
    pointerEvents: 'none',
  },
  '& .MuiChip-root': {
    backgroundColor: alpha(
      status === TableStatus.IDLE
        ? theme.palette.success.main
        : status === TableStatus.OCCUPIED
        ? theme.palette.error.main
        : theme.palette.warning.main,
      0.1
    ),
    color: status === TableStatus.IDLE
      ? theme.palette.success.main
      : status === TableStatus.OCCUPIED
      ? theme.palette.error.main
      : theme.palette.warning.main,
    pointerEvents: 'none',
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

  // Çarpışma kontrolü için yardımcı fonksiyon
  const checkCollision = (x: number, y: number, currentTableId: number): boolean => {
    const TABLE_SIZE = 100; // Masa boyutu
    const MARGIN = 20; // Minimum boşluk

    return tables.some(table => {
      if (table.id === currentTableId) return false;
      
      const tableX = table.positionX ?? 0;
      const tableY = table.positionY ?? 0;

      // İki masa arasındaki mesafeyi kontrol et
      const xOverlap = Math.abs(x - tableX) < (TABLE_SIZE + MARGIN);
      const yOverlap = Math.abs(y - tableY) < (TABLE_SIZE + MARGIN);

      return xOverlap && yOverlap;
    });
  };

  // En yakın boş pozisyonu bul
  const findNearestValidPosition = (x: number, y: number, currentTableId: number): { x: number; y: number } => {
    const GRID_SIZE = 20;
    const MAX_SEARCH = 10; // Maksimum arama mesafesi (grid biriminde)
    
    // Başlangıç pozisyonunu ızgaraya hizala
    const startX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    const startY = Math.round(y / GRID_SIZE) * GRID_SIZE;
    
    // Spiral şeklinde arama yap
    for (let layer = 0; layer <= MAX_SEARCH; layer++) {
      // Üst satır
      for (let dx = -layer; dx <= layer; dx++) {
        const newX = startX + dx * GRID_SIZE;
        const newY = startY - layer * GRID_SIZE;
        if (!checkCollision(newX, newY, currentTableId)) {
          return { x: newX, y: newY };
        }
      }
      // Sağ sütun
      for (let dy = -layer + 1; dy <= layer; dy++) {
        const newX = startX + layer * GRID_SIZE;
        const newY = startY + dy * GRID_SIZE;
        if (!checkCollision(newX, newY, currentTableId)) {
          return { x: newX, y: newY };
        }
      }
      // Alt satır
      for (let dx = layer - 1; dx >= -layer; dx--) {
        const newX = startX + dx * GRID_SIZE;
        const newY = startY + layer * GRID_SIZE;
        if (!checkCollision(newX, newY, currentTableId)) {
          return { x: newX, y: newY };
        }
      }
      // Sol sütun
      for (let dy = layer - 1; dy >= -layer + 1; dy--) {
        const newX = startX - layer * GRID_SIZE;
        const newY = startY + dy * GRID_SIZE;
        if (!checkCollision(newX, newY, currentTableId)) {
          return { x: newX, y: newY };
        }
      }
    }
    
    // Eğer boş pozisyon bulunamazsa orijinal pozisyonu döndür
    return { x, y };
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    table: TableType,
    currentX: number,
    currentY: number
  ) => {
    if (!isEditing) return;
    
    e.preventDefault(); // Metin seçimini engelle
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
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

    e.preventDefault();
    const container = e.currentTarget.getBoundingClientRect();
    
    // Fare pozisyonunu container'a göre hesapla
    const x = Math.max(0, Math.min(e.clientX - container.left - draggedTable.offsetX, container.width - 100));
    const y = Math.max(0, Math.min(e.clientY - container.top - draggedTable.offsetY, container.height - 100));

    // Izgara hizalaması (20px'lik ızgara)
    const snappedX = Math.round(x / 20) * 20;
    const snappedY = Math.round(y / 20) * 20;

    // Çarpışma kontrolü ve en yakın uygun pozisyonu bul
    const validPosition = findNearestValidPosition(snappedX, snappedY, draggedTable.id);

    setDraggedTable(prev => ({
      ...prev!,
      currentX: validPosition.x,
      currentY: validPosition.y,
    }));
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggedTable && draggedTable.currentX !== undefined && draggedTable.currentY !== undefined) {
      e.preventDefault(); // Metin seçimini engelle
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
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" color="primary" fontWeight="600">
            Masa Yerleşim Planı
          </Typography>
          <Chip
            size="small"
            label={isEditing ? 'Düzenleme Modu' : 'Görüntüleme Modu'}
            color={isEditing ? 'warning' : 'default'}
            sx={{ ml: 1 }}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          {isEditing ? (
            <Tooltip title="Değişiklikleri Kaydet">
              <IconButton color="primary" onClick={onSaveClick}>
                <SaveIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Yerleşimi Düzenle">
              <IconButton color="primary" onClick={onEditClick}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
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
              zIndex: draggedTable?.id === table.id ? 1000 : 1,
            }}
            onMouseDown={(e) =>
              handleMouseDown(e, table, table.positionX || 0, table.positionY || 0)
            }
            onClick={() => !isEditing && onTableClick?.(table)}
          >
            <Typography variant="subtitle1">
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
                  color="error"
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