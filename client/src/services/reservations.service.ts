import api from '../utils/axios';
import { API_ENDPOINTS } from '../config/constants';
import {
  Reservation,
  CreateReservationInput,
  UpdateReservationInput,
  UpdateReservationStatusInput,
  ReservationFilters,
} from '../types/reservation.types';

class ReservationsService {
  async getReservations(filters: ReservationFilters = {}) {
    const restaurantId = localStorage.getItem('restaurantId');
    const branchId = localStorage.getItem('branchId');

    if (!restaurantId) {
      throw new Error('Restaurant ID bulunamadı');
    }

    if (!branchId) {
      throw new Error('Branch ID bulunamadı');
    }

    const params = {
      ...filters,
      restaurantId: Number(restaurantId),
      branchId: Number(branchId)
    };

    console.log('🔵 [ReservationsService] Rezervasyonlar getiriliyor:', { 
      params,
      endpoint: API_ENDPOINTS.RESERVATIONS.LIST
    });

    const response = await api.get(API_ENDPOINTS.RESERVATIONS.LIST, { params });

    console.log('✅ [ReservationsService] Ham backend yanıtı:', response.data);

    return response.data;
  }

  async getReservationById(id: number) {
    const response = await api.get(API_ENDPOINTS.RESERVATIONS.DETAIL(id.toString()));
    return response.data;
  }

  async createReservation(data: CreateReservationInput) {
    const response = await api.post(API_ENDPOINTS.RESERVATIONS.CREATE, data);
    return response.data;
  }

  async updateReservation(id: number, data: UpdateReservationInput) {
    const response = await api.put(API_ENDPOINTS.RESERVATIONS.UPDATE(id.toString()), data);
    return response.data;
  }

  async deleteReservation(id: number) {
    const response = await api.delete(API_ENDPOINTS.RESERVATIONS.DELETE(id.toString()));
    return response.data;
  }

  async updateReservationStatus(id: number, data: UpdateReservationStatusInput) {
    const response = await api.patch(API_ENDPOINTS.RESERVATIONS.STATUS(id.toString()), data);
    return response.data;
  }

  async getReservationsByDate(date: string) {
    const response = await api.get(API_ENDPOINTS.RESERVATIONS.BY_DATE(date));
    return response.data;
  }

  async getReservationsByCustomer(customerId: number) {
    const response = await api.get(API_ENDPOINTS.RESERVATIONS.BY_CUSTOMER(customerId.toString()));
    return response.data;
  }

  async getReservationsByTable(tableId: number) {
    const response = await api.get(API_ENDPOINTS.RESERVATIONS.BY_TABLE(tableId.toString()));
    return response.data;
  }

  async getReservationsByBranch(branchId: number) {
    const response = await api.get(API_ENDPOINTS.RESERVATIONS.BY_BRANCH(branchId.toString()));
    return response.data;
  }
}

export default new ReservationsService(); 