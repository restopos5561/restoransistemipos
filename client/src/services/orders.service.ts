import api from './api';
import { API_ENDPOINTS } from '../config/constants';
import { OrderSource, OrderStatus } from '../types/enums';
import { OrderListParams } from '../types/order.types';

interface CreateOrderItem {
  productId: number;
  quantity: number;
  notes?: string;
}

interface CreateOrderData {
  branchId: number;
  restaurantId: number;
  orderSource: OrderSource;
  tableId: number | null;
  customerId: number | null;
  customerCount: number;
  notes?: string;
  items: CreateOrderItem[];
}

const ordersService = {
  // Get all orders
  getOrders: async (params: OrderListParams = {}) => {
    // Aktif şube ID'sini localStorage'dan al
    const branchId = localStorage.getItem('branchId');
    
    // Eğer params'da branchId yoksa ve localStorage'da branchId varsa ekle
    const updatedParams = {
      ...params,
      branchId: params.branchId || (branchId ? Number(branchId) : undefined)
    };

    console.log('[Orders] Siparişler getiriliyor:', {
      params: updatedParams
    });

    const response = await api.get(API_ENDPOINTS.ORDERS.LIST, { params: updatedParams });
    return response.data;
  },

  // Create a new order
  createOrder: async (data: CreateOrderData) => {
    try {
      // Ensure data is properly formatted according to backend schema
      const formattedData = {
        branchId: Number(data.branchId),
        restaurantId: Number(data.restaurantId),
        orderSource: data.orderSource,
        tableId: data.tableId ? Number(data.tableId) : null,
        customerId: data.customerId ? Number(data.customerId) : null,
        customerCount: Number(data.customerCount),
        notes: data.notes || '',
        items: data.items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          notes: item.notes || '',
        }))
      };

      console.log('[Orders] Sipariş oluşturma isteği:', {
        endpoint: API_ENDPOINTS.ORDERS.CREATE,
        data: formattedData
      });
      
      const response = await api.post(API_ENDPOINTS.ORDERS.CREATE, formattedData);
      
      console.log('[Orders] Sipariş başarıyla oluşturuldu:', {
        orderId: response.data.id,
        status: response.data.status,
        items: response.data.orderItems?.length || 0
      });
      
      return response.data;
    } catch (error: any) {
      console.error('[Orders] Sipariş oluşturma hatası:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (id: number) => {
    try {
      console.log('[Orders] Sipariş detayı isteği:', {
        endpoint: API_ENDPOINTS.ORDERS.DETAIL(id.toString())
      });
      
      const response = await api.get(API_ENDPOINTS.ORDERS.DETAIL(id.toString()));
      
      console.log('[Orders] Sipariş detayı alındı:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error: any) {
      console.error('[Orders] Sipariş detayı alınırken hata:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Get orders by table ID
  getOrdersByTable: async (tableId: number) => {
    const response = await api.get(API_ENDPOINTS.ORDERS.BY_TABLE(tableId.toString()));
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: number, status: OrderStatus) => {
    console.warn('🔥 [OrdersService] Durum güncelleme isteği:', {
      orderId: id,
      status,
      endpoint: API_ENDPOINTS.ORDERS.STATUS(id.toString())
    });
    
    try {
      const response = await api.patch(
        API_ENDPOINTS.ORDERS.STATUS(id.toString()),
        { status }
      );
      
      console.warn('🔥 [OrdersService] Durum güncelleme yanıtı:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error: any) {
      console.error('🔥 [OrdersService] Durum güncelleme hatası:', {
        error,
        response: error.response?.data,
        orderId: id,
        status
      });
      throw error;
    }
  },

  // Delete order
  deleteOrder: async (id: number) => {
    const response = await api.delete(API_ENDPOINTS.ORDERS.DELETE(id.toString()));
    return response.data;
  },

  // Bulk delete orders
  bulkDeleteOrders: async (orderIds: number[]) => {
    try {
      console.log('[Orders] Toplu sipariş silme isteği:', {
        endpoint: API_ENDPOINTS.ORDERS.BULK_DELETE,
        orderIds
      });
      
      const response = await api.post(API_ENDPOINTS.ORDERS.BULK_DELETE, { orderIds });
      
      console.log('[Orders] Siparişler başarıyla silindi:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error: any) {
      console.error('[Orders] Toplu sipariş silme hatası:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
      throw error;
    }
  },

  addOrderItems: async (orderId: number, items: Array<{ productId: number; quantity: number; notes?: string }>) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.ORDERS.DETAIL(orderId.toString())}/items`, { items });
      return response.data;
    } catch (error) {
      console.error('Sipariş ürünleri eklenirken hata:', error);
      throw error;
    }
  },

  // Update order
  updateOrder: async (id: number, data: any) => {
    try {
      // Ensure data is properly formatted according to backend schema
      const formattedData: any = {};

      // Sadece gönderilen alanları formatlayarak ekle
      if (data.branchId !== undefined) formattedData.branchId = Number(data.branchId);
      if (data.orderSource !== undefined) formattedData.orderSource = data.orderSource;
      if (data.tableId !== undefined) formattedData.tableId = data.tableId ? Number(data.tableId) : null;
      if (data.customerId !== undefined) formattedData.customerId = data.customerId ? Number(data.customerId) : null;
      if (data.customerCount !== undefined) formattedData.customerCount = Number(data.customerCount);
      if (data.notes !== undefined) formattedData.notes = data.notes;
      if (data.priority !== undefined) formattedData.priority = data.priority;
      if (data.discountAmount !== undefined) formattedData.discountAmount = Number(data.discountAmount);
      if (data.discountType !== undefined) formattedData.discountType = data.discountType;
      if (data.paymentStatus !== undefined) formattedData.paymentStatus = data.paymentStatus;
      
      // Items varsa formatla
      if (data.items) {
        formattedData.items = data.items.map((item: any) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          notes: item.notes || ''
        }));
      }

      console.log('[Orders] Sipariş güncelleme isteği:', {
        orderId: id,
        data: formattedData
      });
      
      const response = await api.put(`/api/orders/${id}`, formattedData);
      
      console.log('[Orders] Sipariş başarıyla güncellendi:', {
        orderId: id,
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error: any) {
      console.error('[Orders] Sipariş güncelleme hatası:', {
        orderId: id,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
      throw error;
    }
  }
};

export default ordersService; 