import api from './api';
import { API_ENDPOINTS } from '../config/constants';

interface ProductListParams {
  branchId?: number;
  restaurantId?: number;
  categoryId?: number;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

const productsService = {
  // Get all products with optional filtering
  getProducts: async (params: ProductListParams = {}) => {
    const response = await api.get(API_ENDPOINTS.PRODUCTS.LIST, { 
      params: {
        ...params,
        restaurantId: params.restaurantId || localStorage.getItem('restaurantId')
      }
    });
    return response.data;
  },

  // Get a single product by ID
  getProductById: async (id: number) => {
    const response = await api.get(API_ENDPOINTS.PRODUCTS.DETAIL(id.toString()));
    return response.data;
  },

  // Create a new product
  createProduct: async (data: any) => {
    const response = await api.post(API_ENDPOINTS.PRODUCTS.CREATE, {
      ...data,
      restaurantId: data.restaurantId || localStorage.getItem('restaurantId')
    });
    return response.data;
  },

  // Update a product
  updateProduct: async (id: number, data: any) => {
    const response = await api.put(API_ENDPOINTS.PRODUCTS.UPDATE(id.toString()), {
      ...data,
      restaurantId: data.restaurantId || localStorage.getItem('restaurantId')
    });
    return response.data;
  },

  // Delete a product
  deleteProduct: async (id: number) => {
    const response = await api.delete(API_ENDPOINTS.PRODUCTS.DELETE(id.toString()));
    return response.data;
  },

  // Update product status
  updateProductStatus: async (id: number, isActive: boolean) => {
    const response = await api.patch(API_ENDPOINTS.PRODUCTS.STATUS(id.toString()), { isActive });
    return response.data;
  },

  // Get product stock
  getProductStock: async (id: number, branchId: number) => {
    const response = await api.get(API_ENDPOINTS.PRODUCTS.STOCK(id.toString()), { params: { branchId } });
    return response.data;
  },

  // Get product options
  getProductOptions: async (id: number) => {
    const response = await api.get(API_ENDPOINTS.PRODUCTS.OPTIONS(id.toString()));
    return response.data;
  }
};

export default productsService;
