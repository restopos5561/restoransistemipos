import api from './api';
import { API_ENDPOINTS } from '../config/constants';

// Types
export interface GetTablesParams {
  branchId?: string;
  status?: 'EMPTY' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
}

export interface GetCustomersParams {
  branchId?: string;
  search?: string;
}

export interface GetProductsParams {
  branchId?: string;
  categoryId?: string;
  search?: string;
}

interface Branch {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

interface BranchListResponse {
  success: boolean;
  data: {
    branches: Branch[];
    total: number;
  };
}

const branchService = {
  // Masaları getir
  getTables: async (restaurantId?: number, params = {}) => {
    if (!restaurantId) {
      throw new Error('Restaurant ID gereklidir');
    }
    const response = await api.get(API_ENDPOINTS.TABLES.LIST, { 
      params: {
        ...params,
        restaurantId
      }
    });
    return response.data;
  },

  // Müşterileri getir
  getCustomers: async (restaurantId?: number, params = {}) => {
    if (!restaurantId) {
      throw new Error('Restaurant ID gereklidir');
    }
    const response = await api.get(API_ENDPOINTS.CUSTOMERS.LIST, {
      params: {
        ...params,
        restaurantId
      }
    });
    return response.data;
  },

  // Ürünleri getir
  getProducts: async (restaurantId?: number, params = {}) => {
    if (!restaurantId) {
      throw new Error('Restaurant ID gereklidir');
    }
    const response = await api.get('/products', {
      params: {
        ...params,
        restaurantId
      }
    });
    return response.data;
  },

  // Aktif şube bilgilerini getir
  getCurrentBranch: async () => {
    const response = await api.get('/branches/current');
    return response.data;
  },

  // Şube ayarlarını güncelle
  updateBranchSettings: async (branchId: string, data: any) => {
    const response = await api.put(`/branches/${branchId}/settings`, data);
    return response.data;
  },

  getBranches: async () => {
    const response = await api.get<BranchListResponse>(API_ENDPOINTS.BRANCHES.LIST, {
      params: {
        restaurantId: localStorage.getItem('restaurantId'),
      },
    });
    return response.data;
  }
};

export default branchService; 