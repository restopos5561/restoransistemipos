import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import { TransferStockInput } from '@/types/stock.types';
import branchService from '@/services/branch.service';
import { useAuth } from '@/hooks/useAuth';

interface Branch {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

interface TransferStockDialogProps {
  open: boolean;
  onClose: () => void;
  onTransfer: (data: TransferStockInput) => void;
  currentBranchId: number;
  productId: number;
}

const TransferStockDialog: React.FC<TransferStockDialogProps> = ({
  open,
  onClose,
  onTransfer,
  currentBranchId,
  productId,
}) => {
  const { profile } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toBranchId, setToBranchId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await branchService.getBranches();
        setBranches(response.data.branches.filter(branch => branch.id !== currentBranchId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Şubeler yüklenirken bir hata oluştu';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchBranches();
      setToBranchId('');
      setQuantity('');
      setNotes('');
    }
  }, [open, currentBranchId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form ve Kullanıcı Bilgileri:', {
      toBranchId,
      quantity,
      currentBranchId,
      productId,
      userId: profile?.id,
      restaurantId: profile?.restaurantId
    });

    // Validation checks
    if (!profile?.id) {
      setError('Oturum bilgisi bulunamadı. Lütfen yeniden giriş yapın.');
      return;
    }

    if (!currentBranchId || currentBranchId === 0) {
      setError('Geçerli şube bilgisi bulunamadı. Lütfen şube seçin.');
      return;
    }

    if (!toBranchId) {
      setError('Lütfen hedef şube seçin.');
      return;
    }

    if (currentBranchId === toBranchId) {
      setError('Kaynak ve hedef şube aynı olamaz.');
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!quantity || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError('Lütfen geçerli bir miktar girin.');
      return;
    }

    if (!productId) {
      setError('Ürün bilgisi bulunamadı.');
      return;
    }

    const transferData = {
      fromBranchId: currentBranchId,
      toBranchId,
      productId,
      quantity: parsedQuantity,
      transferBy: profile.id,
      notes: notes || undefined,
    };

    console.log('Transfer verisi:', transferData);

    onTransfer(transferData);

    // Reset form
    setToBranchId('');
    setQuantity('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Stok Transferi</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : (
            <>
              <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                <InputLabel>Hedef Şube</InputLabel>
                <Select
                  value={toBranchId}
                  onChange={(e) => setToBranchId(e.target.value as number)}
                  label="Hedef Şube"
                  required
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </MenuItem>
                  ))}
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
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>İptal</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Transfer Et
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransferStockDialog; 