import api from './api';
import { API_ENDPOINTS } from '../config/constants';

interface Product {
  id: number;
  name: string;
  price: number;
  barcode?: string;
  category?: {
    id: number;
    name: string;
  };
  stocks?: {
    quantity: number;
  }[];
}

interface QuickSaleItem {
  productId: number;
  quantity: number;
  note?: string;
}

interface QuickSaleInput {
  branchId: number;
  restaurantId: number;
  items: QuickSaleItem[];
  customerId?: number;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MEAL_CARD';
  receivedAmount?: number;
  cardPayment?: {
    cardType: string;
    lastFourDigits: string;
    transactionId?: string;
  };
}

class QuickSaleService {
  async processQuickSale(data: QuickSaleInput) {
    const response = await api.post(API_ENDPOINTS.QUICK_SALE.PROCESS, data);
    return response.data;
  }

  async searchProducts(query: string, branchId: number): Promise<Product[]> {
    const response = await api.get(API_ENDPOINTS.QUICK_SALE.SEARCH_PRODUCTS, {
      params: { q: query, branchId }
    });
    return response.data;
  }

  async getPopularProducts(branchId: number, limit?: number): Promise<Product[]> {
    const response = await api.get(API_ENDPOINTS.QUICK_SALE.POPULAR_PRODUCTS, {
      params: { branchId, limit }
    });
    return response.data;
  }

  async validateBarcode(barcode: string, branchId: number): Promise<Product> {
    const response = await api.get(API_ENDPOINTS.QUICK_SALE.VALIDATE_BARCODE(barcode), {
      params: { branchId }
    });
    return response.data;
  }
}

export default new QuickSaleService(); 