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
    const response = await api.get(API_ENDPOINTS.CUSTOMERS.LIST, { 
      params: {
        ...params,
        restaurantId: params.restaurantId || localStorage.getItem('restaurantId')
      }
    });
    return response.data;
  },

  // Get a single customer by ID
  getCustomerById: async (id: number) => {
    const response = await api.get(API_ENDPOINTS.CUSTOMERS.DETAIL(id.toString()));
    return response.data;
  },

  // Create a new customer
  createCustomer: async (data: any) => {
    const response = await api.post(API_ENDPOINTS.CUSTOMERS.CREATE, {
      ...data,
      restaurantId: data.restaurantId || localStorage.getItem('restaurantId')
    });
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
    const response = await api.delete(API_ENDPOINTS.CUSTOMERS.DELETE(id.toString()));
    return response.data;
  },

  // Get customer orders
  getCustomerOrders: async (id: number, params: { page?: number; limit?: number } = {}) => {
    const response = await api.get(API_ENDPOINTS.CUSTOMERS.ORDERS(id.toString()), { params });
    return response.data;
  },

  // Get customer reservations
  getCustomerReservations: async (id: number, params: { page?: number; limit?: number } = {}) => {
    const response = await api.get(API_ENDPOINTS.CUSTOMERS.RESERVATIONS(id.toString()), { params });
    return response.data;
  }
};

export default customersService; 