import { Order, OrderStatus } from './order.types';

export interface KitchenOrdersFilters {
  status?: OrderStatus[];
  priority?: boolean;
  page?: number;
  limit?: number;
  branchId?: number;
  onlyFood?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface KitchenOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface OrderStats {
  averagePreparationTime: number;
  pendingCount: number;
  preparingCount: number;
  completedToday: number;
}

export interface StatsResponse {
  success: boolean;
  data: OrderStats;
} 