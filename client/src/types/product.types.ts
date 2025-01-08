export interface Product {
  id: number;
  restaurantId: number;
  name: string;
  description?: string;
  price: number;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
  };
  stocks?: {
    id: number;
    quantity: number;
    branchId: number;
  }[];
  isActive: boolean;
  preparationTime?: number;
  stockTracking: boolean;
}

export interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  value: string;
  priceAdjustment?: number;
}

export interface ProductOptionGroup {
  id: number;
  productId: number;
  name: string;
  isRequired: boolean;
  minQuantity: number;
  maxQuantity: number;
  options: ProductOption[];
}

export interface ProductOption {
  id: number;
  optionGroupId: number;
  name: string;
  priceAdjustment: number;
}

export interface ProductListResponse {
  success: boolean;
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface ProductListFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
} 