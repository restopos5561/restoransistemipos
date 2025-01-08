import api from './api';
import { KitchenOrdersFilters, KitchenOrdersResponse, UpdateOrderStatusRequest, OrderStats, StatsResponse } from '../types/kitchen.types';
import { Order } from '../types/order.types';

class KitchenService {
  async getOrders(filters: KitchenOrdersFilters): Promise<KitchenOrdersResponse> {
    const params = {
      ...filters,
      status: filters.status?.join(',')
    };
    
    const response = await api.get('/kitchen/orders', { params });
    return response.data;
  }

  async updateOrderStatus(orderId: number, data: UpdateOrderStatusRequest): Promise<Order> {
    const response = await api.patch(`/kitchen/orders/${orderId}/status`, data);
    return response.data;
  }

  async getQueue(): Promise<KitchenOrdersResponse> {
    const response = await api.get('/kitchen/queue');
    return response.data;
  }

  async getStats(): Promise<StatsResponse> {
    const response = await api.get('/kitchen/stats');
    return response.data;
  }

  async getCompletedOrders(filters: KitchenOrdersFilters): Promise<KitchenOrdersResponse> {
    const params = {
      ...filters,
      status: ['COMPLETED'],
      onlyFood: true
    };
    
    const response = await api.get('/kitchen/orders', { params });
    return response.data;
  }

  async addNote(orderId: number, note: string): Promise<Order> {
    const response = await api.post(`/kitchen/orders/${orderId}/notes`, { note });
    return response.data;
  }
}

export const kitchenService = new KitchenService(); 