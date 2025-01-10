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
  TableStatus
} from '../types/table.types';

class TablesService {
  async getTables(filters: TableFilters): Promise<TablesResponse> {
    const response = await api.get(API_ENDPOINTS.TABLES.LIST, { params: filters });
    return response.data;
  }

  async getTableById(id: number): Promise<TableResponse> {
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
    const response = await api.patch(API_ENDPOINTS.TABLES.STATUS(id.toString()), data);
    return response.data;
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
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) {
      throw new Error('Restaurant ID bulunamadı');
    }

    const response = await api.get(API_ENDPOINTS.TABLES.BY_BRANCH(branchId.toString()), {
      params: {
        restaurantId: Number(restaurantId),
        branchId
      }
    });
    return response.data;
  }
}

const tablesService = new TablesService();
export { tablesService };
export default tablesService; 