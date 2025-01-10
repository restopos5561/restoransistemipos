import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
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
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import accountService, { Account, CreateAccountInput } from '../../services/account.service';
import customersService from '../../services/customers.service';
import suppliersService from '../../services/suppliers.service';
import { useAuth } from '../../hooks/useAuth';

// Tip tanımlamaları
interface Customer {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface CustomerResponse {
  data: {
    customers: Array<{
      id: number;
      name: string;
      email?: string;
      phoneNumber?: string;
      address?: string;
      restaurantId: number;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  success: boolean;
}

interface SupplierResponse {
  suppliers: Array<{
    id: number;
    name: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    restaurantId: number;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateAccountInput>({
    restaurantId: profile?.restaurantId || 0,
    accountName: '',
    accountType: 'CUSTOMER',
    creditLimit: undefined,
    customerId: undefined,
    supplierId: undefined
  });

  // Müşteri ve tedarikçi listesi için state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Müşteri ve tedarikçileri getir
  const fetchRelatedData = async () => {
    try {
      setLoading(true);
      console.log('İlişkili Veriler - Yükleme başladı');

      const restaurantId = profile?.restaurantId;
      if (!restaurantId) {
        throw new Error('Restaurant ID bulunamadı');
      }

      const [customersResponse, suppliersResponse] = await Promise.all([
        customersService.getCustomers({ restaurantId }),
        suppliersService.getSuppliers({ restaurantId })
      ]);

      console.log('Müşteri Yanıtı:', customersResponse);
      console.log('Tedarikçi Yanıtı:', suppliersResponse);

      // Müşteri verilerini işle
      if (customersResponse?.data?.customers?.length > 0) {
        const mappedCustomers = customersResponse.data.customers.map((customer: Customer) => ({
          id: customer.id,
          name: customer.name
        }));
        console.log('İşlenmiş Müşteriler:', mappedCustomers);
        setCustomers(mappedCustomers);
      } else {
        console.warn('Müşteri verisi bulunamadı');
        setCustomers([]);
      }

      // Tedarikçi verilerini işle
      if (suppliersResponse?.suppliers?.length > 0) {
        const mappedSuppliers = suppliersResponse.suppliers.map((supplier: Supplier) => ({
          id: supplier.id,
          name: supplier.name
        }));
        console.log('İşlenmiş Tedarikçiler:', mappedSuppliers);
        setSuppliers(mappedSuppliers);
      } else {
        console.warn('Tedarikçi verisi bulunamadı');
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setError('Müşteri ve tedarikçi bilgileri yüklenirken bir hata oluştu');
      setCustomers([]);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  // Hesapları getir
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await accountService.getAccounts();
      setAccounts(response.data.accounts);
    } catch (error) {
      console.error('Hesaplar yüklenirken hata oluştu:', error);
      setError('Hesaplar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchRelatedData();
  }, []);

  // Dialog işlemleri
  const handleDialogOpen = (account?: Account) => {
    if (account) {
      setSelectedAccount(account);
      setFormData({
        restaurantId: profile?.restaurantId || 0,
        accountName: account.accountName,
        accountType: account.accountType,
        creditLimit: account.creditLimit,
        customerId: account.customerId,
        supplierId: account.supplierId
      });
    } else {
      setSelectedAccount(null);
      setFormData({
        restaurantId: profile?.restaurantId || 0,
        accountName: '',
        accountType: 'CUSTOMER',
        creditLimit: undefined,
        customerId: undefined,
        supplierId: undefined
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAccount(null);
    setFormData({
      restaurantId: profile?.restaurantId || 0,
      accountName: '',
      accountType: 'CUSTOMER',
      creditLimit: undefined,
      customerId: undefined,
      supplierId: undefined
    });
  };

  // Form işlemleri
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedAccount) {
        // Güncelleme işlemi
        await accountService.updateAccount(selectedAccount.id, formData);
      } else {
        // Yeni hesap oluşturma
        await accountService.createAccount(formData);
      }
      handleDialogClose();
      fetchAccounts();
    } catch (error) {
      console.error('Hesap kaydedilirken hata oluştu:', error);
      setError('Hesap kaydedilirken bir hata oluştu');
    }
  };

  // Hesap silme
  const handleDelete = async (id: number) => {
    if (window.confirm('Bu hesabı silmek istediğinizden emin misiniz?')) {
      try {
        await accountService.deleteAccount(id);
        fetchAccounts();
      } catch (error) {
        console.error('Hesap silinirken hata oluştu:', error);
        setError('Hesap silinirken bir hata oluştu');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Cari Hesaplar
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen()}
        >
          Yeni Hesap
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hesap Adı</TableCell>
              <TableCell>Hesap Türü</TableCell>
              <TableCell align="right">Bakiye</TableCell>
              <TableCell align="right">Kredi Limiti</TableCell>
              <TableCell align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.accountName}</TableCell>
                <TableCell>{account.accountType}</TableCell>
                <TableCell align="right">{account.balance.toFixed(2)} ₺</TableCell>
                <TableCell align="right">
                  {account.creditLimit ? `${account.creditLimit.toFixed(2)} ₺` : '-'}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/accounts/${account.id}`)}
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDialogOpen(account)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(account.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Hesap Ekleme/Düzenleme Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedAccount ? 'Hesap Düzenle' : 'Yeni Hesap'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2, minWidth: 400 }}>
              <TextField
                label="Hesap Adı"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Hesap Türü</InputLabel>
                <Select
                  value={formData.accountType}
                  onChange={(e) => {
                    const newType = e.target.value as 'CUSTOMER' | 'SUPPLIER' | 'REVENUE' | 'EXPENSE';
                    setFormData({
                      ...formData,
                      accountType: newType,
                      // Hesap türü değiştiğinde ilgili ID'leri sıfırla
                      customerId: undefined,
                      supplierId: undefined
                    });
                  }}
                >
                  <MenuItem value="CUSTOMER">Müşteri</MenuItem>
                  <MenuItem value="SUPPLIER">Tedarikçi</MenuItem>
                  <MenuItem value="REVENUE">Gelir</MenuItem>
                  <MenuItem value="EXPENSE">Gider</MenuItem>
                </Select>
              </FormControl>

              {/* Müşteri seçimi */}
              {formData.accountType === 'CUSTOMER' && (
                <FormControl fullWidth required>
                  <InputLabel>Müşteri</InputLabel>
                  <Select
                    value={formData.customerId || ''}
                    onChange={(e) => setFormData({ ...formData, customerId: Number(e.target.value) })}
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Tedarikçi seçimi */}
              {formData.accountType === 'SUPPLIER' && (
                <FormControl fullWidth required>
                  <InputLabel>Tedarikçi</InputLabel>
                  <Select
                    value={formData.supplierId || ''}
                    onChange={(e) => setFormData({ ...formData, supplierId: Number(e.target.value) })}
                  >
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                label="Kredi Limiti"
                type="number"
                value={formData.creditLimit || ''}
                onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || undefined })}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
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

export default AccountsPage; 