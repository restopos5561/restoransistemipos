import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack, Chip } from '@mui/material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Reservation } from '../../types/reservation.types';
import { ReservationStatus } from '../../types/enums';
import { useReservations } from '../../hooks/useReservations';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

interface ReservationDetailDialogProps {
  open: boolean;
  onClose: () => void;
  reservation: Reservation;
  onStatusChange?: (status: ReservationStatus) => void;
}

const STATUS_CONFIG = {
  [ReservationStatus.PENDING]: { color: 'warning', text: 'Beklemede' },
  [ReservationStatus.CONFIRMED]: { color: 'success', text: 'Onaylandı' },
  [ReservationStatus.CANCELLED]: { color: 'error', text: 'İptal Edildi' },
  [ReservationStatus.COMPLETED]: { color: 'info', text: 'Tamamlandı' },
} as const;

const ReservationDetailDialog: React.FC<ReservationDetailDialogProps> = ({
  open,
  onClose,
  reservation,
  onStatusChange
}) => {
  const { deleteReservation } = useReservations();
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy HH:mm', { locale: tr });
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu rezervasyonu silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteReservation(reservation.id);
      toast.success('Rezervasyon başarıyla silindi');
      onClose();
    } catch (error) {
      console.error('Rezervasyon silme hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Rezervasyon silinirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Rezervasyon Detayı</Typography>
          <Chip
            label={STATUS_CONFIG[reservation.status].text}
            color={STATUS_CONFIG[reservation.status].color}
            size="small"
          />
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography>
            <strong>Müşteri:</strong> {reservation.customer?.name}
          </Typography>
          <Typography>
            <strong>Başlangıç Zamanı:</strong> {formatDate(reservation.reservationStartTime)}
          </Typography>
          <Typography>
            <strong>Bitiş Zamanı:</strong> {formatDate(reservation.reservationEndTime)}
          </Typography>
          <Typography>
            <strong>Kişi Sayısı:</strong> {reservation.partySize}
          </Typography>
          {reservation.table && (
            <Typography>
              <strong>Masa:</strong> {reservation.table.tableNumber}
            </Typography>
          )}
          {reservation.notes && (
            <Typography>
              <strong>Notlar:</strong> {reservation.notes}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleDelete} 
          color="error"
          disabled={isLoading}
        >
          {isLoading ? 'Siliniyor...' : 'Sil'}
        </Button>
        {reservation.status === ReservationStatus.PENDING && onStatusChange && (
          <>
            <Button
              onClick={() => onStatusChange(ReservationStatus.CANCELLED)}
              color="error"
              disabled={isLoading}
            >
              İptal Et
            </Button>
            <Button
              onClick={() => onStatusChange(ReservationStatus.CONFIRMED)}
              color="success"
              disabled={isLoading}
            >
              Onayla
            </Button>
          </>
        )}
        {reservation.status === ReservationStatus.CONFIRMED && onStatusChange && (
          <Button
            onClick={() => onStatusChange(ReservationStatus.COMPLETED)}
            color="info"
            disabled={isLoading}
          >
            Tamamla
          </Button>
        )}
        <Button onClick={onClose} disabled={isLoading}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReservationDetailDialog; 