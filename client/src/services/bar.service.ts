import api from './api';
import { KitchenOrdersFilters, KitchenOrdersResponse, UpdateOrderStatusRequest } from '../types/kitchen.types';
import { Order } from '../types/order.types';

class BarService {
  async getOrders(filters: KitchenOrdersFilters): Promise<KitchenOrdersResponse> {
    const params = {
      ...filters,
      status: filters.status?.join(',')
    };
    
    const response = await api.get('/bar/orders', { params });
    return response.data;
  }

  async updateOrderStatus(orderId: number, data: UpdateOrderStatusRequest): Promise<Order> {
    const response = await api.patch(`/bar/orders/${orderId}/status`, data);
    return response.data;
  }

  async getQueue(): Promise<KitchenOrdersResponse> {
    const response = await api.get('/bar/queue');
    return response.data;
  }
}

export const barService = new BarService(); 