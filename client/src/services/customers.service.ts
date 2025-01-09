import api from './api';
import { API_ENDPOINTS } from '../config/constants';

interface CustomerListParams {
  search?: string;
  page?: number;
  limit?: number;
  branchId?: number;
  restaurantId?: number;
}

const customersService = {
  // Get all customers with optional filtering
  getCustomers: async (params: CustomerListParams = {}) => {
    try {
      console.log('Servis - Müşteri listesi isteği:', params);
      
      const restaurantId = params.restaurantId || localStorage.getItem('restaurantId');
      if (!restaurantId) {
        throw new Error('Restaurant ID bulunamadı');
      }

      const response = await api.get(API_ENDPOINTS.CUSTOMERS.LIST, { 
        params: {
          ...params,
          restaurantId: Number(restaurantId)
        }
      });

      console.log('Servis - Backend yanıtı:', response.data);

      if (!response.data?.success) {
        throw new Error('API yanıtı başarısız');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Servis - Müşteri listesi hatası:', error);
      throw new Error(error.response?.data?.message || 'Müşteri listesi alınırken bir hata oluştu');
    }
  },

  // Get a single customer by ID
  getCustomerById: async (id: number) => {
    try {
      console.log('Müşteri detayı getiriliyor - ID:', id);
      const response = await api.get(API_ENDPOINTS.CUSTOMERS.DETAIL(id.toString()));
      console.log('Backend yanıtı:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Müşteri detayı getirme hatası:', error);
      if (error.response?.status === 404) {
        throw new Error('Cari bulunamadı');
      }
      throw new Error('Cari detayı alınırken bir hata oluştu');
    }
  },

  // Create a new customer
  createCustomer: async (data: any) => {
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) {
      throw new Error('Restaurant ID bulunamadı');
    }

    if (!data.name?.trim()) {
      throw new Error('İsim alanı zorunludur');
    }

    const customerData = {
      name: data.name.trim(),
      email: data.email || null,
      phoneNumber: data.phoneNumber || null,
      address: data.address || null,
      restaurantId: Number(restaurantId)
    };

    const response = await api.post(API_ENDPOINTS.CUSTOMERS.CREATE, customerData);
    return response.data;
  },

  // Update a customer
  updateCustomer: async (id: number, data: any) => {
    const response = await api.put(API_ENDPOINTS.CUSTOMERS.UPDATE(id.toString()), {
      ...data,
      restaurantId: data.restaurantId || localStorage.getItem('restaurantId')
    });
    return response.data;
  },

  // Delete a customer
  deleteCustomer: async (id: number) => {
    try {
      console.log('Backend silme isteği gönderiliyor - ID:', id);
      const response = await api.delete(API_ENDPOINTS.CUSTOMERS.DELETE(id.toString()));
      console.log('Backend yanıtı:', response);

      // Backend 204 (No Content) dönüyor başarılı silme durumunda
      if (response.status === 204) {
        return true;
      }

      // Eğer başka bir durum kodu dönerse ve success false ise hata fırlat
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Silme işlemi başarısız');
      }

      return true;
    } catch (error: any) {
      console.error('Backend silme hatası:', error);
      
      // Özel hata durumlarını kontrol et
      if (error.response?.status === 404) {
        throw new Error('Cari bulunamadı');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Geçersiz silme isteği');
      }
      if (error.response?.status === 403) {
        throw new Error('Bu işlem için yetkiniz yok');
      }
      
      // Genel hata durumu
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Cari silinirken bir hata oluştu'
      );
    }
  },

  // Get customer orders
  getCustomerOrders: async (id: number, params: { page?: number; limit?: number } = {}) => {
    try {
      console.log('Müşteri siparişleri getiriliyor - ID:', id);
      const response = await api.get(API_ENDPOINTS.CUSTOMERS.ORDERS(id.toString()), { params });
      console.log('Backend yanıtı:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Sipariş getirme hatası:', error);
      throw new Error('Siparişler alınırken bir hata oluştu');
    }
  },

  // Get customer reservations
  getCustomerReservations: async (id: number, params: { page?: number; limit?: number } = {}) => {
    try {
      console.log('Müşteri rezervasyonları getiriliyor - ID:', id);
      const response = await api.get(API_ENDPOINTS.CUSTOMERS.RESERVATIONS(id.toString()), { params });
      console.log('Backend yanıtı:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Rezervasyon getirme hatası:', error);
      throw new Error('Rezervasyonlar alınırken bir hata oluştu');
    }
  }
};

export default customersService; 