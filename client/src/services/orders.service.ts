import api from './api';
import { API_ENDPOINTS } from '../config/constants';
import { OrderStatus } from '../types/enums';
import { OrderListParams } from '../types/order.types';

const ordersService = {
  // Siparişleri getir
  getOrders: async (params: OrderListParams = {}) => {
    // Tarih parametrelerini direkt kullan, çift dönüşüm yapma
    const queryParams = {
      ...params,
      branchId: params.branchId || undefined,
      startDate: params.startDate,
      endDate: params.endDate
    };

    const response = await api.get(API_ENDPOINTS.ORDERS.LIST, { params: queryParams });
    return response.data;
  },

  // Sipariş detayı getir
  getOrderById: async (id: number | string) => {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    if (isNaN(numericId)) {
      throw new Error('Geçersiz sipariş ID');
    }
    const response = await api.get(API_ENDPOINTS.ORDERS.DETAIL(numericId.toString()));
    return response.data;
  },

  // Yeni sipariş oluştur
  createOrder: async (data: any) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.CREATE, {
      ...data,
      branchId: data.branchId || undefined
    });
    return response.data;
  },

  // Sipariş güncelle
  updateOrder: async (id: number | string, data: any) => {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    if (isNaN(numericId)) {
      throw new Error('Geçersiz sipariş ID');
    }
    const response = await api.put(API_ENDPOINTS.ORDERS.UPDATE(numericId.toString()), {
      ...data,
      branchId: data.branchId || undefined
    });
    return response.data;
  },

  // Sipariş iptal et
  cancelOrder: async (id: number | string) => {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    if (isNaN(numericId)) {
      throw new Error('Geçersiz sipariş ID');
    }
    const response = await api.post(API_ENDPOINTS.ORDERS.CANCEL(numericId.toString()));
    return response.data;
  },

  // Sipariş sil
  deleteOrder: async (orderId: number) => {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },

  // Sipariş durumu güncelle
  updateOrderStatus: async (orderId: number | string, status: OrderStatus) => {
    const numericId = typeof orderId === 'string' ? parseInt(orderId) : orderId;
    if (isNaN(numericId)) {
      throw new Error('Geçersiz sipariş ID');
    }
    const response = await api.put(API_ENDPOINTS.ORDERS.STATUS(numericId.toString()), { status });
    return response.data;
  },

  // Toplu silme
  bulkDeleteOrders: async (orderIds: number[]) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.BULK_DELETE, { orderIds });
    return response.data;
  },

  // Toplu durum güncelleme
  bulkUpdateOrderStatus: async (orderIds: number[], status: OrderStatus) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.BULK_STATUS, { orderIds, status });
    return response.data;
  },

  // Yazdırma için sipariş detaylarını getir
  getOrdersForPrinting: async (orderIds: number[]) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.PRINT, { orderIds });
    return response.data;
  },

  // Siparişe ürün ekle
  addOrderItems: async (orderId: string | number, items: Array<{ productId: number; quantity: number; notes?: string }>) => {
    const response = await api.post(API_ENDPOINTS.ORDERS.ADD_ITEMS(orderId.toString()), { items });
    return response.data;
  },
};

export default ordersService; 