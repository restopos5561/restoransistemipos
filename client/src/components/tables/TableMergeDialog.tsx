import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
  Stack,
  Alert,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

import { tablesService } from '../../services/tables.service';
import { Table, TableStatus } from '../../types/table.types';

interface TableMergeDialogProps {
  open: boolean;
  onClose: () => void;
  tables: Table[];
}

interface MergeTablesFormInput {
  tableIds: string[];
}

export const TableMergeDialog: React.FC<TableMergeDialogProps> = ({ open, onClose, tables }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, watch, formState: { errors } } = useForm<MergeTablesFormInput>();
  const selectedTables = watch('tableIds') || [];

  const handleMergeTables = async (data: MergeTablesFormInput) => {
    if (selectedTables.length < 2) {
      setError('En az 2 masa seçmelisiniz');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!data.tableIds?.[0]) {
        throw new Error('Ana masa seçilmedi');
      }
      const mainTableId = parseInt(data.tableIds[0]);
      const tableIdsToMerge = data.tableIds
        .slice(1)
        .map(id => parseInt(id))
        .filter((id): id is number => !isNaN(id));

      if (isNaN(mainTableId)) {
        throw new Error('Geçersiz ana masa ID');
      }

      await tablesService.mergeTables({
        mainTableId,
        tableIdsToMerge
      });
      toast.success('Masalar başarıyla birleştirildi');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Masalar birleştirilirken bir hata oluştu');
      toast.error('Masalar birleştirilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Masaları Birleştir</DialogTitle>
      <form onSubmit={handleSubmit(handleMergeTables)}>
        <DialogContent>
          <Stack spacing={2}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            <FormControl fullWidth error={!!errors.tableIds}>
              <InputLabel>Masalar</InputLabel>
              <Controller
                name="tableIds"
                control={control}
                rules={{ required: 'En az 2 masa seçmelisiniz' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    multiple
                    renderValue={(selected: string[]) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const table = tables.find((t) => t.id.toString() === value);
                          return table ? (
                            <Chip
                              key={value}
                              label={`Masa ${table.tableNumber}`}
                              color="primary"
                              variant="outlined"
                            />
                          ) : null;
                        })}
                      </Box>
                    )}
                  >
                    {tables
                      .filter((table) => table.status === TableStatus.IDLE)
                      .map((table) => (
                        <MenuItem key={table.id} value={table.id.toString()}>
                          <Checkbox checked={selectedTables.includes(table.id.toString())} />
                          <ListItemText primary={`Masa ${table.tableNumber}`} />
                        </MenuItem>
                      ))}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            disabled={selectedTables.length < 2}
          >
            Birleştir
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TableMergeDialog; 