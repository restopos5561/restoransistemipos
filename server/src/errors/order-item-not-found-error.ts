import { CustomError } from './custom-error';

export class OrderItemNotFoundError extends CustomError {
  statusCode = 404;

  constructor(id: number) {
    super(`Sipariş kalemi bulunamadı: ${id}`);
    Object.setPrototypeOf(this, OrderItemNotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
