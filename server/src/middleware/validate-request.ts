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

      const normalizedBody = req.body.body || req.body;
      
      const dataToValidate = {
        body: normalizedBody,
        query: req.query,
        params: req.params,
      };

      console.log('Normalize edilmiş veri:', dataToValidate);

      const validatedData = await schema.parseAsync(dataToValidate);
      
      console.log('Validasyon sonrası veri:', validatedData);

      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;

      next();
    } catch (error) {
      console.error('Validasyon hatası:', error);

      if (error instanceof ZodError) {
        console.error('Zod validasyon hataları:', error.errors);

        const errorMessage = error.errors
          .map((err) => {
            const path = err.path.join('.');
            const message = err.message;
            const code = err.code;
            
            if (code === 'invalid_type') {
              return `${path}: Geçersiz veri tipi - beklenen: ${err.expected}, gelen: ${err.received}`;
            }
            if (code === 'invalid_enum_value') {
              return `${path}: Geçersiz değer - geçerli değerler: ${err.options?.join(', ')}`;
            }
            if (code === 'too_small') {
              return `${path}: Çok küçük değer - minimum: ${err.minimum}`;
            }
            if (code === 'too_big') {
              return `${path}: Çok büyük değer - maksimum: ${err.maximum}`;
            }

            return `${path}: ${message}`;
          })
          .join('\n');

        next(new BadRequestError(errorMessage));
      } else {
        console.error('Beklenmeyen validasyon hatası:', error);
        next(new BadRequestError('Validasyon işlemi başarısız oldu'));
      }
    }
  };
};
