import api from './api';
import { API_ENDPOINTS } from '../config/constants';

interface QuickSaleItem {
  id: number;
  quantity: number;
  price: number;
}

interface QuickSaleInput {
  items: QuickSaleItem[];
  customerId?: number;
  branchId: number;
  paymentMethod: string;
  paymentAmount: number;
}

const quickSaleService = {
  processQuickSale: async (data: QuickSaleInput) => {
    const response = await api.post(API_ENDPOINTS.QUICK_SALE.PROCESS, data);
    return response.data;
  },

  searchProducts: async (query: string, branchId: number, categoryId?: number | null) => {
    const response = await api.get(API_ENDPOINTS.QUICK_SALE.SEARCH_PRODUCTS, {
      params: {
        query,
        branchId,
        categoryId,
      },
    });
    return response.data;
  },

  getPopularProducts: async (branchId: number, categoryId?: number | null, showPopularOnly: boolean = false) => {
    const response = await api.get(API_ENDPOINTS.QUICK_SALE.POPULAR_PRODUCTS, {
      params: {
        branchId,
        categoryId,
        showPopularOnly
      },
    });
    return response.data;
  },

  validateBarcode: async (barcode: string, branchId: number) => {
    const response = await api.get(API_ENDPOINTS.QUICK_SALE.VALIDATE_BARCODE(barcode), {
      params: {
        branchId,
      },
    });
    return response.data;
  },
};

export default quickSaleService; 