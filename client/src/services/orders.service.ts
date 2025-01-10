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
  getOrders: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.ORDERS.LIST, { params });
    return response.data;
  },

  // Create a new order
  createOrder: async (data: CreateOrderData) => {
    try {
      // Ensure data is properly formatted
      const formattedData = {
        branchId: Number(data.branchId),
        restaurantId: Number(data.restaurantId),
        orderSource: data.orderSource,
        tableId: data.tableId ? Number(data.tableId) : undefined,
        customerId: data.customerId ? Number(data.customerId) : undefined,
        customerCount: Number(data.customerCount),
        orderNotes: data.notes || '',
        orderItems: data.items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          note: item.notes || '',
          unitPrice: undefined // Backend'in hesaplaması için boş bırakıyoruz
        }))
      };

      console.log('API isteği URL:', API_ENDPOINTS.ORDERS.CREATE);
      console.log('Gönderilen veri:', JSON.stringify(formattedData, null, 2));
      
      const response = await api.post(API_ENDPOINTS.ORDERS.CREATE, formattedData);
      console.log('Backend yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Sipariş oluşturma hatası detayı:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.response?.config,
        message: error.message
      });
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (id: number) => {
    const response = await api.get(API_ENDPOINTS.ORDERS.DETAIL(id.toString()));
    return response.data;
  },

  // Get orders by table ID
  getOrdersByTable: async (tableId: number) => {
    const response = await api.get(API_ENDPOINTS.ORDERS.BY_TABLE(tableId.toString()));
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: number, status: string) => {
    const response = await api.patch(API_ENDPOINTS.ORDERS.STATUS(id.toString()), { status });
    return response.data;
  },

  // Delete order
  deleteOrder: async (id: number) => {
    const response = await api.delete(API_ENDPOINTS.ORDERS.DELETE(id.toString()));
    return response.data;
  }
};

export default ordersService; 