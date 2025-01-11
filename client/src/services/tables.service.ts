import api from './api';
import { API_ENDPOINTS } from '../config/constants';
import {
  Table,
  TableFilters,
  TablesResponse,
  TableResponse,
  CreateTableInput,
  UpdateTableInput,
  UpdateTableStatusInput,
  MergeTablesInput,
  TransferTableInput,
  TableStatus,
  Order
} from '../types/table.types';

class TablesService {
  async getTables(filters: TableFilters): Promise<TablesResponse> {
    console.log('🔵 [TablesService] Masalar getiriliyor:', { filters });

    try {
      const response = await api.get(API_ENDPOINTS.TABLES.LIST, { params: filters });
      
      // Backend'den gelen orders verisini activeOrders olarak map'le
      const tables = response.data.data.tables.map((table: any) => ({
        ...table,
        activeOrders: table.orders
      }));
      response.data.data.tables = tables;
      
      // Adisyon detaylarını logla
      const tablesWithOrders = tables.filter((t: Table) => t.activeOrders && t.activeOrders.length > 0);
      
      console.log('✅ [TablesService] Masalar ve adisyonlar:', {
        totalTables: response.data.data.total,
        returnedTables: tables.length,
        tablesWithOrders: tablesWithOrders.length,
        orderDetails: tablesWithOrders.map((table: Table) => ({
          tableNumber: table.tableNumber,
          orderCount: table.activeOrders?.length,
          orders: table.activeOrders?.map((order: Order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: order.totalAmount,
            itemCount: order.orderItems?.length,
            items: order.orderItems?.map(item => ({
              productName: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
              totalPrice: item.quantity * item.product.price
            }))
          }))
        }))
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ [TablesService] Masalar getirilirken hata:', {
        error,
        response: error.response?.data,
        filters
      });
      throw error;
    }
  }

  async getTableById(id: number) {
    console.log('🔵 [TablesService] Masa detayı getiriliyor:', { tableId: id });
    const response = await api.get(API_ENDPOINTS.TABLES.DETAIL(id.toString()));
    return response.data.data;
  }

  async createTable(data: CreateTableInput): Promise<TableResponse> {
    const response = await api.post(API_ENDPOINTS.TABLES.CREATE, data);
    return response.data;
  }

  async updateTable(id: number, data: UpdateTableInput): Promise<TableResponse> {
    const response = await api.put(API_ENDPOINTS.TABLES.UPDATE(id.toString()), data);
    return response.data;
  }

  async deleteTable(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.TABLES.DELETE(id.toString()));
  }

  async updateTableStatus(id: number, data: UpdateTableStatusInput): Promise<TableResponse> {
    console.log('🔵 [TablesService] Masa durumu güncelleniyor:', {
      tableId: id,
      newStatus: data.status,
      endpoint: API_ENDPOINTS.TABLES.STATUS(id.toString())
    });

    try {
      const response = await api.patch(API_ENDPOINTS.TABLES.STATUS(id.toString()), data);
      
      console.log('✅ [TablesService] Masa durumu güncellendi:', {
        tableId: id,
        status: response.data.data.status,
        hasOrders: response.data.data.activeOrders?.length > 0
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ [TablesService] Masa durumu güncellenirken hata:', {
        error,
        response: error.response?.data,
        tableId: id,
        data
      });
      throw error;
    }
  }

  async mergeTables(data: MergeTablesInput): Promise<TableResponse> {
    const response = await api.post(API_ENDPOINTS.TABLES.MERGE, data);
    return response.data;
  }

  async transferTable(data: TransferTableInput): Promise<TableResponse> {
    const response = await api.post(API_ENDPOINTS.TABLES.TRANSFER, data);
    return response.data;
  }

  async getTablesByBranch(branchId: number): Promise<TablesResponse> {
    console.log('🔵 [TablesService] Şubeye ait masalar getiriliyor:', { branchId });

    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) {
      throw new Error('Restaurant ID bulunamadı');
    }

    try {
      const response = await api.get(API_ENDPOINTS.TABLES.BY_BRANCH(branchId.toString()), {
        params: {
          restaurantId: Number(restaurantId),
          branchId
        }
      });

      // Adisyon detaylarını logla
      const tablesWithOrders = response.data.data.tables.filter((t: Table) => t.activeOrders && t.activeOrders.length > 0);
      
      console.log('✅ [TablesService] Şube masaları ve adisyonlar:', {
        branchId,
        totalTables: response.data.data.tables.length,
        tablesWithOrders: tablesWithOrders.length,
        orderDetails: tablesWithOrders.map((table: Table) => ({
          tableNumber: table.tableNumber,
          orderCount: table.activeOrders?.length,
          orders: table.activeOrders?.map((order: Order) => ({
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: order.totalAmount,
            itemCount: order.orderItems?.length
          }))
        }))
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ [TablesService] Şube masaları getirilirken hata:', {
        error,
        response: error.response?.data,
        branchId
      });
      throw error;
    }
  }
}

const tablesService = new TablesService();
export { tablesService };
export default tablesService; 