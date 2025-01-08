import { Order, OrderStatus } from './order.types';

export interface BarOrdersFilters {
  status?: OrderStatus[];
  priority?: boolean;
  page?: number;
  limit?: number;
  branchId?: number;
  onlyBeverages?: boolean;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface BarOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface BarStats {
  averagePreparationTime: number;
  pendingCount: number;
  preparingCount: number;
  completedToday: number;
}

export interface StatsResponse {
  success: boolean;
  data: BarStats;
} 