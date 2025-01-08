import api from './api';
import { BarOrdersFilters, BarOrdersResponse, UpdateOrderStatusRequest, StatsResponse } from '../types/bar.types';
import { Order } from '../types/order.types';

class BarService {
  async getOrders(filters: BarOrdersFilters): Promise<BarOrdersResponse> {
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

  async getQueue(): Promise<BarOrdersResponse> {
    const response = await api.get('/bar/queue');
    return response.data;
  }

  async getStats(): Promise<StatsResponse> {
    const response = await api.get('/bar/stats');
    return response.data;
  }
}

export const barService = new BarService(); 