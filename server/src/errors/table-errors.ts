export class TableNotFoundError extends Error {
  constructor(tableId: number) {
    super(`Table with id ${tableId} not found`);
    this.name = 'TableNotFoundError';
  }
}

export class TableOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TableOperationError';
  }
}

export class TableValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TableValidationError';
  }
}
