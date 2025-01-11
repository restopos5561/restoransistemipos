import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack, Chip } from '@mui/material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Reservation } from '../../types/reservation.types';
import { ReservationStatus } from '../../types/enums';

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
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy HH:mm', { locale: tr });
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
        {reservation.status === ReservationStatus.PENDING && onStatusChange && (
          <>
            <Button
              onClick={() => onStatusChange(ReservationStatus.CANCELLED)}
              color="error"
            >
              İptal Et
            </Button>
            <Button
              onClick={() => onStatusChange(ReservationStatus.CONFIRMED)}
              color="success"
            >
              Onayla
            </Button>
          </>
        )}
        {reservation.status === ReservationStatus.CONFIRMED && onStatusChange && (
          <Button
            onClick={() => onStatusChange(ReservationStatus.COMPLETED)}
            color="info"
          >
            Tamamla
          </Button>
        )}
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReservationDetailDialog; 