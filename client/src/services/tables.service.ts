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
    console.log('🔵 [TablesService] Masalar getiriliyor:', { 
      filters,
      endpoint: API_ENDPOINTS.TABLES.LIST
    });

    try {
      // RestaurantId'yi localStorage'dan al
      const restaurantId = localStorage.getItem('restaurantId');
      if (!restaurantId) {
        throw new Error('Restaurant ID bulunamadı');
      }

      // İstek parametrelerine restaurantId ekle
      const params = {
        ...filters,
        restaurantId: Number(restaurantId)
      };

      const response = await api.get(API_ENDPOINTS.TABLES.LIST, { params });
      
      console.log('🔵 [TablesService] Ham backend yanıtı:', response.data);

      // Backend yanıtını kontrol et
      if (!response.data) {
        console.error('❌ [TablesService] Geçersiz API yanıtı:', response.data);
        return {
          success: false,
          data: {
            tables: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1
          }
        };
      }

      // Eğer tables direkt olarak response.data içindeyse veya response.data.data içindeyse
      let tables: any[] = [];
      if (Array.isArray(response.data)) {
        tables = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        tables = response.data.data;
      } else if (response.data.data && response.data.data.tables && Array.isArray(response.data.data.tables)) {
        tables = response.data.data.tables;
      }

      // Her masayı işle ve doğrula
      const processedTables = tables.map((table: any) => ({
        id: table.id || 0,
        tableNumber: table.tableNumber || 'Bilinmeyen Masa',
        status: table.status || TableStatus.IDLE,
        capacity: table.capacity || 0,
        location: table.location || '',
        isActive: table.isActive ?? true,
        branchId: table.branchId || 0,
        activeOrders: Array.isArray(table.orders) ? table.orders : [],
        positionX: table.positionX || 0,
        positionY: table.positionY || 0
      }));

      console.log('✅ [TablesService] İşlenmiş masa verileri:', {
        totalTables: processedTables.length,
        tables: processedTables.map((t: Table) => ({
          id: t.id,
          number: t.tableNumber,
          status: t.status,
          capacity: t.capacity,
          location: t.location
        }))
      });

      return {
        success: true,
        data: {
          tables: processedTables,
          total: response.data.data?.total || processedTables.length,
          page: response.data.data?.page || 1,
          limit: response.data.data?.limit || 10,
          totalPages: response.data.data?.totalPages || 1
        }
      };
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
    return response.data;
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

      // Özel hata mesajlarını kontrol et
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }

      // Network hatası
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      }

      // Timeout hatası
      if (error.code === 'ECONNABORTED') {
        throw new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
      }

      // Genel hata
      throw new Error('Masa durumu güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
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

      console.log('🔵 [TablesService] Ham şube masaları yanıtı:', response.data);

      // Backend yanıtını kontrol et
      if (!response.data || !response.data.data) {
        console.error('❌ [TablesService] Geçersiz API yanıtı:', response.data);
        throw new Error('Geçersiz API yanıtı');
      }

      // Eğer tables direkt olarak response.data içindeyse
      const tables = Array.isArray(response.data.data) 
        ? response.data.data 
        : response.data.data.tables || [];

      // Her masayı işle ve doğrula
      const processedTables = tables.map((table: any) => ({
        ...table,
        id: table.id,
        tableNumber: table.tableNumber || 'Bilinmeyen Masa',
        status: table.status || TableStatus.IDLE,
        activeOrders: table.orders || []
      }));

      console.log('✅ [TablesService] İşlenmiş şube masaları:', {
        branchId,
        totalTables: processedTables.length,
        tables: processedTables.map((t: Table) => ({
          id: t.id,
          number: t.tableNumber,
          status: t.status
        }))
      });

      return {
        success: true,
        data: {
          tables: processedTables,
          total: response.data.data.total || processedTables.length,
          page: response.data.data.page || 1,
          limit: response.data.data.limit || 10,
          totalPages: response.data.data.totalPages || 1
        }
      };
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