export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  ITEM_ISSUE = 'ITEM_ISSUE',
  PARTIALLY_PAID = 'PARTIALLY_PAID'
}

export enum OrderSource {
  IN_STORE = 'IN_STORE',
  PACKAGE = 'PACKAGE',
  ONLINE = 'ONLINE'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  VOUCHER = 'VOUCHER',
  OTHER = 'OTHER',
  GIFT_CERTIFICATE = 'GIFT_CERTIFICATE',
  LOYALTY_POINTS = 'LOYALTY_POINTS'
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
} 