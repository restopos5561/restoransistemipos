import { CustomError } from './custom-error';

export class OptionGroupNotFoundError extends CustomError {
  statusCode = 404;

  constructor(id: number) {
    super(`Seçenek grubu bulunamadı: ${id}`);
    Object.setPrototypeOf(this, OptionGroupNotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class OptionNotFoundError extends CustomError {
  statusCode = 404;

  constructor(id: number) {
    super(`Seçenek bulunamadı: ${id}`);
    Object.setPrototypeOf(this, OptionNotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class InvalidOptionGroupError extends CustomError {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidOptionGroupError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
} 