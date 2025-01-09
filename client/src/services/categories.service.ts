import api from './api';
import { API_ENDPOINTS } from '../config/constants';

interface CategoryListParams {
  restaurantId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

interface CategoryCreateData {
  name: string;
  description?: string;
  isActive: boolean;
  restaurantId?: number | string;
}

const categoriesService = {
  getCategories: async (params: CategoryListParams = {}) => {
    const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST, {
      params: {
        ...params,
        restaurantId: params.restaurantId || localStorage.getItem('restaurantId'),
      },
    });
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  getCategoryById: async (id: number) => {
    const response = await api.get(API_ENDPOINTS.CATEGORIES.DETAIL(id.toString()));
    return response.data;
  },

  createCategory: async (data: CategoryCreateData) => {
    const restaurantId = Number(data.restaurantId || localStorage.getItem('restaurantId'));
    const response = await api.post(API_ENDPOINTS.CATEGORIES.CREATE, {
      ...data,
      restaurantId,
    });
    return response.data;
  },

  updateCategory: async (id: number, data: any) => {
    const response = await api.put(API_ENDPOINTS.CATEGORIES.UPDATE(id.toString()), data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    try {
      const response = await api.delete(API_ENDPOINTS.CATEGORIES.DELETE(id.toString()));
      if (response.status === 204) {
        return true;
      }
      return response.data;
    } catch (error: any) {
      console.error('Delete category error:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Kategori silinirken bir hata oluştu');
      }
      if (error.response?.status === 404) {
        throw new Error('Kategori bulunamadı');
      }
      throw new Error('Kategori silinirken bir hata oluştu');
    }
  },
};

export default categoriesService; 