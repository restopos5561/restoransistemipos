import api from './api';
import { API_ENDPOINTS } from '../config/constants';
import { BarOrdersFilters, BarOrdersResponse, UpdateOrderStatusRequest, StatsResponse } from '../types/bar.types';
import { Order } from '../types/order.types';

class BarService {
  async getOrders(filters: BarOrdersFilters): Promise<BarOrdersResponse> {
    try {
      console.warn('🔥 [BarService] Sipariş isteği gönderiliyor:', {
        endpoint: API_ENDPOINTS.BAR.ORDERS,
        filters,
        params: {
          ...filters,
          status: Array.isArray(filters.status) ? filters.status.join(',') : filters.status
        }
      });

      const params = {
        ...filters,
        status: Array.isArray(filters.status) ? filters.status.join(',') : filters.status
      };
      
      const response = await api.get(API_ENDPOINTS.BAR.ORDERS, { params });
      
      // Detaylı veri kontrolü ve loglama
      console.warn('🔥 [BarService] Backend yanıtı:', {
        status: response.status,
        data: response.data,
        orderCount: response.data.orders?.length || 0,
        orders: response.data.orders?.map((order: Order) => ({
          id: order.id,
          status: order.status,
          table: order.table ? {
            id: order.table.id,
            number: order.table.number
          } : 'Masa bilgisi yok',
          itemCount: order.items?.length || 0,
          items: order.items?.map(item => ({
            id: item.id,
            productId: item.product?.id,
            productName: item.product?.name || 'Ürün adı yok',
            quantity: item.quantity,
            notes: item.notes
          }))
        }))
      });

      // Veri doğrulama
      if (!response.data) {
        throw new Error('Backend yanıtı boş');
      }

      if (!Array.isArray(response.data.orders)) {
        console.error('🔥 [BarService] Sipariş verisi dizi değil:', response.data);
        throw new Error('Sipariş verisi geçersiz format');
      }

      // Her siparişi kontrol et
      response.data.orders.forEach((order: Order) => {
        if (!order.id) {
          console.error('🔥 [BarService] Sipariş ID eksik:', order);
        }

        if (!order.table) {
          console.error('🔥 [BarService] Masa bilgisi eksik:', order.id);
        }

        if (!Array.isArray(order.items) || order.items.length === 0) {
          console.error('🔥 [BarService] Ürün bilgisi eksik veya boş:', order.id);
        } else {
          order.items.forEach(item => {
            if (!item.product) {
              console.error('🔥 [BarService] Ürün detayı eksik:', {
                orderId: order.id,
                itemId: item.id
              });
            }
          });
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('🔥 [BarService] Siparişler alınırken hata:', {
        error: error.message,
        response: error.response?.data,
        filters
      });
      throw error;
    }
  }

  async updateOrderStatus(orderId: number, data: UpdateOrderStatusRequest): Promise<Order> {
    try {
      console.warn('🔥 [BarService] Sipariş durumu güncelleniyor:', {
        orderId,
        status: data.status
      });

      const response = await api.patch(API_ENDPOINTS.BAR.ORDER_STATUS(orderId.toString()), data);
      
      console.warn('🔥 [BarService] Durum güncelleme yanıtı:', {
        status: response.status,
        data: response.data
      });

      return response.data;
    } catch (error: any) {
      console.error('🔥 [BarService] Durum güncellenirken hata:', {
        error,
        response: error.response?.data,
        orderId,
        status: data.status
      });
      throw error;
    }
  }

  async getQueue(): Promise<BarOrdersResponse> {
    try {
      console.warn('🔥 [BarService] Kuyruk isteniyor');
      
      const response = await api.get(API_ENDPOINTS.BAR.QUEUE);
      
      console.warn('🔥 [BarService] Kuyruk yanıtı:', {
        status: response.status,
        data: response.data
      });

      return response.data;
    } catch (error: any) {
      console.error('🔥 [BarService] Kuyruk alınırken hata:', error);
      throw error;
    }
  }

  async getStats(branchId: number): Promise<StatsResponse> {
    try {
      console.warn('🔥 [BarService] İstatistikler isteniyor:', { branchId });
      
      const response = await api.get(API_ENDPOINTS.BAR.STATS, {
        params: { branchId }
      });
      
      console.warn('🔥 [BarService] İstatistik yanıtı:', {
        status: response.status,
        data: response.data
      });

      return response.data;
    } catch (error: any) {
      console.error('🔥 [BarService] İstatistikler alınırken hata:', {
        error,
        response: error.response?.data,
        branchId
      });
      throw error;
    }
  }
}

export const barService = new BarService(); 