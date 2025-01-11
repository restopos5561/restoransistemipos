import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Autocomplete } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { isValid } from 'date-fns';
import { CreateReservationInput, Reservation } from '../../types/reservation.types';
import { ReservationStatus } from '../../types/enums';
import { useReservations } from '../../hooks/useReservations';
import { useAuth } from '../../hooks/useAuth';
import customersService from '../../services/customers.service';
import { Customer, CustomerListResponse } from '../../types/customer.types';

interface ReservationDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: Reservation;
}

const ReservationDialog: React.FC<ReservationDialogProps> = ({ open, onClose, initialData }) => {
  const { createReservation, updateReservation } = useReservations();
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateReservationInput>({
    restaurantId: user?.restaurantId || 0,
    customerId: 0,
    branchId: user?.branchId || 0,
    reservationStartTime: new Date().toISOString(),
    reservationEndTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    partySize: 1,
    status: ReservationStatus.PENDING
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await customersService.getCustomers({
          restaurantId: user?.restaurantId || 0,
          page: 1,
          limit: 100
        });
        if (response.success && response.data.customers) {
          setCustomers(response.data.customers);
        }
      } catch (error) {
        console.error('Müşteriler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchCustomers();
    }
  }, [open, user?.restaurantId]);

  const handleStartTimeChange = (newValue: Date | null) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        reservationStartTime: newValue.toISOString(),
        reservationEndTime: new Date(newValue.getTime() + 60 * 60 * 1000).toISOString()
      }));
    }
  };

  const handleEndTimeChange = (newValue: Date | null) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        reservationEndTime: newValue.toISOString()
      }));
    }
  };

  const handleCustomerChange = (_event: any, newValue: Customer | null) => {
    setSelectedCustomer(newValue);
    setFormData(prev => ({
      ...prev,
      customerId: newValue?.id || 0
    }));
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      alert('Lütfen bir müşteri seçin');
      return;
    }

    try {
      if (initialData) {
        await updateReservation(initialData.id, {
          reservationStartTime: formData.reservationStartTime,
          reservationEndTime: formData.reservationEndTime,
          partySize: formData.partySize,
          notes: formData.notes
        });
      } else {
        await createReservation(formData);
      }
      onClose();
    } catch (error) {
      console.error('Rezervasyon işlemi başarısız:', error);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        restaurantId: initialData.restaurantId,
        customerId: initialData.customerId,
        branchId: initialData.branchId,
        tableId: initialData.tableId,
        reservationStartTime: initialData.reservationStartTime,
        reservationEndTime: initialData.reservationEndTime,
        partySize: initialData.partySize,
        notes: initialData.notes,
        status: initialData.status
      });

      const customer = customers.find(c => c.id === initialData.customerId);
      setSelectedCustomer(customer || null);
    }
  }, [initialData, customers]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Rezervasyonu Düzenle' : 'Yeni Rezervasyon'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Autocomplete
            options={customers}
            getOptionLabel={(option) => `${option.name}${option.phoneNumber ? ` - ${option.phoneNumber}` : ''}`}
            value={selectedCustomer}
            onChange={handleCustomerChange}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Müşteri Seç"
                required
                error={!selectedCustomer}
                helperText={!selectedCustomer ? 'Müşteri seçimi zorunludur' : ''}
              />
            )}
          />

          <DateTimePicker
            label="Başlangıç Zamanı"
            value={new Date(formData.reservationStartTime)}
            onChange={handleStartTimeChange}
            format="dd MMMM yyyy HH:mm"
            ampm={false}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !isValid(new Date(formData.reservationStartTime)),
                helperText: !isValid(new Date(formData.reservationStartTime)) ? 'Geçersiz tarih' : undefined,
              },
            }}
          />

          <DateTimePicker
            label="Bitiş Zamanı"
            value={new Date(formData.reservationEndTime)}
            onChange={handleEndTimeChange}
            format="dd MMMM yyyy HH:mm"
            ampm={false}
            minDateTime={new Date(formData.reservationStartTime)}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !isValid(new Date(formData.reservationEndTime)),
                helperText: !isValid(new Date(formData.reservationEndTime)) ? 'Geçersiz tarih' : undefined,
              },
            }}
          />

          <TextField
            label="Kişi Sayısı"
            type="number"
            value={formData.partySize}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              partySize: parseInt(e.target.value)
            }))}
            InputProps={{ inputProps: { min: 1 } }}
            fullWidth
          />

          <TextField
            label="Notlar"
            multiline
            rows={4}
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              notes: e.target.value
            }))}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSubmit} variant="contained">
          {initialData ? 'Güncelle' : 'Oluştur'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReservationDialog; 