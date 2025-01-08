import { BaseError } from './base-error';

export class ReservationNotFoundError extends BaseError {
  constructor(id: number) {
    super(`Reservation with id ${id} not found`, 404);
  }
}

export class ReservationConflictError extends BaseError {
  constructor(message: string) {
    super(message, 409);
  }
}
