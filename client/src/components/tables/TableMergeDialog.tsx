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
  Stack,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { tablesService } from '../../services/tables.service';
import { Table, MergeTablesInput, TableStatus } from '../../types/table.types';

interface TableMergeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mainTable: Table | undefined;
  tables: Table[];
}

const TableMergeDialog: React.FC<TableMergeDialogProps> = ({
  open,
  onClose,
  onSuccess,
  mainTable,
  tables,
}) => {
  const { control, handleSubmit, reset, watch } = useForm<{ tableIdsToMerge: number[] }>({
    defaultValues: {
      tableIdsToMerge: [],
    },
  });

  const mergeMutation = useMutation({
    mutationFn: (data: MergeTablesInput) => tablesService.mergeTables(data),
    onSuccess: () => {
      reset();
      onSuccess();
    },
    onError: () => {
      toast.error('Masa birleştirme sırasında bir hata oluştu');
    },
  });

  const onSubmit = (data: { tableIdsToMerge: number[] }) => {
    if (!mainTable) return;

    mergeMutation.mutate({
      mainTableId: mainTable.id,
      tableIdsToMerge: data.tableIdsToMerge,
    });
  };

  // Birleştirilebilir masaları filtrele
  const availableTables = tables.filter(
    (table) =>
      table.id !== mainTable?.id && // Ana masa olmamalı
      table.status === TableStatus.OCCUPIED && // Dolu olmalı
      table.isActive // Aktif olmalı
  );

  const selectedTableIds = watch('tableIdsToMerge');

  if (!mainTable) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Masa Birleştirme</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Ana Masa
            </Typography>
            <Typography>
              {mainTable.tableNumber}
              {mainTable.location ? ` (${mainTable.location})` : ''}
            </Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel>Birleştirilecek Masalar</InputLabel>
            <Controller
              name="tableIdsToMerge"
              control={control}
              rules={{ required: 'En az bir masa seçilmeli' }}
              render={({ field }) => (
                <Select
                  {...field}
                  multiple
                  label="Birleştirilecek Masalar"
                  disabled={availableTables.length === 0}
                  renderValue={(selected) => (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                      {selected.map((value) => {
                        const table = tables.find((t) => t.id === value);
                        return (
                          <Chip
                            key={value}
                            label={`${table?.tableNumber}${
                              table?.location ? ` (${table.location})` : ''
                            }`}
                            size="small"
                          />
                        );
                      })}
                    </Stack>
                  )}
                >
                  {availableTables.length === 0 ? (
                    <MenuItem value={0} disabled>
                      Uygun masa bulunamadı
                    </MenuItem>
                  ) : (
                    availableTables.map((table) => (
                      <MenuItem key={table.id} value={table.id}>
                        {table.tableNumber}
                        {table.location ? ` (${table.location})` : ''}
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              mergeMutation.isPending ||
              availableTables.length === 0 ||
              selectedTableIds.length === 0
            }
          >
            {mergeMutation.isPending ? 'Birleştiriliyor...' : 'Birleştir'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TableMergeDialog; 