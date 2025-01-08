import { Request, Response, NextFunction } from 'express';
import { PrinterError } from '../errors/printer.error';

export const printerErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof PrinterError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
  }
  next(error);
};
