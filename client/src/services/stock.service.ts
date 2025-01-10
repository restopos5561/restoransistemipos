import api from './api';
import { API_ENDPOINTS } from '../config/constants';
import { StockFilters, StockListResponse, UpdateStockQuantityInput } from '../types/stock.types';

class StockService {
  async getStocks(filters: StockFilters): Promise<StockListResponse> {
    const response = await api.get(API_ENDPOINTS.STOCKS.LIST, { params: filters });
    return response.data;
  }

  async getStockById(id: number): Promise<StockListResponse> {
    const response = await api.get(API_ENDPOINTS.STOCKS.DETAIL(id.toString()));
    return response.data;
  }

  async getStockHistory(id: number): Promise<any> {
    const response = await api.get(API_ENDPOINTS.STOCKS.HISTORY(id.toString()));
    return response.data;
  }

  async updateStockQuantity(id: number, data: UpdateStockQuantityInput): Promise<StockListResponse> {
    const response = await api.patch(API_ENDPOINTS.STOCKS.UPDATE_QUANTITY(id.toString()), data);
    return response.data;
  }

  async getStockMovements(filters: any = {}): Promise<any> {
    const response = await api.get(API_ENDPOINTS.STOCKS.MOVEMENTS, { params: filters });
    return response.data;
  }

  async getExpiringStocks(filters: any = {}): Promise<any> {
    const response = await api.get(API_ENDPOINTS.STOCKS.EXPIRING, { params: filters });
    return response.data;
  }

  async transferStock(data: any): Promise<any> {
    const response = await api.post(API_ENDPOINTS.STOCKS.TRANSFER, data);
    return response.data;
  }

  async countStock(data: any): Promise<any> {
    const response = await api.post(API_ENDPOINTS.STOCKS.COUNT, data);
    return response.data;
  }

  async getLowStocks(filters: any = {}): Promise<any> {
    const response = await api.get(API_ENDPOINTS.STOCKS.LOW, { params: filters });
    return response.data;
  }
}

export default new StockService(); 