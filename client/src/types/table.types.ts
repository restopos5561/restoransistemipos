export enum TableStatus {
  IDLE = 'IDLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED'
}

export interface Order {
  id: number;
  orderNumber: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
}

export interface Table {
  id: number;
  branchId: number;
  tableNumber: string;
  capacity?: number;
  location?: string;
  status: TableStatus;
  isActive: boolean;
  activeOrders?: Order[];
  branch?: {
    id: number;
    name: string;
  };
}

export interface CreateTableInput {
  branchId: number;
  tableNumber: string;
  capacity?: number;
  location?: string;
}

export interface UpdateTableInput {
  tableNumber?: string;
  capacity?: number;
  location?: string;
  isActive?: boolean;
}

export interface UpdateTableStatusInput {
  status: TableStatus;
}

export interface TableFilters {
  branchId?: number;
  restaurantId?: number;
  status?: TableStatus;
  location?: string;
  capacity?: number;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TablesResponse {
  success: boolean;
  data: {
    tables: Table[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TableResponse {
  success: boolean;
  data: Table;
}

export interface MergeTablesInput {
  mainTableId: number;
  tableIdsToMerge: number[];
}

export interface TransferTableInput {
  fromTableId: number;
  toTableId: number;
} 