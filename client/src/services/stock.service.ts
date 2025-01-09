import api from './api';
import { API_ENDPOINTS } from '../config/api.endpoints';
import {
  Stock,
  StockListResponse,
  StockMovementsResponse,
  StockFilters,
  StockMovementFilters,
  UpdateStockQuantityInput,
  TransferStockInput,
  StockCountInput,
} from '../types/stock.types';

const stockService = {
  // Stokları getir
  getStocks: async (filters: StockFilters = {}) => {
    const response = await api.get<StockListResponse>(API_ENDPOINTS.STOCKS.LIST, {
      params: {
        ...filters,
        restaurantId: filters.restaurantId || localStorage.getItem('restaurantId'),
      },
    });
    return response.data;
  },

  // Stok detayını getir
  getStockById: async (id: number) => {
    const response = await api.get(API_ENDPOINTS.STOCKS.DETAIL(id.toString()));
    return response.data;
  },

  // Stok geçmişini getir
  getStockHistory: async (id: number) => {
    const response = await api.get(API_ENDPOINTS.STOCKS.HISTORY(id.toString()));
    return response.data;
  },

  // Stok miktarını güncelle
  updateStockQuantity: async (id: number, data: UpdateStockQuantityInput) => {
    const response = await api.patch(API_ENDPOINTS.STOCKS.UPDATE_QUANTITY(id.toString()), data);
    return response.data;
  },

  // Stok hareketlerini getir
  getStockMovements: async (filters: StockMovementFilters = {}) => {
    const response = await api.get<StockMovementsResponse>(API_ENDPOINTS.STOCKS.MOVEMENTS, {
      params: {
        ...filters,
        restaurantId: filters.restaurantId || localStorage.getItem('restaurantId'),
      },
    });
    return response.data;
  },

  // Son kullanma tarihi yaklaşan stokları getir
  getExpiringStock: async (daysToExpiration: number, filters: Partial<StockFilters> = {}) => {
    const response = await api.get(API_ENDPOINTS.STOCKS.EXPIRING, {
      params: {
        ...filters,
        daysToExpiration,
        restaurantId: filters.restaurantId || localStorage.getItem('restaurantId'),
      },
    });
    return response.data;
  },

  // Stok transferi yap
  transferStock: async (data: TransferStockInput) => {
    const response = await api.post(API_ENDPOINTS.STOCKS.TRANSFER, {
      ...data,
      restaurantId: localStorage.getItem('restaurantId'),
    });
    return response.data;
  },

  // Stok sayımı oluştur
  createStockCount: async (data: StockCountInput) => {
    try {
      const response = await api.post(API_ENDPOINTS.STOCKS.COUNT, {
        ...data,
        restaurantId: localStorage.getItem('restaurantId'),
      });

      // API yanıtını kontrol et
      if (!response.data) {
        throw new Error('API yanıtı boş');
      }

      // Başarı durumunu kontrol et
      if (!response.data.success) {
        throw new Error(response.data.message || 'Sayım işlemi başarısız oldu');
      }

      // Rapor verilerini kontrol et
      if (!response.data.data) {
        throw new Error('Rapor verileri alınamadı');
      }

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Stok sayımı hatası:', error);
      throw error;
    }
  },

  // Düşük stokları getir
  getLowStock: async (filters: Partial<StockFilters> = {}) => {
    const response = await api.get(API_ENDPOINTS.STOCKS.LOW, {
      params: {
        ...filters,
        restaurantId: filters.restaurantId || localStorage.getItem('restaurantId'),
      },
    });
    return response.data;
  },
};

export default stockService; 