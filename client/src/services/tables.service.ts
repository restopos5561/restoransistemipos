import api from './api';
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
    const response = await api.get('/tables', { params: filters });
    return response.data;
  }

  async getTableById(id: number): Promise<TableResponse> {
    const response = await api.get(`/tables/${id}`);
    return response.data;
  }

  async createTable(data: CreateTableInput): Promise<TableResponse> {
    const response = await api.post('/tables', data);
    return response.data;
  }

  async updateTable(id: number, data: UpdateTableInput): Promise<TableResponse> {
    const response = await api.put(`/tables/${id}`, data);
    return response.data;
  }

  async deleteTable(id: number): Promise<void> {
    await api.delete(`/tables/${id}`);
  }

  async updateTableStatus(id: number, data: UpdateTableStatusInput): Promise<TableResponse> {
    const response = await api.patch(`/tables/${id}/status`, data);
    return response.data;
  }

  async mergeTables(data: MergeTablesInput): Promise<TableResponse> {
    const response = await api.post('/tables/merge', data);
    return response.data;
  }

  async transferTable(data: TransferTableInput): Promise<TableResponse> {
    const response = await api.post('/tables/transfer', data);
    return response.data;
  }

  async getTablesByBranch(branchId: number): Promise<TablesResponse> {
    const response = await api.get(`/tables/branch/${branchId}`);
    return response.data;
  }
}

const tablesService = new TablesService();
export { tablesService };
export default tablesService; 