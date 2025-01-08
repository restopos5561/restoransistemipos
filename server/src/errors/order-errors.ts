import { CustomError } from './custom-error';

export class OrderNotFoundError extends CustomError {
  statusCode = 404;

  constructor(orderId: number) {
    super(`Sipariş bulunamadı: ${orderId}`);
    Object.setPrototypeOf(this, OrderNotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class OrderItemNotFoundError extends CustomError {
  statusCode = 404;

  constructor(itemId: number) {
    super(`Sipariş kalemi bulunamadı: ${itemId}`);
    Object.setPrototypeOf(this, OrderItemNotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class InvalidOrderStatusTransitionError extends CustomError {
  statusCode = 400;

  constructor(currentStatus: string, newStatus: string) {
    super(`Sipariş durumu ${currentStatus}'dan ${newStatus}'a güncellenemez`);
    Object.setPrototypeOf(this, InvalidOrderStatusTransitionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class OrderAlreadyCompletedError extends CustomError {
  statusCode = 400;

  constructor(orderId: number) {
    super(`Tamamlanmış sipariş güncellenemez: ${orderId}`);
    Object.setPrototypeOf(this, OrderAlreadyCompletedError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class OrderAlreadyCancelledError extends CustomError {
  statusCode = 400;

  constructor(orderId: number) {
    super(`İptal edilmiş sipariş güncellenemez: ${orderId}`);
    Object.setPrototypeOf(this, OrderAlreadyCancelledError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
