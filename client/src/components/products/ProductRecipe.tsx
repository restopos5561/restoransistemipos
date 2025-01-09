import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import recipeService from '../../services/recipe.service';
import { formatCurrency } from '../../utils/format';
import { useConfirm } from '../../hooks/useConfirm';
import { useLoadingStore } from '../../store/loading/loadingStore';

interface Ingredient {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  waste: number;
}

interface ProductRecipeProps {
  productId: number;
}

const ProductRecipe: React.FC<ProductRecipeProps> = ({ productId }) => {
  const [open, setOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState<Ingredient>({
    name: '',
    quantity: 0,
    unit: 'adet',
    cost: 0,
    waste: 0,
  });

  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const setLoading = useLoadingStore((state) => state.setLoading);

  const { data: recipeData } = useQuery({
    queryKey: ['recipe', productId],
    queryFn: () => recipeService.getRecipeByProductId(productId),
  });

  const { data: costData } = useQuery({
    queryKey: ['recipe-cost', recipeData?.data?.id],
    queryFn: () => recipeData?.data?.id ? recipeService.calculateRecipeCost(recipeData.data.id) : null,
    enabled: !!recipeData?.data?.id,
  });

  const createRecipeMutation = useMutation({
    mutationFn: (data: { productId: number; ingredients: Ingredient[] }) =>
      recipeService.createRecipe(data),
    onSuccess: () => {
      toast.success('Reçete başarıyla oluşturuldu');
      queryClient.invalidateQueries({ queryKey: ['recipe', productId] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Reçete oluşturulurken bir hata oluştu');
    },
  });

  const updateRecipeMutation = useMutation({
    mutationFn: (data: { id: number; ingredients: Ingredient[] }) =>
      recipeService.updateRecipe(data.id, { ingredients: data.ingredients }),
    onSuccess: () => {
      toast.success('Reçete başarıyla güncellendi');
      queryClient.invalidateQueries({ queryKey: ['recipe', productId] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Reçete güncellenirken bir hata oluştu');
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: (id: number) => recipeService.deleteRecipe(id),
    onSuccess: () => {
      toast.success('Reçete başarıyla silindi');
      queryClient.invalidateQueries({ queryKey: ['recipe', productId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Reçete silinirken bir hata oluştu');
    },
  });

  const handleOpen = (ingredient?: Ingredient) => {
    if (ingredient) {
      setSelectedIngredient(ingredient);
      setFormData(ingredient);
    } else {
      setSelectedIngredient(null);
      setFormData({
        name: '',
        quantity: 0,
        unit: 'adet',
        cost: 0,
        waste: 0,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedIngredient(null);
    setFormData({
      name: '',
      quantity: 0,
      unit: 'adet',
      cost: 0,
      waste: 0,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const recipe = recipeData?.data;

      if (recipe) {
        const updatedIngredients = selectedIngredient
          ? recipe.ingredients.map((ing) =>
              ing.id === selectedIngredient.id ? { ...formData, id: ing.id } : ing
            )
          : [...recipe.ingredients, formData];

        await updateRecipeMutation.mutateAsync({
          id: recipe.id,
          ingredients: updatedIngredients,
        });
      } else {
        await createRecipeMutation.mutateAsync({
          productId,
          ingredients: [formData],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ingredient: Ingredient) => {
    const recipe = recipeData?.data;
    if (!recipe) return;

    const confirmed = await confirm({
      title: 'Malzeme Silinecek',
      message: 'Bu malzemeyi silmek istediğinizden emin misiniz?',
      confirmText: 'Evet, Sil',
      cancelText: 'İptal',
    });

    if (confirmed) {
      try {
        setLoading(true);
        const updatedIngredients = recipe.ingredients.filter((ing) => ing.id !== ingredient.id);
        await updateRecipeMutation.mutateAsync({
          id: recipe.id,
          ingredients: updatedIngredients,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteRecipe = async () => {
    const recipe = recipeData?.data;
    if (!recipe) return;

    const confirmed = await confirm({
      title: 'Reçete Silinecek',
      message: 'Bu reçeteyi silmek istediğinizden emin misiniz?',
      confirmText: 'Evet, Sil',
      cancelText: 'İptal',
    });

    if (confirmed) {
      try {
        setLoading(true);
        await deleteRecipeMutation.mutateAsync(recipe.id);
      } finally {
        setLoading(false);
      }
    }
  };

  const recipe = recipeData?.data;
  const recipeCost = costData?.data;

  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Ürün Reçetesi</Typography>
          <Stack direction="row" spacing={1}>
            {recipe && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteRecipe}
              >
                Reçeteyi Sil
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Malzeme Ekle
            </Button>
          </Stack>
        </Box>

        {recipe ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Malzeme</TableCell>
                    <TableCell align="right">Miktar</TableCell>
                    <TableCell align="right">Birim</TableCell>
                    <TableCell align="right">Birim Maliyet</TableCell>
                    <TableCell align="right">Fire Oranı (%)</TableCell>
                    <TableCell align="right">Toplam Maliyet</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recipe.ingredients.map((ingredient) => (
                    <TableRow key={ingredient.id}>
                      <TableCell>{ingredient.name}</TableCell>
                      <TableCell align="right">{ingredient.quantity}</TableCell>
                      <TableCell align="right">{ingredient.unit}</TableCell>
                      <TableCell align="right">{formatCurrency(ingredient.cost)}</TableCell>
                      <TableCell align="right">{ingredient.waste}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(
                          ingredient.quantity * ingredient.cost * (1 + ingredient.waste / 100)
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpen(ingredient)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(ingredient)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {recipeCost && (
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Typography variant="h6">
                  Toplam Maliyet: {formatCurrency(recipeCost.totalCost)}
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Typography color="text.secondary" align="center">
            Bu ürün için henüz reçete oluşturulmamış
          </Typography>
        )}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedIngredient ? 'Malzeme Düzenle' : 'Yeni Malzeme'}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Malzeme Adı"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Miktar"
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Birim"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Birim Maliyet"
              type="number"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Fire Oranı (%)"
              type="number"
              value={formData.waste}
              onChange={(e) =>
                setFormData({ ...formData, waste: parseFloat(e.target.value) || 0 })
              }
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedIngredient ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ProductRecipe; 