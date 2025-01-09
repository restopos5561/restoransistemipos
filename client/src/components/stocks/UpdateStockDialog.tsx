import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { Stock, StockTransactionType } from '@/types/stock.types';

interface UpdateStockDialogProps {
  open: boolean;
  onClose: () => void;
  stock: Stock | null;
  onUpdate: (id: number, data: { quantity: number; type: StockTransactionType; notes?: string }) => void;
}

const UpdateStockDialog: React.FC<UpdateStockDialogProps> = ({
  open,
  onClose,
  stock,
  onUpdate,
}) => {
  const [quantity, setQuantity] = useState<string>('');
  const [type, setType] = useState<StockTransactionType>('IN');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stock || !quantity) return;

    onUpdate(stock.id, {
      quantity: Number(quantity),
      type,
      notes: notes || undefined,
    });

    // Reset form
    setQuantity('');
    setType('IN');
    setNotes('');
    onClose();
  };

  if (!stock) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Stok Güncelle</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {stock.product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mevcut Miktar: {stock.quantity} {stock.product.unit}
            </Typography>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>İşlem Tipi</InputLabel>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as StockTransactionType)}
              label="İşlem Tipi"
              required
            >
              <MenuItem value="IN">Stok Girişi</MenuItem>
              <MenuItem value="OUT">Stok Çıkışı</MenuItem>
              <MenuItem value="ADJUSTMENT">Stok Düzeltme</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Miktar"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            sx={{ mb: 2 }}
            inputProps={{ min: 0, step: 0.01 }}
          />

          <TextField
            fullWidth
            label="Notlar"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button type="submit" variant="contained">
            Güncelle
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UpdateStockDialog; 