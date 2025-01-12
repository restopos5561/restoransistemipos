import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Stack,
  useTheme,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import GridOnIcon from '@mui/icons-material/GridOn';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { tablesService } from '../../services/tables.service';
import ordersService from '../../services/orders.service';
import { authService } from '../../services/auth.service';
import { TableStatus, TableFilters as TableFiltersType, Table } from '../../types/table.types';
import {
  TableList,
  TableGrid,
  TableFilters as TableFiltersComponent,
  TableStats,
  TableFormDialog,
  TableTransferDialog,
  TableMergeDialog,
  TableDetailDialog,
  TableMergeWizard,
  TableLayout,
} from '../../components/tables';
import { useConfirm } from '../../hooks';
import { useAuth } from '@/hooks/useAuth';
import { SocketService } from '@/services/socket';
import { SOCKET_EVENTS } from '@/constants/socketEvents';
import ReservationDialog from '../../components/reservations/ReservationDialog';
import { ReservationStatus } from '../../types/enums';
import { CreateReservationInput } from '../../types/reservation.types';

type ViewMode = 'list' | 'grid' | 'layout';

const TablesPage = (): JSX.Element => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { user } = useAuth();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isEditingLayout, setIsEditingLayout] = useState(false);

  // Dialog state'leri
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | undefined>(undefined);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [selectedTableForReservation, setSelectedTableForReservation] = useState<Table | undefined>(undefined);

  // Filtreler
  const [filters, setFilters] = useState<TableFiltersType>({
    status: undefined,
    isActive: true,
    page: 1,
    limit: 10,
    branchId: 0
  });

  // Seçili şube bilgisini al
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
  });

  // Şube değiştiğinde filtreyi güncelle
  React.useEffect(() => {
    if (profileData?.branchId) {
      setFilters(prev => ({
        ...prev,
        branchId: profileData.branchId
      }));
    }
  }, [profileData?.branchId]);

  // Masaları getir - branchId zorunlu olmalı
  const { data: tablesData, isLoading } = useQuery({
    queryKey: ['tables', filters],
    queryFn: () => {
      if (!filters.branchId) {
        return Promise.reject(new Error('Şube seçilmedi'));
      }
      console.log('🔵 [TablesPage] Masalar getiriliyor:', { filters });
      return tablesService.getTables(filters).then(response => {
        console.log('✅ [TablesPage] Masalar:', {
          tables: response.data.tables.map(table => ({
            id: table.id,
            tableNumber: table.tableNumber,
            status: table.status,
            activeOrders: table.activeOrders?.map(order => ({
              id: order.id,
              orderNumber: order.orderNumber,
              status: order.status,
              totalAmount: order.totalAmount,
              itemCount: order.orderItems?.length
            }))
          }))
        });
        return response;
      });
    },
    refetchInterval: 30000,
    enabled: filters.branchId > 0
  });

  // Masa siparişlerini getir
  const { data: tableOrders } = useQuery({
    queryKey: ['table-orders', selectedTable?.id],
    queryFn: () => {
      if (!selectedTable?.id) return null;
      return ordersService.getOrdersByTable(selectedTable.id);
    },
    enabled: !!selectedTable?.id,
  });

  // İstatistikler için şube bilgisi
  const selectedBranch = profileData ? {
    id: profileData.branchId,
    name: profileData.name
  } : null;

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

  // Masa durumu değiştirme mutation'ı
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TableStatus }) =>
      tablesService.updateTableStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Masa durumu başarıyla güncellendi');
    },
    onError: () => {
      toast.error('Masa durumu güncellenirken bir hata oluştu');
    },
  });

  // Masa birleştirme mutation'ı
  const mergeMutation = useMutation({
    mutationFn: async ({ mainTableId, tableIdsToMerge }: { mainTableId: number; tableIdsToMerge: number[] }) => {
      await tablesService.mergeTables({ mainTableId, tableIdsToMerge });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Masalar başarıyla birleştirildi');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Masalar birleştirilirken bir hata oluştu');
    },
  });

  // Masa notu güncelleme mutation'ı
  const updateNotesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      tablesService.updateTable(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Masa notu başarıyla güncellendi');
    },
    onError: () => {
      toast.error('Masa notu güncellenirken bir hata oluştu');
    },
  });

  // Masa konumu güncelleme mutation'ı
  const updatePositionMutation = useMutation({
    mutationFn: ({ id, position }: { id: number; position: { x: number; y: number } }) =>
      tablesService.updateTable(id, { 
        positionX: position.x,
        positionY: position.y,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: () => {
      toast.error('Masa konumu güncellenirken bir hata oluştu');
    },
  });

  const handleMerge = async (mainTableId: number, tableIdsToMerge: number[]) => {
    await mergeMutation.mutateAsync({ mainTableId, tableIdsToMerge });
  };

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

  const handleDetailClick = (table: Table) => {
    setSelectedTable(table);
    setIsDetailDialogOpen(true);
  };

  const handleOrdersClick = (table: Table) => {
    setSelectedTable(table);
    setIsDetailDialogOpen(true);
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

  const handleStatusChange = (table: Table, newStatus: TableStatus) => {
    updateStatusMutation.mutate({ id: table.id, status: newStatus });
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleUpdateNotes = (tableId: number, notes: string) => {
    updateNotesMutation.mutate({ id: tableId, notes });
  };

  const handleTableMove = (tableId: number, position: { x: number; y: number }) => {
    updatePositionMutation.mutate({ id: tableId, position });
  };

  const handleQuickReservation = (table: Table) => {
    setSelectedTableForReservation(table);
    setIsReservationDialogOpen(true);
  };

  // Socket.IO event dinleyicileri
  useEffect(() => {
    const socket = SocketService.getSocket();

    if (!socket || !user?.branchId) {
      console.error('🔌 [TablesPage] Socket bağlantısı veya kullanıcı bilgisi bulunamadı!');
      return;
    }

    console.log('🔌 [TablesPage] Socket.IO dinleyicileri ayarlanıyor');

    // Masa durumu değiştiğinde
    const handleTableStatusChanged = (data: any) => {
      console.log('🔌 [TablesPage] Masa durumu değişti:', {
        event: SOCKET_EVENTS.TABLE_STATUS_CHANGED,
        tableId: data.tableId,
        status: data.status
      });

      // Verileri yenile
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    };

    // Masa güncellendiğinde
    const handleTableUpdated = (data: any) => {
      console.log('🔌 [TablesPage] Masa güncellendi:', {
        event: SOCKET_EVENTS.TABLE_UPDATED,
        tableId: data.tableId
      });

      // Verileri yenile
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    };

    // Event dinleyicilerini ekle
    socket.on(SOCKET_EVENTS.TABLE_STATUS_CHANGED, handleTableStatusChanged);
    socket.on(SOCKET_EVENTS.TABLE_UPDATED, handleTableUpdated);

    // Cleanup function
    return () => {
      if (socket) {
        socket.off(SOCKET_EVENTS.TABLE_STATUS_CHANGED, handleTableStatusChanged);
        socket.off(SOCKET_EVENTS.TABLE_UPDATED, handleTableUpdated);
      }
    };
  }, [queryClient, user?.branchId]);

  if (isLoading || !selectedBranch) {
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
          <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="list">
                <ViewListIcon />
              </ToggleButton>
              <ToggleButton value="grid">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="layout">
                <GridOnIcon />
              </ToggleButton>
            </ToggleButtonGroup>

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
        {tablesData && selectedBranch && (
          <TableStats
            totalTables={tablesData.data.total}
            availableTables={tablesData.data.tables.filter(t => t.status === TableStatus.IDLE).length}
            occupiedTables={tablesData.data.tables.filter(t => t.status === TableStatus.OCCUPIED).length}
            reservedTables={tablesData.data.tables.filter(t => t.status === TableStatus.RESERVED).length}
            selectedBranch={selectedBranch}
          />
        )}

        {/* Filtreler */}
        <TableFiltersComponent
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Masa Listesi/Grid/Yerleşim */}
        {tablesData && (
          viewMode === 'list' ? (
            <TableList
              tables={tablesData.data.tables}
              totalPages={tablesData.data.totalPages}
              currentPage={filters.page || 1}
              onPageChange={handlePageChange}
              onEditClick={handleEditClick}
              onTransferClick={handleTransferClick}
              onMergeClick={handleMergeClick}
              onDeleteClick={handleDeleteClick}
              onDetailClick={handleDetailClick}
              onOrdersClick={handleOrdersClick}
            />
          ) : viewMode === 'grid' ? (
            <TableGrid
              tables={tablesData.data.tables}
              onEditClick={handleEditClick}
              onTransferClick={handleTransferClick}
              onMergeClick={handleMergeClick}
              onDeleteClick={handleDeleteClick}
              onDetailClick={handleDetailClick}
              onStatusChange={handleStatusChange}
              onOrdersClick={handleOrdersClick}
              onQuickReservation={handleQuickReservation}
            />
          ) : (
            <TableLayout
              tables={tablesData.data.tables}
              isEditing={isEditingLayout}
              onTableClick={handleDetailClick}
              onTableMove={handleTableMove}
              onEditClick={() => setIsEditingLayout(true)}
              onSaveClick={() => setIsEditingLayout(false)}
            />
          )
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
        branchId={filters.branchId}
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

      <TableMergeWizard
        open={isMergeDialogOpen}
        onClose={() => {
          setIsMergeDialogOpen(false);
          setSelectedTable(undefined);
        }}
        onMerge={handleMerge}
        mainTable={selectedTable}
        availableTables={tablesData?.data.tables || []}
      />

      <TableDetailDialog
        open={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false);
          setSelectedTable(undefined);
        }}
        table={selectedTable}
        onUpdateNotes={handleUpdateNotes}
        onOrdersClick={handleOrdersClick}
      />

      {/* Hızlı Rezervasyon Dialog'u */}
      {selectedTableForReservation && (
        <ReservationDialog
          open={isReservationDialogOpen}
          onClose={() => {
            setIsReservationDialogOpen(false);
            setSelectedTableForReservation(undefined);
          }}
          onSuccess={() => {
            setIsReservationDialogOpen(false);
            setSelectedTableForReservation(undefined);
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            toast.success('Rezervasyon başarıyla oluşturuldu');
          }}
          initialData={{
            tableId: selectedTableForReservation.id,
            restaurantId: user?.restaurantId || 0,
            branchId: user?.branchId || 0,
            customerId: 0,
            reservationStartTime: new Date().toISOString(),
            reservationEndTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            partySize: selectedTableForReservation.capacity || 1,
            status: ReservationStatus.PENDING
          } satisfies CreateReservationInput}
        />
      )}

      {/* Onay Dialog'u */}
      <confirm.ConfirmationDialog />
    </Container>
  );
};

export default TablesPage; 