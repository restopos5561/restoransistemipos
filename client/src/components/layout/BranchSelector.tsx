import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import branchService from '../../services/branch.service';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';

interface Branch {
  id: number;
  name: string;
}

const BranchSelector = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Şubeleri getir
  const { data: branchData } = useQuery({
    queryKey: ['userBranches'],
    queryFn: () => authService.getUserBranches(),
    enabled: !!profile?.id,
  });

  // Şube değiştirme mutation'ı
  const switchBranchMutation = useMutation({
    mutationFn: async (branchId: number) => {
      const branchLoginData = {
        email: profile?.email || '',
        branchId,
      };
      return authService.loginWithBranch(branchLoginData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setIsOpen(false);
      toast.success('Şube başarıyla değiştirildi');
    },
    onError: () => {
      toast.error('Şube değiştirme işlemi başarısız oldu');
    },
  });

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleBranchSelect = (branchId: number) => {
    if (branchId === profile?.branchId) {
      handleClose();
      return;
    }
    switchBranchMutation.mutate(branchId);
  };

  const currentBranch = branchData?.data?.branches?.find(
    (branch: Branch) => branch.id === profile?.branchId
  );

  const userBranches = branchData?.data?.branches || [];

  return (
    <>
      <Button
        onClick={handleOpen}
        startIcon={<StorefrontIcon />}
        sx={{
          color: theme.palette.text.secondary,
          background: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 2,
          py: 0.5,
          px: 1.5,
          '&:hover': {
            background: alpha(theme.palette.primary.main, 0.1),
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {currentBranch?.name || 'Şube Seç'}
        </Typography>
      </Button>

      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Şube Değiştir</DialogTitle>
        <DialogContent>
          <List>
            {userBranches.length > 0 ? (
              userBranches.map((branch: Branch) => (
                <ListItem key={branch.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleBranchSelect(branch.id)}
                    selected={branch.id === profile?.branchId}
                  >
                    <ListItemText
                      primary={branch.name}
                      secondary={branch.id === profile?.branchId ? '(Aktif)' : undefined}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Erişilebilir şube bulunamadı" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BranchSelector; 