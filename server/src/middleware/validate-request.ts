import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../errors/common-errors';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Ham gelen veri:', {
        body: req.body,
        query: req.query,
        params: req.params,
      });

      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      console.log('Validasyon sonrası veri:', validatedData);

      // Validated verileri request'e ata
      req.body = validatedData.body;
      req.query = validatedData.query as any;
      req.params = validatedData.params as any;

      next();
    } catch (error) {
      console.error('Validasyon hatası:', error);

      if (error instanceof ZodError) {
        const errorMessage = error.errors
          .map((err) => {
            const path = err.path.join('.');
            return `${path}: ${err.message}`;
          })
          .join(', ');

        return res.status(400).json({
          success: false,
          message: 'Validasyon hatası',
          errors: errorMessage
        });
      }

      next(error);
    }
  };
};
