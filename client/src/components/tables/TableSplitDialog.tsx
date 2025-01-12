import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { tablesService } from '@/services/tables.service';

const splitTableSchema = z.object({
  newCapacity: z.number().min(1).max(99).refine((val) => val > 0, {
    message: 'Kapasite 0\'dan büyük olmalıdır',
  }),
});

type SplitTableInput = z.infer<typeof splitTableSchema>;

interface TableSplitDialogProps {
  open: boolean;
  onClose: () => void;
  table: {
    id: number;
    capacity: number;
  };
}

export const TableSplitDialog = ({ open, onClose, table }: TableSplitDialogProps) => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<SplitTableInput>({
    resolver: zodResolver(splitTableSchema),
    defaultValues: {
      newCapacity: Math.floor(table.capacity / 2),
    },
  });

  const splitTableMutation = useMutation({
    mutationFn: (data: { newCapacity: number }) =>
      tablesService.splitTable(table.id.toString(), data.newCapacity),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.error?.message || 'Masa ayrılırken bir hata oluştu');
        return;
      }
      
      toast.success('Masa başarıyla ayrıldı');
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Masa ayrılırken bir hata oluştu');
    }
  });

  const onSubmit = (data: SplitTableInput) => {
    if (data.newCapacity >= table.capacity) {
      setError('Yeni masa kapasitesi mevcut masadan küçük olmalıdır');
      return;
    }
    splitTableMutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Masa Ayır</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Yeni Masa Kapasitesi"
            type="number"
            fullWidth
            {...register('newCapacity', { valueAsNumber: true })}
            error={!!errors.newCapacity}
            helperText={errors.newCapacity?.message}
            InputProps={{
              inputProps: { min: 1, max: table.capacity - 1 }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={splitTableMutation.status === 'pending'}
          >
            Ayır
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 