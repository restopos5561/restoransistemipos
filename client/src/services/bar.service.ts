import api from './api';
import { API_ENDPOINTS } from '../config/constants';
import { BarOrdersFilters, BarOrdersResponse, UpdateOrderStatusRequest, StatsResponse } from '../types/bar.types';
import { Order } from '../types/order.types';

class BarService {
  async getOrders(filters: BarOrdersFilters): Promise<BarOrdersResponse> {
    const params = {
      ...filters,
      status: filters.status?.join(',')
    };
    
    const response = await api.get(API_ENDPOINTS.BAR.ORDERS, { params });
    return response.data;
  }

  async updateOrderStatus(orderId: number, data: UpdateOrderStatusRequest): Promise<Order> {
    const response = await api.patch(API_ENDPOINTS.BAR.ORDER_STATUS(orderId.toString()), data);
    return response.data;
  }

  async getQueue(): Promise<BarOrdersResponse> {
    const response = await api.get(API_ENDPOINTS.BAR.QUEUE);
    return response.data;
  }

  async getStats(branchId: number): Promise<StatsResponse> {
    const response = await api.get(API_ENDPOINTS.BAR.STATS, {
      params: { branchId }
    });
    return response.data;
  }
}

export const barService = new BarService(); 