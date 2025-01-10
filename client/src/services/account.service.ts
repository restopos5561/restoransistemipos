import api from './api';
import { API_ENDPOINTS } from '../config/constants';

// Backend'deki enum tiplerini tanımla
export type AccountType = 'SUPPLIER' | 'CUSTOMER' | 'REVENUE' | 'EXPENSE';
export type TransactionType = 'CREDIT' | 'DEBIT';

export interface Account {
  id: number;
  restaurantId: number;
  accountName: string;
  accountType: AccountType;
  balance: number;
  creditLimit?: number;
  supplierId?: number;
  customerId?: number;
  createdAt?: string;
  updatedAt?: string;
  transactions?: AccountTransaction[];
  supplier?: any;
  customer?: any;
}

export interface AccountTransaction {
  id: number;
  accountId: number;
  amount: number;
  type: TransactionType;
  description?: string;
  date: string;
}

export interface CreateAccountInput {
  restaurantId: number;
  accountName: string;
  accountType: AccountType;
  creditLimit?: number;
  supplierId?: number;
  customerId?: number;
}

export interface CreateTransactionInput {
  accountId: number;
  amount: number;
  type: TransactionType;
  description?: string;
}

class AccountService {
  private getRestaurantId() {
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) {
      throw new Error('Restaurant ID bulunamadı');
    }
    return Number(restaurantId);
  }

  // Hesap işlemleri
  async getAccounts() {
    const restaurantId = this.getRestaurantId();
    const response = await api.get<{ success: boolean; data: { accounts: Account[] } }>(
      API_ENDPOINTS.ACCOUNTS.LIST,
      {
        params: { restaurantId }
      }
    );
    return response.data;
  }

  async getAccountById(id: number) {
    const restaurantId = this.getRestaurantId();
    const response = await api.get<{ success: boolean; data: Account }>(
      API_ENDPOINTS.ACCOUNTS.DETAIL(id.toString()),
      {
        params: { restaurantId }
      }
    );
    return response.data;
  }

  async createAccount(data: CreateAccountInput) {
    const restaurantId = this.getRestaurantId();
    const response = await api.post<{ success: boolean; data: Account }>(
      API_ENDPOINTS.ACCOUNTS.CREATE,
      { ...data, restaurantId }
    );
    return response.data;
  }

  async updateAccount(id: number, data: Partial<CreateAccountInput>) {
    const restaurantId = this.getRestaurantId();
    const response = await api.put<{ success: boolean; data: Account }>(
      API_ENDPOINTS.ACCOUNTS.UPDATE(id.toString()),
      data,
      {
        params: { restaurantId }
      }
    );
    return response.data;
  }

  async deleteAccount(id: number) {
    const restaurantId = this.getRestaurantId();
    const response = await api.delete<{ success: boolean }>(
      API_ENDPOINTS.ACCOUNTS.DELETE(id.toString()),
      {
        params: { restaurantId }
      }
    );
    return response.data;
  }

  // İşlem işlemleri
  async getAccountTransactions(accountId: number) {
    const restaurantId = this.getRestaurantId();
    const response = await api.get<{ success: boolean; data: { transactions: AccountTransaction[] } }>(
      API_ENDPOINTS.ACCOUNTS.TRANSACTIONS.LIST(accountId.toString()),
      {
        params: { restaurantId }
      }
    );
    return response.data;
  }

  async createTransaction(data: CreateTransactionInput) {
    const restaurantId = this.getRestaurantId();
    const response = await api.post<{ success: boolean; data: AccountTransaction }>(
      API_ENDPOINTS.ACCOUNTS.TRANSACTIONS.CREATE,
      { ...data, restaurantId }
    );
    return response.data;
  }
}

export default new AccountService(); 