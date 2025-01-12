import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/bad-request-error';
import { UnauthorizedError } from '../errors/unauthorized-error';
import { TableOperationError, TableNotFoundError, TableValidationError } from '../errors/table-errors';
import { CustomError } from '../errors/custom-error';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message
      }
    });
  }

  console.error('❌ [ErrorHandler] Beklenmeyen hata:', err);

  res.status(500).json({
    success: false,
    error: {
      message: 'Bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  });
};
