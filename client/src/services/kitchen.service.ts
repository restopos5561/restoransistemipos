import api from './api';
import { API_ENDPOINTS } from '../config/constants';
import { KitchenOrdersFilters, KitchenOrdersResponse, UpdateOrderStatusRequest, OrderStats, StatsResponse } from '../types/kitchen.types';
import { Order } from '../types/order.types';

interface Recipe {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
  };
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
}

interface RecipeResponse {
  success: boolean;
  data: Recipe | null;
}

class KitchenService {
  async getOrders(filters: KitchenOrdersFilters): Promise<KitchenOrdersResponse> {
    try {
      const params = {
        ...filters,
        status: Array.isArray(filters.status) ? filters.status.join(',') : filters.status
      };
      
      console.log('[KitchenService] Siparişler isteniyor:', {
        endpoint: API_ENDPOINTS.KITCHEN.ORDERS,
        params
      });
      
      const response = await api.get(API_ENDPOINTS.KITCHEN.ORDERS, { params });
      
      console.log('[KitchenService] Backend yanıtı:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('[KitchenService] Siparişler alınırken hata:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: number, data: UpdateOrderStatusRequest): Promise<Order> {
    const response = await api.patch(API_ENDPOINTS.KITCHEN.ORDER_STATUS(orderId.toString()), data);
    return response.data;
  }

  async getQueue(): Promise<KitchenOrdersResponse> {
    const response = await api.get(API_ENDPOINTS.KITCHEN.QUEUE);
    return response.data;
  }

  async getStats(branchId: number): Promise<StatsResponse> {
    const response = await api.get(API_ENDPOINTS.KITCHEN.STATS, {
      params: { branchId }
    });
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

  async getRecipeByProductId(productId: number): Promise<RecipeResponse> {
    const response = await api.get(API_ENDPOINTS.RECIPES.BY_PRODUCT(productId.toString()));
    return response.data;
  }
}

export const kitchenService = new KitchenService(); 