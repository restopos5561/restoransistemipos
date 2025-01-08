import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Table } from '../../types/table.types';
import { tablesService } from '../../services/tables.service';

interface TableFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: Table;
}

const TableFormDialog: React.FC<TableFormDialogProps> = ({
  open,
  onClose,
  onSuccess,
  editData,
}) => {
  const [formData, setFormData] = React.useState({
    tableNumber: '',
    capacity: '',
    location: '',
  });

  React.useEffect(() => {
    if (editData) {
      setFormData({
        tableNumber: editData.tableNumber,
        capacity: String(editData.capacity),
        location: editData.location || '',
      });
    } else {
      setFormData({
        tableNumber: '',
        capacity: '',
        location: '',
      });
    }
  }, [editData]);

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      tablesService.createTable({
        ...data,
        capacity: Number(data.capacity),
        branchId: 1,
      }),
    onSuccess: () => {
      onSuccess();
      toast.success('Masa başarıyla oluşturuldu');
    },
    onError: () => {
      toast.error('Masa oluşturulurken bir hata oluştu');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      tablesService.updateTable(editData!.id, {
        ...data,
        capacity: Number(data.capacity),
      }),
    onSuccess: () => {
      onSuccess();
      toast.success('Masa başarıyla güncellendi');
    },
    onError: () => {
      toast.error('Masa güncellenirken bir hata oluştu');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tableNumber || !formData.capacity) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    if (editData) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {editData ? 'Masa Düzenle' : 'Yeni Masa Oluştur'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Masa Numarası"
              name="tableNumber"
              value={formData.tableNumber}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Kapasite"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Konum"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              placeholder="Örn: Salon, Teras, vb."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editData ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TableFormDialog; 