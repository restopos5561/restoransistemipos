import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import productsService from '../../services/products.service';
import { formatCurrency } from '../../utils/format';
import Loading from '../common/Loading/Loading';
import {
  ProductOption,
  ProductOptionGroup as IProductOptionGroup,
  ProductOptionGroupInput,
  ProductOptionInput,
} from '../../types/product.types';

interface ProductOptionsProps {
  productId: number;
}

interface OptionGroupFormData extends ProductOptionGroupInput {
  id?: number;
}

interface OptionFormData extends ProductOptionInput {
  id?: number;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({ productId }) => {
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<IProductOptionGroup | null>(null);
  const [selectedOption, setSelectedOption] = useState<OptionFormData | null>(null);
  const [groupFormData, setGroupFormData] = useState<OptionGroupFormData>({
    name: '',
    isRequired: false,
    minQuantity: 0,
    maxQuantity: 1,
  });
  const [optionFormData, setOptionFormData] = useState<OptionFormData>({
    optionGroupId: 0,
    name: '',
    priceAdjustment: 0,
  });

  const queryClient = useQueryClient();

  const { data: optionsData, isLoading } = useQuery({
    queryKey: ['product-options', productId],
    queryFn: () => productsService.getProductOptions(productId),
    select: (response) => {
      console.log('API Response:', response);
      if (response?.data?.data) {
        return response.data.data;
      }
      return [];
    }
  });

  console.log('Processed optionsData:', optionsData);

  const addGroupMutation = useMutation({
    mutationFn: (data: ProductOptionGroupInput) =>
      productsService.addProductOptionGroup(productId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['product-options', productId] });
      queryClient.refetchQueries({ queryKey: ['product-options', productId] });
      toast.success('Seçenek grubu başarıyla eklendi');
      handleCloseGroupDialog();
    },
    onError: () => {
      toast.error('Seçenek grubu eklenirken bir hata oluştu');
    },
  });

  const addOptionMutation = useMutation({
    mutationFn: (data: ProductOptionInput) => productsService.addProductOption(productId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['product-options', productId] });
      toast.success('Seçenek başarıyla eklendi');
      handleCloseOptionDialog();
    },
    onError: () => {
      toast.error('Seçenek eklenirken bir hata oluştu');
    },
  });

  const updateOptionMutation = useMutation({
    mutationFn: ({ optionId, data }: { optionId: number; data: ProductOptionInput }) =>
      productsService.updateProductOption(productId, optionId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['product-options', productId] });
      toast.success('Seçenek başarıyla güncellendi');
      handleCloseOptionDialog();
    },
    onError: () => {
      toast.error('Seçenek güncellenirken bir hata oluştu');
    },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: (optionId: number) => productsService.deleteProductOption(productId, optionId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['product-options', productId] });
      toast.success('Seçenek başarıyla silindi');
    },
    onError: () => {
      toast.error('Seçenek silinirken bir hata oluştu');
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: number) => productsService.deleteProductOptionGroup(productId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-options', productId] });
      toast.success('Seçenek grubu başarıyla silindi');
    },
    onError: (error: any) => {
      console.error('Seçenek grubu silme hatası:', error);
      toast.error(error?.response?.data?.message || 'Seçenek grubu silinirken bir hata oluştu');
    },
  });

  const handleOpenGroupDialog = () => {
    setGroupFormData({
      name: '',
      isRequired: false,
      minQuantity: 0,
      maxQuantity: 1,
    });
    setIsGroupDialogOpen(true);
  };

  const handleCloseGroupDialog = () => {
    setIsGroupDialogOpen(false);
    setSelectedGroup(null);
    setGroupFormData({
      name: '',
      isRequired: false,
      minQuantity: 0,
      maxQuantity: 1,
    });
  };

  const handleOpenOptionDialog = (group: IProductOptionGroup, option?: ProductOption) => {
    if (option) {
      setSelectedOption({
        id: option.id,
        optionGroupId: group.id,
        name: option.name,
        priceAdjustment: option.priceAdjustment,
      });
      setOptionFormData({
        optionGroupId: group.id,
        name: option.name,
        priceAdjustment: option.priceAdjustment,
      });
    } else {
      setSelectedOption(null);
      setOptionFormData({
        optionGroupId: group.id,
        name: '',
        priceAdjustment: 0,
      });
    }
    setIsOptionDialogOpen(true);
  };

  const handleCloseOptionDialog = () => {
    setIsOptionDialogOpen(false);
    setSelectedOption(null);
    setOptionFormData({
      optionGroupId: 0,
      name: '',
      priceAdjustment: 0,
    });
  };

  const handleSubmitGroup = (e: React.FormEvent) => {
    e.preventDefault();
    addGroupMutation.mutate(groupFormData);
  };

  const handleSubmitOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption) {
      updateOptionMutation.mutate({
        optionId: selectedOption.id!,
        data: optionFormData,
      });
    } else {
      addOptionMutation.mutate(optionFormData);
    }
  };

  const handleDeleteOption = (optionId: number) => {
    if (window.confirm('Bu seçeneği silmek istediğinize emin misiniz?')) {
      deleteOptionMutation.mutate(optionId);
    }
  };

  const handleDeleteGroup = (groupId: number) => {
    if (window.confirm('Bu seçenek grubunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve gruptaki tüm seçenekler silinecektir.')) {
      try {
        deleteGroupMutation.mutate(groupId);
      } catch (error) {
        console.error('Seçenek grubu silme işlemi başlatılırken hata:', error);
        toast.error('Seçenek grubu silme işlemi başlatılamadı');
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Seçenekler</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenGroupDialog}
        >
          Yeni Seçenek Grubu
        </Button>
      </Box>

      {!optionsData || optionsData.length === 0 ? (
        <Typography color="text.secondary" align="center">
          Henüz seçenek grubu eklenmemiş.
        </Typography>
      ) : (
        optionsData.map((group: IProductOptionGroup) => (
          <Accordion key={group.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <Typography>{group.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {group.isRequired ? '(Zorunlu)' : '(İsteğe bağlı)'} •{' '}
                  {group.minQuantity === group.maxQuantity
                    ? `${group.minQuantity} adet`
                    : `${group.minQuantity}-${group.maxQuantity} adet`}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGroup(group.id);
                  }}
                  color="error"
                  sx={{ ml: 'auto' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenOptionDialog(group)}
                >
                  Seçenek Ekle
                </Button>
              </Box>
              <List>
                {group.options?.map((option: ProductOption) => (
                  <ListItem key={option.id} divider>
                    <ListItemText
                      primary={option.name}
                      secondary={
                        option.priceAdjustment
                          ? `Fiyat farkı: ${formatCurrency(option.priceAdjustment)}`
                          : undefined
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenOptionDialog(group, option)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteOption(option.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {/* Seçenek Grubu Dialog */}
      <Dialog
        open={isGroupDialogOpen}
        onClose={handleCloseGroupDialog}
        maxWidth="sm"
        fullWidth
        aria-labelledby="option-group-dialog-title"
      >
        <form onSubmit={handleSubmitGroup}>
          <DialogTitle id="option-group-dialog-title">Yeni Seçenek Grubu</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Grup Adı"
                name="name"
                value={groupFormData.name}
                onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                required
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={groupFormData.isRequired}
                    onChange={(e) =>
                      setGroupFormData({ ...groupFormData, isRequired: e.target.checked })
                    }
                  />
                }
                label="Zorunlu"
              />
              <TextField
                fullWidth
                type="number"
                label="Minimum Seçim"
                name="minQuantity"
                value={groupFormData.minQuantity}
                onChange={(e) =>
                  setGroupFormData({
                    ...groupFormData,
                    minQuantity: parseInt(e.target.value) || 0,
                  })
                }
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Maksimum Seçim"
                name="maxQuantity"
                value={groupFormData.maxQuantity}
                onChange={(e) =>
                  setGroupFormData({
                    ...groupFormData,
                    maxQuantity: parseInt(e.target.value) || 1,
                  })
                }
                inputProps={{ min: 1 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseGroupDialog}>İptal</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={addGroupMutation.isPending}
            >
              {addGroupMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Seçenek Dialog */}
      <Dialog
        open={isOptionDialogOpen}
        onClose={handleCloseOptionDialog}
        maxWidth="sm"
        fullWidth
        aria-labelledby="option-dialog-title"
      >
        <form onSubmit={handleSubmitOption}>
          <DialogTitle id="option-dialog-title">
            {selectedOption ? 'Seçenek Düzenle' : 'Yeni Seçenek'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Seçenek Adı"
                name="name"
                value={optionFormData.name}
                onChange={(e) => setOptionFormData({ ...optionFormData, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                type="number"
                label="Fiyat Farkı"
                name="priceAdjustment"
                value={optionFormData.priceAdjustment}
                onChange={(e) =>
                  setOptionFormData({
                    ...optionFormData,
                    priceAdjustment: parseFloat(e.target.value) || 0,
                  })
                }
                inputProps={{ step: 0.01 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseOptionDialog}>İptal</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={addOptionMutation.isPending || updateOptionMutation.isPending}
            >
              {addOptionMutation.isPending || updateOptionMutation.isPending
                ? 'Kaydediliyor...'
                : 'Kaydet'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ProductOptions; 