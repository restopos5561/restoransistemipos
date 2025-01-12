import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  Chip
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Add as AddIcon } from '@mui/icons-material';
import { Reservation } from '../../types/reservation.types';
import { ReservationStatus } from '../../types/enums';
import ReservationDialog from '../../components/reservations/ReservationDialog';
import ReservationDetailDialog from '../../components/reservations/ReservationDetailDialog';
import { useReservations } from '../../hooks/useReservations';

const STATUS_CONFIG: Record<ReservationStatus, { color: 'warning' | 'success' | 'error' | 'info'; text: string }> = {
  [ReservationStatus.PENDING]: { color: 'warning', text: 'Beklemede' },
  [ReservationStatus.CONFIRMED]: { color: 'success', text: 'Onaylandı' },
  [ReservationStatus.CANCELLED]: { color: 'error', text: 'İptal Edildi' },
  [ReservationStatus.COMPLETED]: { color: 'info', text: 'Tamamlandı' },
} as const;

const ReservationsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { reservations, isLoading, updateReservationStatus, fetchReservations } = useReservations();

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleStatusChange = async (status: ReservationStatus) => {
    if (selectedReservation) {
      await updateReservationStatus(selectedReservation.id, status);
      setIsDetailDialogOpen(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'customer',
      headerName: 'Müşteri',
      flex: 1,
      valueGetter: (params) => params.row.customer?.name || 'Bilinmiyor'
    },
    {
      field: 'reservationStartTime',
      headerName: 'Başlangıç',
      flex: 1,
      valueFormatter: (params) => format(new Date(params.value), 'dd MMM yyyy HH:mm', { locale: tr })
    },
    {
      field: 'reservationEndTime',
      headerName: 'Bitiş',
      flex: 1,
      valueFormatter: (params) => format(new Date(params.value), 'dd MMM yyyy HH:mm', { locale: tr })
    },
    {
      field: 'table',
      headerName: 'Masa',
      flex: 1,
      valueGetter: (params) => params.row.table ? `Masa ${params.row.table.tableNumber}` : '-'
    },
    {
      field: 'partySize',
      headerName: 'Kişi Sayısı',
      width: 100,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={STATUS_CONFIG[params.value as ReservationStatus].text}
          color={STATUS_CONFIG[params.value as ReservationStatus].color}
          size="small"
        />
      )
    }
  ];

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Rezervasyonlar</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            Yeni Rezervasyon
          </Button>
        </Box>

        <Card>
          <CardContent>
            <DataGrid
              rows={reservations}
              columns={columns}
              loading={isLoading}
              autoHeight
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25 }
                }
              }}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              onRowClick={(params) => {
                console.log('Seçilen rezervasyon:', params.row);
                setSelectedReservation(params.row);
                setIsDetailDialogOpen(true);
              }}
            />
          </CardContent>
        </Card>
      </Stack>

      <ReservationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchReservations}
      />

      {selectedReservation && (
        <ReservationDetailDialog
          open={isDetailDialogOpen}
          onClose={() => {
            setIsDetailDialogOpen(false);
            fetchReservations();
          }}
          reservation={selectedReservation}
          onStatusChange={handleStatusChange}
        />
      )}
    </Container>
  );
};

export default ReservationsPage; 