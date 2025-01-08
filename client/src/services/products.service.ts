import api from './api';
import { API_ENDPOINTS } from '../config/constants';

const productsService = {
  getProducts: async (restaurantId: number, categoryId?: number, search?: string) => {
    const params = new URLSearchParams({
      restaurantId: restaurantId.toString(),
      ...(categoryId && { categoryId: categoryId.toString() }),
      ...(search && { search })
    });
    
    const response = await api.get(`${API_ENDPOINTS.PRODUCTS.LIST}?${params}`);
    return response.data;
  },

  getProductById: async (restaurantId: number, id: string | number) => {
    const response = await api.get(API_ENDPOINTS.PRODUCTS.DETAIL(id.toString()));
    return response.data;
  },

  createProduct: async (restaurantId: number, data: any) => {
    const response = await api.post(API_ENDPOINTS.PRODUCTS.CREATE, data);
    return response.data;
  },

  updateProduct: async (restaurantId: number, id: string | number, data: any) => {
    const response = await api.put(API_ENDPOINTS.PRODUCTS.UPDATE(id.toString()), data);
    return response.data;
  },

  deleteProduct: async (restaurantId: number, id: string | number) => {
    const response = await api.delete(API_ENDPOINTS.PRODUCTS.DELETE(id.toString()));
    return response.data;
  }
};

export default productsService;
