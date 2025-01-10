import { OrderSource } from '@prisma/client';

export interface CreateOrderInput {
  branchId: number;
  restaurantId: number;
  tableId?: number | null;
  customerId?: number | null;
  customerCount?: number;
  orderSource: OrderSource;
  items: {
    productId: number;
    quantity: number;
    notes?: string;
  }[];
  notes?: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  branchId?: number;
  startDate?: string;
  endDate?: string;
} 