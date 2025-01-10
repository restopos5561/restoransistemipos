import api from './api';
import { API_ENDPOINTS } from '../config/constants';
import { Customer } from '../types/customer.types';

interface CustomerListParams {
  search?: string;
  page?: number;
  limit?: number;
  branchId?: number;
  restaurantId?: number;
}

interface CustomerListResponse {
  success: boolean;
  data: {
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

const customersService = {
  getCustomers: async (params: CustomerListParams = {}): Promise<CustomerListResponse> => {
    try {
      console.debug('[MüşteriServisi] İstek başlatılıyor:', {
        ...params,
        restaurantId: params.restaurantId || localStorage.getItem('restaurantId')
      });

      if (!params.restaurantId) {
        const storedRestaurantId = localStorage.getItem('restaurantId');
        if (!storedRestaurantId) {
          console.error('[MüşteriServisi] RestaurantID bulunamadı');
          throw new Error('Restoran bilgisi bulunamadı');
        }
        params.restaurantId = Number(storedRestaurantId);
      }

      if (!params.branchId) {
        const storedBranchId = localStorage.getItem('branchId');
        if (!storedBranchId) {
          console.error('[MüşteriServisi] BranchID bulunamadı');
          throw new Error('Şube bilgisi bulunamadı');
        }
        params.branchId = Number(storedBranchId);
      }

      const response = await api.get<{ success: boolean; data: any }>(API_ENDPOINTS.CUSTOMERS.LIST, {
        params: {
          ...params,
          page: params.page || 1,
          limit: params.limit || 10
        }
      });

      console.debug('[MüşteriServisi] Ham yanıt:', response.data);

      // Backend yanıt kontrolü
      if (!response.data?.success) {
        console.error('[MüşteriServisi] Backend yanıtı başarısız:', response.data);
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }

      // Backend'den gelen veriyi düzenle
      const backendData = response.data.data;
      const customers = Array.isArray(backendData.customers) ? backendData.customers : [];
      
      console.debug('[MüşteriServisi] İşlenmiş veri:', {
        customerCount: customers.length,
        total: backendData.total,
        page: backendData.page
      });

      return {
        success: true,
        data: {
          customers,
          total: backendData.total || 0,
          page: backendData.page || params.page || 1,
          limit: backendData.limit || params.limit || 10,
          totalPages: backendData.totalPages || Math.ceil((backendData.total || 0) / (params.limit || 10))
        }
      };
    } catch (error: any) {
      console.error('[MüşteriServisi] Hata:', error);
      
      // API yanıt hatası detayları
      if (error.response) {
        console.error('[MüşteriServisi] API Hata Detayı:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });

        // Özel hata mesajları
        if (error.response.status === 401) {
          throw new Error('Oturum süresi dolmuş olabilir, lütfen tekrar giriş yapın');
        }
        if (error.response.status === 403) {
          throw new Error('Bu işlem için yetkiniz bulunmuyor');
        }
        if (error.response.status === 404) {
          throw new Error('İstenilen veriler bulunamadı');
        }
      }

      return {
        success: false,
        data: {
          customers: [],
          total: 0,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 0
        },
        error: error.message || 'Müşteri listesi alınırken bir hata oluştu'
      };
    }
  }
};

export default customersService; 