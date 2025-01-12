import { ReservationStatus } from './enums';

export interface Reservation {
  id: number;
  restaurantId: number;
  customerId: number;
  branchId: number;
  tableId?: number;
  reservationStartTime: string;
  reservationEndTime: string;
  partySize: number;
  notes?: string;
  status: ReservationStatus;
  cancellationReason?: string;
  customer?: {
    id: number;
    name: string;
  };
  table?: {
    id: number;
    tableNumber: string;
  };
}

export interface CreateReservationInput {
  restaurantId: number;
  customerId: number;
  branchId: number;
  tableId?: number;
  reservationStartTime: string;
  reservationEndTime: string;
  partySize: number;
  notes?: string;
  status: ReservationStatus;
}

export interface UpdateReservationInput {
  tableId?: number;
  reservationStartTime?: string;
  reservationEndTime?: string;
  partySize?: number;
  notes?: string;
}

export interface UpdateReservationStatusInput {
  status: ReservationStatus;
  cancellationReason?: string;
}

export interface ReservationFilters {
  customerId?: number;
  tableId?: number;
  branchId?: number;
  date?: string;
  status?: ReservationStatus;
  page?: number;
  limit?: number;
}

export interface UpdateReservationResponse {
  success: boolean;
  data: Reservation;
}

export interface CreateReservationResponse {
  success: boolean;
  data: Reservation;
} 