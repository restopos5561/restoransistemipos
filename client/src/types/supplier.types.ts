export interface Supplier {
  id: number;
  restaurantId: number;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProduct {
  id: number;
  supplierId: number;
  productId: number;
  isPrimary: boolean;
  lastPurchasePrice?: number | null;
  supplierProductCode?: string | null;
  product: {
    id: number;
    name: string;
    description?: string | null;
    price: number;
  };
}

export interface SupplierListResponse {
  suppliers: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateSupplierInput {
  restaurantId: number;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
}

export interface UpdateSupplierInput {
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
}

export interface AddProductInput {
  productId: number;
  isPrimary?: boolean;
  lastPurchasePrice?: number;
  supplierProductCode?: string;
} 