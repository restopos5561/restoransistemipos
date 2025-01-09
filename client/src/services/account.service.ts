import axios from '../utils/axios';

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
    const response = await axios.get<{ success: boolean; data: { accounts: Account[] } }>(
      '/accounts',
      {
        params: { restaurantId }
      }
    );
    return response.data;
  }

  async getAccountById(id: number) {
    const restaurantId = this.getRestaurantId();
    const response = await axios.get<{ success: boolean; data: Account }>(
      `/accounts/${id}`,
      {
        params: { restaurantId }
      }
    );
    return response.data;
  }

  async createAccount(data: CreateAccountInput) {
    const restaurantId = this.getRestaurantId();
    const response = await axios.post<{ success: boolean; data: Account }>(
      '/accounts',
      { ...data, restaurantId }
    );
    return response.data;
  }

  async updateAccount(id: number, data: Partial<CreateAccountInput>) {
    const restaurantId = this.getRestaurantId();
    const response = await axios.put<{ success: boolean; data: Account }>(
      `/accounts/${id}`,
      data,
      {
        params: { restaurantId }
      }
    );
    return response.data;
  }

  async deleteAccount(id: number) {
    const restaurantId = this.getRestaurantId();
    const response = await axios.delete<{ success: boolean }>(
      `/accounts/${id}`,
      {
        params: { restaurantId }
      }
    );
    return response.data;
  }

  // İşlem işlemleri
  async getAccountTransactions(accountId: number) {
    const restaurantId = this.getRestaurantId();
    const response = await axios.get<{ success: boolean; data: { transactions: AccountTransaction[] } }>(
      `/accounts/transactions/account/${accountId}`,
      {
        params: { restaurantId }
      }
    );
    return response.data;
  }

  async createTransaction(data: CreateTransactionInput) {
    const restaurantId = this.getRestaurantId();
    const response = await axios.post<{ success: boolean; data: AccountTransaction }>(
      '/accounts/transactions',
      { ...data, restaurantId }
    );
    return response.data;
  }
}

export default new AccountService(); 