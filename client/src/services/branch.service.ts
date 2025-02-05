import api from './api';
import { API_ENDPOINTS } from '../config/constants';

// Types
export interface GetTablesParams {
  branchId: number;
  status?: 'EMPTY' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
}

export interface GetCustomersParams {
  branchId: number;
  search?: string;
}

export interface GetProductsParams {
  branchId: number;
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
  getTables: async (branchId: number, restaurantId: number) => {
    if (!restaurantId) {
      throw new Error('Restaurant ID gereklidir');
    }
    if (!branchId) {
      throw new Error('Branch ID gereklidir');
    }
    const response = await api.get(API_ENDPOINTS.TABLES.BY_BRANCH(branchId.toString()), { 
      params: {
        restaurantId,
        branchId
      }
    });
    return response.data;
  },

  // Müşterileri getir
  getCustomers: async (restaurantId: number, branchId: number) => {
    if (!restaurantId) {
      throw new Error('Restaurant ID gereklidir');
    }
    if (!branchId) {
      throw new Error('Branch ID gereklidir');
    }
    const response = await api.get(API_ENDPOINTS.CUSTOMERS.LIST, {
      params: {
        restaurantId,
        branchId
      }
    });
    return response.data;
  },

  // Ürünleri getir
  getProducts: async (restaurantId: number, params: GetProductsParams) => {
    if (!restaurantId) {
      throw new Error('Restaurant ID gereklidir');
    }
    const response = await api.get(API_ENDPOINTS.PRODUCTS.LIST, {
      params: {
        ...params,
        restaurantId
      }
    });
    return response.data;
  },

  // Aktif şube bilgilerini getir
  getCurrentBranch: async () => {
    const response = await api.get(API_ENDPOINTS.BRANCHES.LIST);
    return response.data;
  },

  // Şube ayarlarını güncelle
  updateBranchSettings: async (branchId: string, data: any) => {
    const response = await api.put(API_ENDPOINTS.BRANCHES.SETTINGS(branchId), data);
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