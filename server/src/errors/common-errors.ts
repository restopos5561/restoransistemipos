import { BaseError } from './base-error';

export class BadRequestError extends BaseError {
  constructor(message: string | number) {
    const errorMessage =
      typeof message === 'number' ? `Record with id ${message} not found` : message;
    super(errorMessage, 400);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string) {
    super(message, 409);
  }
}
