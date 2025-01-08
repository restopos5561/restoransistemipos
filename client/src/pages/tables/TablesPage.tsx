import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { tablesService } from '../../services/tables.service';
import { TableStatus, TableFilters as TableFiltersType, Table } from '../../types/table.types';
import {
  TableList,
  TableFilters as TableFiltersComponent,
  TableStats,
  TableFormDialog,
  TableTransferDialog,
  TableMergeDialog,
} from '../../components/tables';
import { useConfirm } from '../../hooks';

const TablesPage: React.FC = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  // Dialog state'leri
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | undefined>(undefined);

  // Filtreler
  const [filters, setFilters] = useState<TableFiltersType>({
    status: undefined,
    isActive: true,
    page: 1,
    limit: 10
  });

  // Masaları getir
  const { data: tablesData, isLoading } = useQuery({
    queryKey: ['tables', filters],
    queryFn: () => tablesService.getTables(filters),
    refetchInterval: 30000,
  });

  // Masa silme mutation'ı
  const deleteMutation = useMutation({
    mutationFn: (id: number) => tablesService.deleteTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Masa başarıyla silindi');
    },
    onError: () => {
      toast.error('Masa silinirken bir hata oluştu');
    },
  });

  // Handler'lar
  const handleFilterChange = (newFilters: Partial<TableFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['tables'] });
  };

  const handleEditClick = (table: Table) => {
    setSelectedTable(table);
    setIsCreateDialogOpen(true);
  };

  const handleTransferClick = (table: Table) => {
    setSelectedTable(table);
    setIsTransferDialogOpen(true);
  };

  const handleMergeClick = (table: Table) => {
    setSelectedTable(table);
    setIsMergeDialogOpen(true);
  };

  const handleDeleteClick = async (table: Table) => {
    const result = await confirm({
      title: 'Masa Silme',
      message: `"${table.tableNumber}" numaralı masayı silmek istediğinize emin misiniz?`,
      confirmText: 'Sil',
      cancelText: 'İptal',
    });

    if (result) {
      deleteMutation.mutate(table.id);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        {/* Başlık ve Aksiyonlar */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5">Masalar</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Yeni Masa
            </Button>
          </Stack>
        </Stack>

        {/* İstatistikler */}
        {tablesData && (
          <TableStats
            totalTables={tablesData.data.total}
            availableTables={tablesData.data.tables.filter(t => t.status === TableStatus.IDLE).length}
            occupiedTables={tablesData.data.tables.filter(t => t.status === TableStatus.OCCUPIED).length}
            reservedTables={tablesData.data.tables.filter(t => t.status === TableStatus.RESERVED).length}
          />
        )}

        {/* Filtreler */}
        <TableFiltersComponent
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Masa Listesi */}
        {tablesData && (
          <TableList
            tables={tablesData.data.tables}
            totalPages={tablesData.data.totalPages}
            currentPage={filters.page || 1}
            onPageChange={handlePageChange}
            onEditClick={handleEditClick}
            onTransferClick={handleTransferClick}
            onMergeClick={handleMergeClick}
            onDeleteClick={handleDeleteClick}
          />
        )}
      </Stack>

      {/* Dialog'lar */}
      <TableFormDialog
        open={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setSelectedTable(undefined);
        }}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          setSelectedTable(undefined);
          queryClient.invalidateQueries({ queryKey: ['tables'] });
          toast.success(selectedTable ? 'Masa başarıyla güncellendi' : 'Masa başarıyla oluşturuldu');
        }}
        editData={selectedTable}
      />

      <TableTransferDialog
        open={isTransferDialogOpen}
        onClose={() => {
          setIsTransferDialogOpen(false);
          setSelectedTable(undefined);
        }}
        onSuccess={() => {
          setIsTransferDialogOpen(false);
          setSelectedTable(undefined);
          queryClient.invalidateQueries({ queryKey: ['tables'] });
          toast.success('Masa başarıyla transfer edildi');
        }}
        fromTable={selectedTable}
        tables={tablesData?.data.tables || []}
      />

      <TableMergeDialog
        open={isMergeDialogOpen}
        onClose={() => {
          setIsMergeDialogOpen(false);
          setSelectedTable(undefined);
        }}
        onSuccess={() => {
          setIsMergeDialogOpen(false);
          setSelectedTable(undefined);
          queryClient.invalidateQueries({ queryKey: ['tables'] });
          toast.success('Masalar başarıyla birleştirildi');
        }}
        mainTable={selectedTable}
        tables={tablesData?.data.tables || []}
      />

      {/* Onay Dialog'u */}
      <confirm.ConfirmationDialog />
    </Container>
  );
};

export default TablesPage; 