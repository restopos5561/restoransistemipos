import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/bad-request-error';
import { UnauthorizedError } from '../errors/unauthorized-error';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof BadRequestError) {
    return res.status(err.statusCode).json(err.serializeErrors());
  }

  if (err instanceof UnauthorizedError) {
    return res.status(err.statusCode).json(err.serializeErrors());
  }

  console.error(err);

  res.status(500).json({
    success: false,
    message: 'Something went wrong',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : null,
    },
  });
};
