import api from './api';
import { API_ENDPOINTS } from '../config/constants';

interface TableListParams {
  branchId?: number;
  restaurantId?: number;
  status?: string;
  location?: string;
}

const tablesService = {
  // Get all tables with optional filtering
  getTables: async (params: TableListParams = {}) => {
    const response = await api.get(API_ENDPOINTS.TABLES.LIST, { 
      params: {
        ...params,
        restaurantId: params.restaurantId || localStorage.getItem('restaurantId')
      }
    });
    return response.data;
  },

  // Get a single table by ID
  getTableById: async (id: number) => {
    const response = await api.get(API_ENDPOINTS.TABLES.DETAIL(id.toString()));
    return response.data;
  },

  // Create a new table
  createTable: async (data: any) => {
    const response = await api.post(API_ENDPOINTS.TABLES.CREATE, {
      ...data,
      restaurantId: data.restaurantId || localStorage.getItem('restaurantId')
    });
    return response.data;
  },

  // Update a table
  updateTable: async (id: number, data: any) => {
    const response = await api.put(API_ENDPOINTS.TABLES.UPDATE(id.toString()), {
      ...data,
      restaurantId: data.restaurantId || localStorage.getItem('restaurantId')
    });
    return response.data;
  },

  // Delete a table
  deleteTable: async (id: number) => {
    const response = await api.delete(API_ENDPOINTS.TABLES.DELETE(id.toString()));
    return response.data;
  },

  // Update table status
  updateTableStatus: async (id: number, status: string) => {
    const response = await api.patch(API_ENDPOINTS.TABLES.STATUS(id.toString()), { status });
    return response.data;
  }
};

export default tablesService; 