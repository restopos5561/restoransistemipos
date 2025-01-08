import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Table, TableStatus } from '../../types/table.types';
import { tablesService } from '../../services/tables.service';

interface TableTransferDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fromTable: Table | undefined;
  tables: Table[];
}

const TableTransferDialog: React.FC<TableTransferDialogProps> = ({
  open,
  onClose,
  onSuccess,
  fromTable,
  tables,
}) => {
  const [toTableId, setToTableId] = React.useState<number | ''>('');

  React.useEffect(() => {
    setToTableId('');
  }, [open]);

  const transferMutation = useMutation({
    mutationFn: () => {
      if (!fromTable || !toTableId) return Promise.reject('Invalid data');
      return tablesService.transferTable({
        fromTableId: fromTable.id,
        toTableId: Number(toTableId),
      });
    },
    onSuccess: () => {
      onSuccess();
      toast.success('Masa başarıyla transfer edildi');
    },
    onError: () => {
      toast.error('Masa transfer edilirken bir hata oluştu');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!toTableId) {
      toast.error('Lütfen hedef masayı seçin');
      return;
    }

    transferMutation.mutate();
  };

  const availableTables = tables.filter(
    (table) =>
      table.id !== fromTable?.id &&
      table.status !== TableStatus.IDLE &&
      table.status !== TableStatus.RESERVED
  );

  if (!fromTable) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Masa Transfer Et</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Kaynak Masa
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography variant="body1">
                Masa {fromTable.tableNumber}
              </Typography>
              <Chip
                label={
                  fromTable.status === TableStatus.OCCUPIED ? 'Dolu' : 'Rezerve'
                }
                color={
                  fromTable.status === TableStatus.OCCUPIED
                    ? 'error'
                    : 'warning'
                }
                size="small"
              />
            </Box>
          </Box>

          <FormControl fullWidth>
            <InputLabel id="to-table-label">Hedef Masa</InputLabel>
            <Select
              labelId="to-table-label"
              value={toTableId}
              label="Hedef Masa"
              onChange={(e) => setToTableId(e.target.value as number)}
            >
              {availableTables.map((table) => (
                <MenuItem key={table.id} value={table.id}>
                  Masa {table.tableNumber}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={transferMutation.isPending}
          >
            Transfer Et
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TableTransferDialog; 