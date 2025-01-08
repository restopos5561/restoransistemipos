import api from './api';
import { API_ENDPOINTS } from '../config/constants';

interface CategoryListParams {
  restaurantId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

const categoriesService = {
  getCategories: async (params: CategoryListParams = {}) => {
    const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST, {
      params: {
        ...params,
        restaurantId: params.restaurantId || localStorage.getItem('restaurantId'),
      },
    });
    return response.data;
  },

  getCategoryById: async (id: number) => {
    const response = await api.get(API_ENDPOINTS.CATEGORIES.DETAIL(id.toString()));
    return response.data;
  },

  createCategory: async (data: any) => {
    const response = await api.post(API_ENDPOINTS.CATEGORIES.CREATE, {
      ...data,
      restaurantId: data.restaurantId || localStorage.getItem('restaurantId'),
    });
    return response.data;
  },

  updateCategory: async (id: number, data: any) => {
    const response = await api.put(API_ENDPOINTS.CATEGORIES.UPDATE(id.toString()), data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete(API_ENDPOINTS.CATEGORIES.DELETE(id.toString()));
    return response.data;
  },
};

export default categoriesService; 