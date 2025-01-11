export type StockTransactionType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';

export interface Stock {
  id: number;
  productId: number;
  branchId: number;
  quantity: number;
  lowStockThreshold: number | null;
  idealStockLevel: number | null;
  lastStockUpdate: Date;
  expirationDate?: Date;
  product: {
    id: number;
    name: string;
    unit: string;
    barcode?: string;
    suppliers?: Array<{
      supplierId: number;
      supplier: {
        id: number;
        name: string;
      };
      supplierProductCode?: string;
      lastPurchasePrice?: number;
      isPrimary: boolean;
    }>;
  };
  branch?: {
    name: string;
  };
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  type: StockTransactionType;
  date: Date;
  notes?: string;
  branchName: string;
  unit: string;
}

export interface StockListResponse {
  success: boolean;
  data: {
    stocks: Stock[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StockMovementsResponse {
  success: boolean;
  data: {
    movements: StockMovement[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StockFilters {
  productId?: number;
  restaurantId?: number;
  branchId?: number;
  lowStock?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface StockMovementFilters {
  restaurantId?: number;
  branchId?: number;
  productId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface UpdateStockQuantityInput {
  quantity: number;
  type: StockTransactionType;
  notes?: string;
}

export interface TransferStockInput {
  fromBranchId: number;
  toBranchId: number;
  productId: number;
  quantity: number;
  transferBy: number;
  notes?: string;
}

export interface StockCountInput {
  branchId: number;
  countedBy: number;
  countedDate: string;
  products: Array<{
    productId: number;
    countedQuantity: number;
    countedStockId: number;
  }>;
} 