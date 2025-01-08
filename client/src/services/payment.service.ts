import api from './api';

// Types
export interface CardPaymentParams {
  orderId: string;
  branchId: string;
  amount: number;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export interface CashPaymentParams {
  orderId: string;
  branchId: string;
  amount: number;
  receivedAmount: number;
  changeAmount: number;
}

export interface MealCardPaymentParams {
  orderId: string;
  branchId: string;
  amount: number;
}

const paymentService = {
  // Kredi kartı ile ödeme
  processCardPayment: async (params: CardPaymentParams) => {
    const response = await api.post('/payments/card', params);
    return response.data;
  },

  // Nakit ödeme
  processCashPayment: async (params: CashPaymentParams) => {
    const response = await api.post('/payments/cash', params);
    return response.data;
  },

  // Yemek kartı ile ödeme
  processMealCardPayment: async (params: MealCardPaymentParams) => {
    const response = await api.post('/payments/meal-card', params);
    return response.data;
  },

  // Ödeme detaylarını getir
  getPaymentDetails: async (paymentId: string) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  // Ödeme iptali
  cancelPayment: async (paymentId: string) => {
    const response = await api.post(`/payments/${paymentId}/cancel`);
    return response.data;
  }
};

export default paymentService; 