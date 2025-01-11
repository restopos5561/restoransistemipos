export interface Supplier {
  id: number;
  restaurantId: number;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  taxOffice?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierProduct {
  supplierId: number;
  productId: number;
  supplierProductCode?: string;
  lastPurchasePrice?: number;
  isPrimary: boolean;
  supplier: {
    id: number;
    name: string;
  };
  product: {
    id: number;
    name: string;
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
  address?: string;
  taxNumber?: string;
  taxOffice?: string;
  notes?: string;
}

export interface UpdateSupplierInput {
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  taxOffice?: string;
  notes?: string;
  isActive?: boolean;
}

export interface AddProductInput {
  productId: number;
  supplierProductCode?: string;
  lastPurchasePrice?: number;
  isPrimary?: boolean;
} 