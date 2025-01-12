import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  InputAdornment,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import customersService from '@/services/customers.service';
import { Customer } from '@/types/customer.types';
import { useAuth } from '@/hooks/useAuth';

interface CustomerSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
  selectedCustomerId?: number;
}

const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({
  open,
  onClose,
  onSelect,
  selectedCustomerId
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => customersService.getCustomers({
      search,
      restaurantId: Number(user?.restaurantId),
      branchId: Number(user?.branchId)
    }),
    enabled: open
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleClearSearch = () => {
    setSearch('');
  };

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Müşteri Seç</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Müşteri Ara..."
          value={search}
          onChange={handleSearchChange}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : data?.data?.customers?.length ? (
          <List sx={{ mt: 2 }}>
            {data.data.customers.map((customer) => (
              <ListItem
                key={customer.id}
                button
                selected={customer.id === selectedCustomerId}
                onClick={() => handleSelect(customer)}
              >
                <ListItemText
                  primary={customer.name}
                  secondary={customer.phoneNumber || customer.email}
                />
                <ListItemSecondaryAction>
                  {customer.id === selectedCustomerId && (
                    <IconButton edge="end" disabled>
                      <CheckIcon color="primary" />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {search ? 'Müşteri bulunamadı' : 'Henüz müşteri eklenmemiş'}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerSelectModal; 