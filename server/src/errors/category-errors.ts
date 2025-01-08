import { CustomError } from './custom-error';

export class CategoryNotFoundError extends CustomError {
  statusCode = 404;

  constructor(categoryId: number) {
    super(`Kategori bulunamadı: ${categoryId}`);
    Object.setPrototypeOf(this, CategoryNotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
