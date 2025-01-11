import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton,
  Box,
  useTheme,
  alpha,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CheckCircle as ReadyIcon,
  LocalDining as PreparingIcon,
  Cancel as CancelIcon,
  PriorityHigh as PriorityIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  MenuBook as RecipeIcon,
} from '@mui/icons-material';
import { Order } from '../../types/order.types';
import { OrderStatus, OrderSource } from '../../types/enums';
import { formatDate } from '../../utils/date';
import { useQuery } from '@tanstack/react-query';
import { kitchenService } from '../../services/kitchen.service';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
}

interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

const statusColors = {
  [OrderStatus.PENDING]: 'warning',
  [OrderStatus.PREPARING]: 'info',
  [OrderStatus.READY]: 'success',
  [OrderStatus.DELIVERED]: 'success',
  [OrderStatus.COMPLETED]: 'success',
  [OrderStatus.CANCELLED]: 'error',
  [OrderStatus.ITEM_ISSUE]: 'error',
  [OrderStatus.PARTIALLY_PAID]: 'warning',
} as const;

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange }) => {
  const theme = useTheme();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const { data: recipeData } = useQuery({
    queryKey: ['recipe', selectedProductId],
    queryFn: () => selectedProductId ? kitchenService.getRecipeByProductId(selectedProductId) : null,
    enabled: !!selectedProductId
  });

  const handleRecipeClick = (productId: number) => {
    setSelectedProductId(productId);
  };

  const handleCloseRecipe = () => {
    setSelectedProductId(null);
  };

  // Detaylı veri kontrolü ve loglama
  console.warn('🔥 [OrderCard] Sipariş verisi:', {
    id: order.id,
    status: order.status,
    table: order.table,
    orderSource: order.orderSource,
    itemCount: order.items?.length || 0,
    items: order.items?.map(item => ({
      id: item.id,
      productId: item.product?.id,
      productName: item.product?.name,
      quantity: item.quantity,
      notes: item.notes
    }))
  });

  const handleStatusChange = (newStatus: OrderStatus) => {
    onStatusChange(order.id, newStatus);
  };

  // Veri eksikliği kontrolü
  const hasDataIssues = !order.items || order.items.length === 0 || order.items.some(item => !item.product);

  const getOrderTitle = () => {
    if (order.table) {
      return `Masa ${order.table.number}`;
    }
    
    switch (order.orderSource) {
      case OrderSource.PACKAGE:
        return 'Paket Sipariş';
      case OrderSource.ONLINE:
        return 'Online Sipariş';
      case OrderSource.IN_STORE:
        return 'Restoran İçi';
      default:
        return 'Bilinmeyen Sipariş';
    }
  };

  return (
    <Card 
      elevation={2}
      sx={{
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
        border: order.priority ? `2px solid ${theme.palette.error.main}` : 'none',
      }}
    >
      {order.priority && (
        <Tooltip title="Öncelikli Sipariş">
          <PriorityIcon
            sx={{
              position: 'absolute',
              top: -12,
              right: -12,
              color: theme.palette.error.main,
              backgroundColor: theme.palette.background.paper,
              borderRadius: '50%',
            }}
          />
        </Tooltip>
      )}

      {hasDataIssues && (
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ mb: 1 }}
        >
          Sipariş verilerinde eksiklik var. Lütfen kontrol ediniz.
        </Alert>
      )}
      
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {getOrderTitle()}
            </Typography>
            <Chip
              label={order.status}
              color={statusColors[order.status] as any}
              size="small"
            />
          </Stack>

          <Box sx={{ bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom>
              Sipariş İçeriği:
            </Typography>
            {order.items && order.items.length > 0 ? (
              <>
                {order.items.map((item) => (
                  <Box 
                    key={item.id} 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      mb: 1,
                      p: 1,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      boxShadow: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'medium' }}>
                        {item.quantity}x {item.product?.name || 'Ürün adı bulunamadı'}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          {item.product?.price ? `₺${(item.quantity * Number(item.product.price)).toFixed(2)}` : ''}
                        </Typography>
                        {item.product?.id && (
                          <Tooltip title="Reçeteyi Görüntüle">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleRecipeClick(item.product.id)}
                            >
                              <RecipeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Box>
                    
                    {item.product?.category && (
                      <Typography variant="caption" color="text.secondary">
                        Kategori: {item.product.category.name}
                      </Typography>
                    )}

                    {item.notes && (
                      <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                        <InfoIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
                        <Typography variant="caption" color="text.secondary">
                          {item.notes}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
                
                <Box sx={{ 
                  mt: 1, 
                  pt: 1, 
                  borderTop: 1, 
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="subtitle2">
                    Toplam:
                  </Typography>
                  <Typography variant="subtitle2" color="primary">
                    ₺{order.totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="error">
                Ürün bilgisi bulunamadı
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {formatDate(order.orderTime)}
            </Typography>
            {order.priority && (
              <Chip
                size="small"
                color="error"
                label="Öncelikli"
                icon={<PriorityIcon />}
              />
            )}
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {order.status === OrderStatus.PENDING && (
              <Tooltip title="Hazırlanıyor">
                <IconButton 
                  size="small"
                  color="info"
                  onClick={() => handleStatusChange(OrderStatus.PREPARING)}
                >
                  <PreparingIcon />
                </IconButton>
              </Tooltip>
            )}

            {order.status === OrderStatus.PREPARING && (
              <Tooltip title="Hazır">
                <IconButton 
                  size="small"
                  color="success"
                  onClick={() => handleStatusChange(OrderStatus.READY)}
                >
                  <ReadyIcon />
                </IconButton>
              </Tooltip>
            )}

            {(order.status === OrderStatus.PENDING || order.status === OrderStatus.PREPARING) && (
              <Tooltip title="İptal Et">
                <IconButton 
                  size="small"
                  color="error"
                  onClick={() => handleStatusChange(OrderStatus.CANCELLED)}
                >
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </CardContent>

      {/* Recipe Dialog */}
      <Dialog 
        open={!!selectedProductId} 
        onClose={handleCloseRecipe}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Ürün Reçetesi
          {recipeData?.data?.product?.name && (
            <Typography variant="subtitle1" color="text.secondary">
              {recipeData.data.product.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {recipeData?.data?.ingredients ? (
            <List>
              {recipeData?.data?.ingredients.map((ingredient: RecipeIngredient, index: number) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={ingredient.name}
                      secondary={`${ingredient.quantity} ${ingredient.unit}`}
                    />
                  </ListItem>
                  {index < (recipeData?.data?.ingredients?.length || 0) - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">
              Bu ürün için reçete bulunamadı.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRecipe}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default OrderCard; 