import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Autocomplete, CircularProgress } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { isValid } from 'date-fns';
import { 
  CreateReservationInput, 
  Reservation, 
  UpdateReservationResponse,
  CreateReservationResponse 
} from '../../types/reservation.types';
import { ReservationStatus } from '../../types/enums';
import { useReservations } from '../../hooks/useReservations';
import { useAuth } from '../../hooks/useAuth';
import customersService from '../../services/customers.service';
import tablesService from '../../services/tables.service';
import { Customer } from '../../types/customer.types';
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
        console.error('❌ [ReservationDialog] Müşteriler yüklenirken hata:', error);
        toast.error('Müşteriler yüklenirken bir hata oluştu');
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
        console.error('❌ [ReservationDialog] Masalar yüklenirken hata:', error);
        toast.error('Masalar yüklenirken bir hata oluştu');
      } finally {
        setLoadingTables(false);
      }
    };

    if (open) {
      fetchTables();
    }
  }, [open, user?.branchId, user?.restaurantId]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!selectedCustomer) {
      errors.customer = 'Müşteri seçimi zorunludur';
    }

    if (!selectedTable) {
      errors.table = 'Masa seçimi zorunludur';
    }

    if (!isValid(new Date(formData.reservationStartTime))) {
      errors.startTime = 'Geçerli bir başlangıç zamanı seçiniz';
    }

    if (!isValid(new Date(formData.reservationEndTime))) {
      errors.endTime = 'Geçerli bir bitiş zamanı seçiniz';
    }

    if (new Date(formData.reservationEndTime) <= new Date(formData.reservationStartTime)) {
      errors.endTime = 'Bitiş zamanı başlangıç zamanından sonra olmalıdır';
    }

    if (formData.partySize < 1) {
      errors.partySize = 'Kişi sayısı en az 1 olmalıdır';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStartTimeChange = (newValue: Date | null) => {
    if (newValue && isValid(newValue)) {
      setFormData(prev => ({
        ...prev,
        reservationStartTime: newValue.toISOString(),
        reservationEndTime: new Date(newValue.getTime() + 60 * 60 * 1000).toISOString()
      }));
      setFormErrors(prev => ({ ...prev, startTime: '' }));
    }
  };

  const handleEndTimeChange = (newValue: Date | null) => {
    if (newValue && isValid(newValue)) {
      setFormData(prev => ({
        ...prev,
        reservationEndTime: newValue.toISOString()
      }));
      setFormErrors(prev => ({ ...prev, endTime: '' }));
    }
  };

  const handleCustomerChange = (_event: any, newValue: Customer | null) => {
    setSelectedCustomer(newValue);
    setFormData(prev => ({
      ...prev,
      customerId: newValue?.id || 0
    }));
    setFormErrors(prev => ({ ...prev, customer: '' }));
  };

  const handleTableChange = (_event: any, newValue: Table | null) => {
    setSelectedTable(newValue);
    setFormData(prev => ({
      ...prev,
      tableId: newValue?.id || 0
    }));
    setFormErrors(prev => ({ ...prev, table: '' }));
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      console.log('🔵 [ReservationDialog] Form gönderiliyor:', formData);

      if (initialData && 'id' in initialData) {
        const response = await updateReservation(initialData.id, {
          tableId: formData.tableId,
          reservationStartTime: formData.reservationStartTime,
          reservationEndTime: formData.reservationEndTime,
          partySize: formData.partySize,
          notes: formData.notes
        }) as UpdateReservationResponse;

        if (response.success && response.data) {
          toast.success('Rezervasyon başarıyla güncellendi');
          onSuccess?.();
          onClose();
        }
      } else {
        const response = await createReservation(formData) as CreateReservationResponse;
        if (response.success && response.data) {
          toast.success('Rezervasyon başarıyla oluşturuldu');
          onSuccess?.();
          onClose();
        }
      }
    } catch (error) {
      console.error('❌ [ReservationDialog] Form gönderilirken hata:', error);
      toast.error(error instanceof Error ? error.message : 'Rezervasyon işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        restaurantId: initialData.restaurantId,
        customerId: initialData.customerId,
        branchId: initialData.branchId,
        tableId: initialData.tableId || 0,
        reservationStartTime: initialData.reservationStartTime,
        reservationEndTime: initialData.reservationEndTime,
        partySize: initialData.partySize,
        notes: initialData.notes,
        status: initialData.status
      });

      const customer = customers.find(c => c.id === initialData.customerId);
      setSelectedCustomer(customer || null);

      const table = tables.find(t => t.id === initialData.tableId);
      setSelectedTable(table || null);
    }
  }, [initialData, customers, tables]);

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
                error={!!formErrors.customer}
                helperText={formErrors.customer}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
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
                error: !!formErrors.startTime,
                helperText: formErrors.startTime,
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
                error: !!formErrors.endTime,
                helperText: formErrors.endTime,
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
                error={!!formErrors.table}
                helperText={formErrors.table}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingTables ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <TextField
            label="Kişi Sayısı"
            type="number"
            value={formData.partySize}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setFormData((prevData) => ({
                ...prevData,
                partySize: value
              }));
              setFormErrors((prevErrors) => ({ ...prevErrors, partySize: '' }));
            }}
            error={!!formErrors.partySize}
            helperText={formErrors.partySize}
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
        <Button onClick={onClose} disabled={loading}>İptal</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'İşleniyor...' : (initialData ? 'Güncelle' : 'Oluştur')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReservationDialog; 