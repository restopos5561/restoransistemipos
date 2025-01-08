import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  IconButton,
  Stack,
  useTheme,
  alpha,
  ListItemIcon
} from '@mui/material';
import { Store, Close, ChevronRight } from '@mui/icons-material';

interface Branch {
  id: number;
  name: string;
}

interface BranchSelectionDialogProps {
  open: boolean;
  branches: Branch[];
  onClose: () => void;
  onSelect: (branchId: number) => void;
}

export const BranchSelectionDialog: React.FC<BranchSelectionDialogProps> = ({
  open,
  branches,
  onClose,
  onSelect,
}) => {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main
            }}
          >
            <Store />
          </Box>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={600}>
              Şube Seçin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Devam etmek için şubenizi seçin
            </Typography>
          </Stack>
        </Stack>
        <IconButton 
          onClick={onClose}
          sx={{ 
            color: theme.palette.text.secondary,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <List sx={{ 
          '& .MuiListItem-root': {
            p: 0.5
          }
        }}>
          {branches.map((branch) => (
            <ListItem key={branch.id} disablePadding>
              <ListItemButton
                onClick={() => onSelect(branch.id)}
                sx={{
                  borderRadius: 2,
                  py: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main
                    }
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ 
                      fontWeight: 500,
                      color: theme.palette.text.primary
                    }}>
                      {branch.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      Şube #{branch.id}
                    </Typography>
                  }
                />
                <ListItemIcon sx={{ 
                  minWidth: 'auto',
                  color: theme.palette.text.secondary
                }}>
                  <ChevronRight />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{
            minWidth: 120,
            borderRadius: 2,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          İptal
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 