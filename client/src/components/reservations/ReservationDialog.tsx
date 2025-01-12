import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Autocomplete } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { isValid } from 'date-fns';
import { CreateReservationInput, Reservation } from '../../types/reservation.types';
import { ReservationStatus } from '../../types/enums';
import { useReservations } from '../../hooks/useReservations';
import { useAuth } from '../../hooks/useAuth';
import customersService from '../../services/customers.service';
import tablesService from '../../services/tables.service';
import { Customer, CustomerListResponse } from '../../types/customer.types';
import { Table } from '../../types/table.types';
import { toast } from 'react-hot-toast';

interface ReservationDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: Reservation | CreateReservationInput;
  onSuccess?: () => void;
}

const ReservationDialog: React.FC<ReservationDialogProps> = ({ open, onClose, initialData, onSuccess }) => {
  const { createReservation, updateReservation } = useReservations();
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);

  const [formData, setFormData] = useState<CreateReservationInput>({
    restaurantId: user?.restaurantId || 0,
    customerId: 0,
    branchId: user?.branchId || 0,
    tableId: 0,
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

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoadingTables(true);
        if (user?.branchId && user?.restaurantId) {
          const response = await tablesService.getTables({
            branchId: user.branchId,
            restaurantId: user.restaurantId
          });
          if (response.success && response.data.tables) {
            setTables(response.data.tables);
          }
        }
      } catch (error) {
        console.error('Masalar yüklenirken hata:', error);
      } finally {
        setLoadingTables(false);
      }
    };

    if (open) {
      fetchTables();
    }
  }, [open, user?.branchId, user?.restaurantId]);

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

  const handleTableChange = (_event: any, newValue: Table | null) => {
    setSelectedTable(newValue);
    setFormData(prev => ({
      ...prev,
      tableId: newValue?.id || 0
    }));
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      alert('Lütfen bir müşteri seçin');
      return;
    }

    if (!selectedTable) {
      alert('Lütfen bir masa seçin');
      return;
    }

    const now = new Date();
    const startTime = new Date(formData.reservationStartTime);
    const endTime = new Date(formData.reservationEndTime);

    // Şu anki zamanı al (saat:dakika)
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotal = currentHour * 60 + currentMinute;

    // Seçilen başlangıç zamanını al (saat:dakika)
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const startTotal = startHour * 60 + startMinute;

    // Seçilen bitiş zamanını al (saat:dakika)
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();
    const endTotal = endHour * 60 + endMinute;

    // Tarih kontrolü (yıl-ay-gün)
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());

    // Eğer bugünün tarihiyse ve saat geçmişse
    if (startDate.getTime() === nowDate.getTime() && startTotal < currentTotal) {
      alert('Başlangıç saati geçmiş bir saat olamaz');
      return;
    }

    // Geçmiş tarih kontrolü
    if (startDate < nowDate) {
      alert('Başlangıç tarihi geçmiş bir tarih olamaz');
      return;
    }

    // Aynı gün içinde başlangıç ve bitiş saati kontrolü
    if (startTime.getTime() === endTime.getTime()) {
      alert('Başlangıç ve bitiş saati aynı olamaz');
      return;
    }

    // Bitiş saati başlangıç saatinden önce olamaz
    if (startDate.getTime() === new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate()).getTime() && endTotal <= startTotal) {
      alert('Bitiş saati başlangıç saatinden sonra olmalıdır');
      return;
    }

    try {
      if (initialData && 'id' in initialData) {
        console.log('🔵 [ReservationDialog] Rezervasyon güncelleniyor:', {
          id: initialData.id,
          data: formData
        });
        await updateReservation(initialData.id, {
          reservationStartTime: formData.reservationStartTime,
          reservationEndTime: formData.reservationEndTime,
          partySize: formData.partySize,
          tableId: formData.tableId,
          notes: formData.notes
        });
      } else {
        console.log('🔵 [ReservationDialog] Yeni rezervasyon oluşturuluyor:', formData);
        await createReservation(formData);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('❌ [ReservationDialog] Rezervasyon işlemi başarısız:', error);
      toast.error(error instanceof Error ? error.message : 'Rezervasyon işlemi sırasında bir hata oluştu');
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
            minDateTime={new Date()}
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

          <Autocomplete
            options={tables}
            getOptionLabel={(option) => `Masa ${option.tableNumber}`}
            value={selectedTable}
            onChange={handleTableChange}
            loading={loadingTables}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Masa Seç"
                required
                error={!selectedTable}
                helperText={!selectedTable ? 'Masa seçimi zorunludur' : ''}
              />
            )}
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