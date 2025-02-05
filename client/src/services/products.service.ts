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
  getProducts: async (params?: ProductListParams) => {
    try {
      const queryParams = {
        restaurantId: params?.restaurantId || localStorage.getItem('restaurantId'),
        branchId: params?.branchId,
        categoryId: params?.categoryId,
        search: params?.search,
        isActive: params?.isActive,
        page: params?.page,
        limit: params?.limit
      };

      // Undefined değerleri temizle
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof typeof queryParams] === undefined) {
          delete queryParams[key as keyof typeof queryParams];
        }
      });

      const response = await api.get(API_ENDPOINTS.PRODUCTS.LIST, { 
        params: queryParams
      });
      return response.data;
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      throw error;
    }
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
      restaurantId: data.restaurantId || Number(localStorage.getItem('restaurantId'))
    });
    return response.data;
  },

  // Update a product
  updateProduct: async (id: number, data: any) => {
    const response = await api.put(API_ENDPOINTS.PRODUCTS.UPDATE(id.toString()), {
      ...data,
      restaurantId: data.restaurantId || Number(localStorage.getItem('restaurantId'))
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
  },

  // Get product price history
  getProductPriceHistory: async (id: number) => {
    const response = await api.get(API_ENDPOINTS.PRODUCTS.PRICE_HISTORY(id.toString()));
    return response.data;
  },

  // Get product variants
  getProductVariants: async (id: number) => {
    const response = await api.get(API_ENDPOINTS.PRODUCTS.VARIANTS(id.toString()));
    return response.data;
  },

  // Add product variant
  addProductVariant: async (productId: number, data: any) => {
    const response = await api.post(API_ENDPOINTS.PRODUCTS.ADD_VARIANT(productId.toString()), data);
    return response.data;
  },

  // Update product variant
  updateProductVariant: async (productId: number, variantId: number, data: any) => {
    const response = await api.put(API_ENDPOINTS.PRODUCTS.UPDATE_VARIANT(productId.toString(), variantId.toString()), data);
    return response.data;
  },

  // Delete product variant
  deleteProductVariant: async (productId: number, variantId: number) => {
    const response = await api.delete(API_ENDPOINTS.PRODUCTS.DELETE_VARIANT(productId.toString(), variantId.toString()));
    return response.data;
  },

  // Add option group
  addProductOptionGroup: async (productId: number, data: any) => {
    const response = await api.post(API_ENDPOINTS.PRODUCTS.ADD_OPTION_GROUP(productId.toString()), data);
    return response.data;
  },

  // Add option
  addProductOption: async (productId: number, data: any) => {
    const response = await api.post(API_ENDPOINTS.PRODUCTS.ADD_OPTION(productId.toString()), data);
    return response.data;
  },

  // Update option
  updateProductOption: async (productId: number, optionId: number, data: any) => {
    const response = await api.put(
      API_ENDPOINTS.PRODUCTS.UPDATE_OPTION(productId.toString(), optionId.toString()),
      data
    );
    return response.data;
  },

  // Delete option
  deleteProductOption: async (productId: number, optionId: number) => {
    const response = await api.delete(
      API_ENDPOINTS.PRODUCTS.DELETE_OPTION(productId.toString(), optionId.toString())
    );
    return response.data;
  },

  // Delete option group
  deleteProductOptionGroup: async (productId: number, groupId: number) => {
    const response = await api.delete(
      API_ENDPOINTS.PRODUCTS.DELETE_OPTION_GROUP(productId.toString(), groupId.toString())
    );
    return response.data;
  }
};

export default productsService;
