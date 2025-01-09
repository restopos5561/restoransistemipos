import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import accountService, { 
  Account, 
  AccountTransaction, 
  CreateTransactionInput 
} from '../../services/account.service';

const AccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateTransactionInput>({
    accountId: parseInt(id || '0'),
    amount: 0,
    type: 'CREDIT',
    description: '',
  });

  // Hesap detaylarını ve hareketleri getir
  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const accountId = parseInt(id || '0');
      if (!accountId) {
        setError('Geçersiz hesap ID');
        return;
      }

      const accountResponse = await accountService.getAccountById(accountId);

      if (!accountResponse.data) {
        setError('Hesap bilgileri alınamadı');
        return;
      }

      setAccount(accountResponse.data);
      setTransactions(accountResponse.data.transactions || []);
    } catch (error) {
      console.error('Hesap detayları yüklenirken hata oluştu:', error);
      setError('Hesap detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAccountDetails();
    }
  }, [id]);

  // Dialog işlemleri
  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setFormData({
      accountId: parseInt(id || '0'),
      amount: 0,
      type: 'CREDIT',
      description: '',
    });
  };

  // Form işlemleri
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await accountService.createTransaction(formData);
      handleDialogClose();
      fetchAccountDetails();
    } catch (error) {
      console.error('İşlem kaydedilirken hata oluştu:', error);
      setError('İşlem kaydedilirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!account) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Hesap bulunamadı</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          {account.accountName}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleDialogOpen}
        >
          Yeni İşlem
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Hesap Özeti */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle1">Hesap Türü</Typography>
            <Typography>{account.accountType}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle1">Güncel Bakiye</Typography>
            <Typography
              color={account.balance >= 0 ? 'success.main' : 'error.main'}
              fontWeight="bold"
            >
              {account.balance.toFixed(2)} ₺
            </Typography>
          </Stack>
          {account.creditLimit && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle1">Kredi Limiti</Typography>
              <Typography>{account.creditLimit.toFixed(2)} ₺</Typography>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* İşlem Listesi */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tarih</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell align="right">Tutar</TableCell>
                <TableCell>İşlem Türü</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), 'dd MMMM yyyy HH:mm', { locale: tr })}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell align="right">
                      <Typography
                        color={transaction.type === 'CREDIT' ? 'success.main' : 'error.main'}
                      >
                        {transaction.amount.toFixed(2)} ₺
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {transaction.type === 'CREDIT' ? 'Tahsilat' : 'Ödeme'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="textSecondary">İşlem bulunamadı</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Yeni İşlem Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Yeni İşlem</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2, minWidth: 400 }}>
              <FormControl fullWidth required>
                <InputLabel>İşlem Türü</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'CREDIT' | 'DEBIT' })}
                >
                  <MenuItem value="CREDIT">Tahsilat</MenuItem>
                  <MenuItem value="DEBIT">Ödeme</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Tutar"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
              <TextField
                label="Açıklama"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>İptal</Button>
            <Button type="submit" variant="contained">
              Kaydet
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AccountDetailPage; 