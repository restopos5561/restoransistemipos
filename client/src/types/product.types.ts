export interface Product {
  id: number;
  restaurantId: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
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
  unit?: string;
  taxRate?: number;
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
  name: string;
  isRequired: boolean;
  minQuantity: number;
  maxQuantity: number;
  options: ProductOption[];
}

export interface ProductOption {
  id: number;
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

export interface PriceHistory {
  id: number;
  productId: number;
  oldPrice: number;
  newPrice: number;
  startDate: string;
}

export interface PriceHistoryResponse {
  success: boolean;
  data: PriceHistory[];
}

export interface ProductVariantResponse {
  success: boolean;
  data: ProductVariant[];
}

export interface ProductVariantInput {
  name: string;
  value: string;
  priceAdjustment?: number;
}

export interface ProductOptionGroupResponse {
  success: boolean;
  data: ProductOptionGroup[];
}

export interface ProductOptionGroupInput {
  name: string;
  isRequired: boolean;
  minQuantity: number;
  maxQuantity: number;
}

export interface ProductOptionInput {
  optionGroupId: number;
  name: string;
  priceAdjustment: number;
} 