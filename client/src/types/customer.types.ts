export interface Customer {
  id: number;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  restaurantId: number;
}

export interface CustomerListData {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerListResponse {
  success: boolean;
  data: CustomerListData;
}

export interface CustomerCreateInput {
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  restaurantId: number;
}

export interface CustomerUpdateInput extends Partial<CustomerCreateInput> {} 