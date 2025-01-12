import { CustomError } from './custom-error';

export class TableNotFoundError extends CustomError {
  statusCode = 404;

  constructor(tableId: number) {
    super(`Masa bulunamadı: ${tableId}`);
    Object.setPrototypeOf(this, TableNotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class TableOperationError extends CustomError {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TableOperationError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class TableValidationError extends CustomError {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TableValidationError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
