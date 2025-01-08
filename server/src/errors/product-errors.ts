export class ProductNotFoundError extends Error {
  constructor(id: number) {
    super(`Ürün bulunamadı: ${id}`);
    this.name = 'ProductNotFoundError';
  }
}
