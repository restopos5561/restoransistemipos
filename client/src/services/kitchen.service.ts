import api from './api';
import { API_ENDPOINTS } from '../config/constants';
import { KitchenOrdersFilters, KitchenOrdersResponse, UpdateOrderStatusRequest, OrderStats, StatsResponse } from '../types/kitchen.types';
import { Order } from '../types/order.types';

class KitchenService {
  async getOrders(filters: KitchenOrdersFilters): Promise<KitchenOrdersResponse> {
    const params = {
      ...filters,
      status: filters.status?.join(',')
    };
    
    const response = await api.get(API_ENDPOINTS.KITCHEN.ORDERS, { params });
    return response.data;
  }

  async updateOrderStatus(orderId: number, data: UpdateOrderStatusRequest): Promise<Order> {
    const response = await api.patch(API_ENDPOINTS.KITCHEN.ORDER_STATUS(orderId.toString()), data);
    return response.data;
  }

  async getQueue(): Promise<KitchenOrdersResponse> {
    const response = await api.get(API_ENDPOINTS.KITCHEN.QUEUE);
    return response.data;
  }

  async getStats(): Promise<StatsResponse> {
    const response = await api.get(API_ENDPOINTS.KITCHEN.STATS);
    return response.data;
  }

  async getCompletedOrders(filters: KitchenOrdersFilters): Promise<KitchenOrdersResponse> {
    const params = {
      ...filters,
      status: ['COMPLETED'],
      onlyFood: true
    };
    
    const response = await api.get(API_ENDPOINTS.KITCHEN.ORDERS, { params });
    return response.data;
  }

  async addNote(orderId: number, note: string): Promise<Order> {
    const response = await api.post(API_ENDPOINTS.KITCHEN.ORDER_NOTES(orderId.toString()), { note });
    return response.data;
  }
}

export const kitchenService = new KitchenService(); 