import api from './api';
import { API_ENDPOINTS } from '../config/constants';
import {
  Supplier,
  SupplierProduct,
  SupplierListResponse,
  CreateSupplierInput,
  UpdateSupplierInput,
  AddProductInput
} from '../types/supplier.types';

interface SupplierListParams {
  search?: string;
  page?: number;
  limit?: number;
  restaurantId?: number;
}

const suppliersService = {
  // Tedarikçileri listele
  getSuppliers: async (params: SupplierListParams = {}): Promise<SupplierListResponse> => {
    try {
      console.log('Servis - Tedarikçi listesi isteği:', params);
      
      const restaurantId = params.restaurantId || localStorage.getItem('restaurantId');
      if (!restaurantId) {
        throw new Error('Restaurant ID bulunamadı');
      }

      const response = await api.get(API_ENDPOINTS.SUPPLIERS.LIST, { 
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
      console.error('Servis - Tedarikçi listesi hatası:', error);
      throw new Error(error.response?.data?.message || 'Tedarikçi listesi alınırken bir hata oluştu');
    }
  },

  // Tedarikçi detayı getir
  getSupplierById: async (id: number): Promise<Supplier> => {
    try {
      console.log('Tedarikçi detayı getiriliyor - ID:', id);
      const response = await api.get(API_ENDPOINTS.SUPPLIERS.DETAIL(id.toString()));
      console.log('Backend yanıtı:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Tedarikçi detayı getirme hatası:', error);
      if (error.response?.status === 404) {
        throw new Error('Tedarikçi bulunamadı');
      }
      throw new Error('Tedarikçi detayı alınırken bir hata oluştu');
    }
  },

  // Yeni tedarikçi oluştur
  createSupplier: async (data: CreateSupplierInput): Promise<Supplier> => {
    try {
      const restaurantId = localStorage.getItem('restaurantId');
      if (!restaurantId) {
        throw new Error('Restaurant ID bulunamadı');
      }

      if (!data.name?.trim()) {
        throw new Error('Tedarikçi adı zorunludur');
      }

      const supplierData = {
        ...data,
        restaurantId: Number(restaurantId)
      };

      console.log('Tedarikçi oluşturma isteği:', supplierData);
      const response = await api.post(API_ENDPOINTS.SUPPLIERS.CREATE, supplierData);
      console.log('Backend yanıtı:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Tedarikçi oluşturma başarısız');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Tedarikçi oluşturma hatası:', error);
      throw new Error(error.response?.data?.message || 'Tedarikçi oluşturulurken bir hata oluştu');
    }
  },

  // Tedarikçi güncelle
  updateSupplier: async (id: number, data: UpdateSupplierInput): Promise<Supplier> => {
    try {
      console.log('Tedarikçi güncelleme isteği:', { id, data });

      if (data.name && !data.name.trim()) {
        throw new Error('Tedarikçi adı boş olamaz');
      }

      const response = await api.put(
        API_ENDPOINTS.SUPPLIERS.UPDATE(id.toString()), 
        data
      );

      console.log('Backend yanıtı:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Güncelleme başarısız');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Tedarikçi güncelleme hatası:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Tedarikçi bulunamadı');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Geçersiz güncelleme verisi');
      }
      if (error.response?.status === 403) {
        throw new Error('Bu işlem için yetkiniz yok');
      }

      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Tedarikçi güncellenirken bir hata oluştu'
      );
    }
  },

  // Tedarikçi sil
  deleteSupplier: async (id: number): Promise<boolean> => {
    try {
      console.log('Tedarikçi silme isteği - ID:', id);
      const response = await api.delete(API_ENDPOINTS.SUPPLIERS.DELETE(id.toString()));
      console.log('Backend yanıtı:', response);

      // Backend 204 dönüyor başarılı silme durumunda
      if (response.status === 204) {
        return true;
      }

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Silme işlemi başarısız');
      }

      return true;
    } catch (error: any) {
      console.error('Tedarikçi silme hatası:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Tedarikçi bulunamadı');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Geçersiz silme isteği');
      }
      if (error.response?.status === 403) {
        throw new Error('Bu işlem için yetkiniz yok');
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Tedarikçi silinirken bir hata oluştu'
      );
    }
  },

  // Tedarikçiye ürün ekle
  addProduct: async (supplierId: number, data: AddProductInput): Promise<SupplierProduct> => {
    try {
      console.log('Tedarikçiye ürün ekleme isteği:', { supplierId, data });
      const response = await api.post(
        API_ENDPOINTS.SUPPLIERS.ADD_PRODUCT(supplierId.toString()),
        data
      );
      console.log('Backend yanıtı:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Ürün ekleme başarısız');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Ürün ekleme hatası:', error);
      throw new Error(error.response?.data?.message || 'Ürün eklenirken bir hata oluştu');
    }
  },

  // Tedarikçinin ürünlerini getir
  getSupplierProducts: async (supplierId: number): Promise<SupplierProduct[]> => {
    try {
      console.log('Tedarikçi ürünleri getiriliyor - ID:', supplierId);
      const response = await api.get(API_ENDPOINTS.SUPPLIERS.PRODUCTS(supplierId.toString()));
      console.log('Backend yanıtı:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Tedarikçi ürünleri getirme hatası:', error);
      throw new Error('Tedarikçi ürünleri alınırken bir hata oluştu');
    }
  },

  // Ürüne göre tedarikçileri getir
  getSuppliersByProduct: async (productId: number): Promise<SupplierProduct[]> => {
    try {
      console.log('Ürüne göre tedarikçiler getiriliyor - Product ID:', productId);
      const response = await api.get(API_ENDPOINTS.SUPPLIERS.BY_PRODUCT(productId.toString()));
      console.log('Backend yanıtı:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Ürüne göre tedarikçi getirme hatası:', error);
      throw new Error('Ürüne göre tedarikçiler alınırken bir hata oluştu');
    }
  },

  // Ürün-tedarikçi ilişkisini sil
  removeProduct: async (productId: number, supplierId: number): Promise<void> => {
    try {
      console.log('Ürün-tedarikçi ilişkisi siliniyor:', { productId, supplierId });
      const response = await api.delete(
        API_ENDPOINTS.PRODUCT_SUPPLIERS.DELETE(productId.toString(), supplierId.toString())
      );
      console.log('Backend yanıtı:', response);

      if (response.status !== 204) {
        throw new Error('Silme işlemi başarısız');
      }
    } catch (error: any) {
      console.error('Ürün-tedarikçi ilişkisi silme hatası:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Ürün-tedarikçi ilişkisi bulunamadı');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Geçersiz silme isteği');
      }
      if (error.response?.status === 403) {
        throw new Error('Bu işlem için yetkiniz yok');
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Ürün-tedarikçi ilişkisi silinirken bir hata oluştu'
      );
    }
  }
};

export default suppliersService; 