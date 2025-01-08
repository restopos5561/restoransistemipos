import React from 'react';
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
} from '@mui/material';
import {
  CheckCircle as ReadyIcon,
  LocalDining as PreparingIcon,
  Cancel as CancelIcon,
  PriorityHigh as PriorityIcon,
} from '@mui/icons-material';
import { Order, OrderStatus } from '../../types/order.types';
import { formatDate } from '../../utils/date';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
}

const statusColors = {
  PENDING: 'warning',
  PREPARING: 'info',
  READY: 'success',
  DELIVERED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'error',
  ITEM_ISSUE: 'error',
  PARTIALLY_PAID: 'warning',
} as const;

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange }) => {
  const theme = useTheme();

  const handleStatusChange = (newStatus: OrderStatus) => {
    onStatusChange(order.id, newStatus);
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
      }}
    >
      {order.priority && (
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
      )}
      
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Masa {order.table?.tableNumber}
            </Typography>
            <Chip
              label={order.status}
              color={statusColors[order.status] as any}
              size="small"
            />
          </Stack>

          <Box>
            {order.orderItems.map((item) => (
              <Typography key={item.id} variant="body2" color="text.secondary">
                {item.quantity}x {item.product.name}
                {item.note && <em> ({item.note})</em>}
              </Typography>
            ))}
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {formatDate(order.orderTime)}
            </Typography>
            {order.orderNotes && (
              <Typography variant="caption" color="error">
                Not: {order.orderNotes}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {order.status === 'PENDING' && (
              <IconButton
                size="small"
                onClick={() => handleStatusChange('PREPARING')}
                sx={{ color: theme.palette.info.main }}
              >
                <PreparingIcon />
              </IconButton>
            )}
            {order.status === 'PREPARING' && (
              <IconButton
                size="small"
                onClick={() => handleStatusChange('READY')}
                sx={{ color: theme.palette.success.main }}
              >
                <ReadyIcon />
              </IconButton>
            )}
            {(order.status === 'PENDING' || order.status === 'PREPARING') && (
              <IconButton
                size="small"
                onClick={() => handleStatusChange('CANCELLED')}
                sx={{ color: theme.palette.error.main }}
              >
                <CancelIcon />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default OrderCard; 